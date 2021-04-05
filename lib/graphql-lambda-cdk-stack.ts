import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from '@aws-cdk/aws-apigateway';

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
  }
}
