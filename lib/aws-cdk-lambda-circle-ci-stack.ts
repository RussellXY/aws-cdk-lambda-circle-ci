import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import {
  Stack,
  StackProps,
  aws_s3 as s3,
  aws_dynamodb as dynamodb,
  //update the existing import to add aws_lambda and Duration
  aws_lambda as lambda,
  Duration
} from 'aws-cdk-lib';

export class AwsCdkLambdaCircleCiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const circleCiGwpBucket = new s3.Bucket(this, "circle-ci-gwp-bucket", {
      bucketName: "learning-test-bucket-2"
    });

    const circleCiGwpTable = new dynamodb.Table(this, "CircleCIGwpTable", {
      tableName: "CircleCIGwpTable",
      partitionKey: {name: "jobId", type: dynamodb.AttributeType.STRING},
    });

    const circleCiGwpLambda = new lambda.Function(
      this,
      "CircleCiGwpLambda",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "index.handler",
        timeout: Duration.seconds(30),
        code: lambda.Code.fromAsset("lambda/"),
        environment: {
          TABLE_NAME: circleCiGwpTable.tableName,
          BUCKET_NAME: circleCiGwpBucket.bucketName
        },
      }
    );

    circleCiGwpBucket.grantPut(circleCiGwpLambda);
    circleCiGwpTable.grantReadWriteData(circleCiGwpLambda);
  }
}
