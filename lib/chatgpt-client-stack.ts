import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { ApiKeySourceType } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as path from 'path';

export class ChatgptClientStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'IntraQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // const lambdaFunction = new NodejsFunction(this, 'IntraLambda', {
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   entry: path.join(__dirname, '../../api/src/index.ts'),
    //   handler: 'handler',
    //   timeout: cdk.Duration.minutes(3),
    // });

    // const lambdaLayer = new LayerVersion(this, 'HandlerLayer', {
    //   code: Code.fromAsset(path.resolve(__dirname, '../../api/dist/node_modules')),
    //   compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
    //   description: 'Api Handler Dependencies',
    // });

    // add handler to respond to all our api requests
    //     const handler = new Function(this, 'Handler', {
    //       code: Code.fromAsset(path.resolve(__dirname, '../../api/src'), {
    //         exclude: ['node_modules'],
    //       }),
    //       handler: 'dist/api/src/index.handler',
    //       runtime: Runtime.NODEJS_18_X,
    //       layers: [lambdaLayer],
    //     });

    const lambdaFunction = new NodejsFunction(this, 'chatGptLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../src/index.ts'),
      handler: 'handler',
      timeout: cdk.Duration.minutes(3),
      // layers: [lambdaLayer],
      bundling: {
        tsconfig: path.join(__dirname, '../tsconfig.json'),
        // nodeModules: ['@nestjs/core'],
        // externalModules: ['class-validator', '@nestjs/*'],
      },
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      }
    });

    const apiGateway = new apigateway.LambdaRestApi(this, 'chatGptApigw', {
      handler: lambdaFunction,
      proxy: true,
      restApiName: 'chatGptApi',
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    apiGateway.root.addResource('chat');
    apiGateway.root.addResource('list');
  }
}
