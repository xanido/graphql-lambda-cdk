# Serverless Apollo Server
> Deployed to AWS with CDK, running on Lambda backed by DynamoDB

## Running locally
This app can be run locally for ease of development & debugging.

### Install localstack
Running locally requires [localstack](https://github.com/localstack/localstack).

1. Install [`localstack`](https://github.com/localstack/localstack)
```bash
$ pip3 install localstack
```

2. Install [`localcdk`](https://github.com/localstack/aws-cdk-local) (a wrapper for cdk that simplifies deployment of cdk stacks to localstack)
```bash
$ yarn global add aws-cdk-local
```

3. Install [`awslocal`](https://github.com/localstack/awscli-local) (a wrapper for AWS cli that simplifies management of localstack resources)
```bash
$ pip3 install awscli-local
```

### Running localstack
1. Start localstack:
```bash
$ DEBUG=1 SERVICES=serverless,dynamodb localstack start
```

2. Then, in a seperate terminal, bootstrap localstack (creates the staging area buckets, roles etc)
```bash
$ cdklocal bootstrap
```

3. Deploy the stack:
```bash
$ cdklocal deploy --require-approval never
```

4. To re-deploy the stack when either the stack definition or the app code changes, run
```bash
$ yarn watch:local
```

TODO: orchestrate localstack with `docker-compose`




# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
