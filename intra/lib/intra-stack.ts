import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as path from 'path';

export class IntraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'IntraQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const lambdaFunction = new NodejsFunction(this, 'IntraLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../../api/src/index.ts'),
      handler: 'handler',
      timeout: cdk.Duration.minutes(3),
    });
  }
}
