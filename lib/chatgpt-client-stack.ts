import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { ApiKeySourceType } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as path from 'path';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class ChatgptClientStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const QueueName = 'ChannelMessageQueue.fifo';
    const queue = new sqs.Queue(this, 'messageEventQueue', {
      encryption: sqs.QueueEncryption.KMS_MANAGED,
      queueName: QueueName,
      fifo: true,
      contentBasedDeduplication: true,
      visibilityTimeout: cdk.Duration.minutes(2),
    });

    const lambdaFunction = new NodejsFunction(this, 'chatGptLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../src/index.ts'),
      handler: 'apiHandler',
      bundling: {
        tsconfig: path.join(__dirname, '../tsconfig.json'),
      },
      environment: {
        SQS_QUEUE_URL: queue.queueUrl,
      },
    });
    const sqsSendMessagePolicy = new PolicyStatement({
      actions: ['sqs:sendmessage'],
      resources: [queue.queueArn],
    });

    lambdaFunction.role?.attachInlinePolicy(
      new Policy(this, 'sqs-send-message-policy', {
        statements: [sqsSendMessagePolicy],
      }),
    );
    const consumer = new NodejsFunction(this, 'consumerLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../src/index.ts'),
      handler: 'consumerHandler',
      bundling: {
        tsconfig: path.join(__dirname, '../tsconfig.json'),
      },
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
        CHANNEL_CALLBACK_URL: process.env.CHANNEL_CALLBACK_URL || '',
        ENDPOINT_SECRET: process.env.ENDPOINT_SECRET || '',
      }
    });
    consumer.addEventSource(new SqsEventSource(queue, { batchSize: 1}));

    const apiGateway = new apigateway.LambdaRestApi(this, 'chatGptApigw', {
      handler: lambdaFunction,
      proxy: false,
      restApiName: 'chatGptApi',
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    const handlerIntegration= new apigateway.LambdaIntegration(lambdaFunction);

    const chat = apiGateway.root.addResource('chat');
    chat.addMethod('POST', handlerIntegration, {apiKeyRequired: true});
    const list = apiGateway.root.addResource('list');
    list.addMethod('GET', handlerIntegration, {apiKeyRequired: true});
  }
}
