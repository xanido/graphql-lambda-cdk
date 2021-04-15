import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';

import { Cdn } from './cdn';

export class GraphqlLambdaCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'DataTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
    });

    const fn = new lambdaNode.NodejsFunction(this, 'graphql', {
      entry: 'src/graphql.ts',
      handler: 'graphqlHandler',
      environment: {
        TABLE: table.tableName,
      },
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(10),
    });

    table.grantReadWriteData(fn);

    const gateway = new apigateway.LambdaRestApi(this, 'gateway', {
      handler: fn,
    });

    const bucket = new s3.Bucket(this, 'testbucket', {
      publicReadAccess: true
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./src/bucket')],
      destinationBucket: bucket,
      destinationKeyPrefix: 'web/static', // optional prefix in destination bucket
    });

    new Cdn(this, 'cdn', {
      domainName: 'aws.xanido.net',
      bucket,
      gateway,
    });
    


  }
}
