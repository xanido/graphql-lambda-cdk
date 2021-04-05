import { ApolloServer, gql } from 'apollo-server-lambda';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

// TS types
type ID = string;
type PostInput = {
    title?: string,
    body?: string,
}
declare var process: {
    env: {
        TABLE: string,
        LOCALSTACK_HOSTNAME?: string,
    }
}

// if running in localstack environment, override the AWS endpoint
const documentClient = new AWS.DynamoDB.DocumentClient({
    endpoint: process.env.LOCALSTACK_HOSTNAME
        ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566`
        : undefined,
});

// dynamo table name is made available to the app as an environment var
const {
    TABLE: TABLE_NAME
} = process.env;


// define our graphql schema
const typeDefs = gql`
  type Query {
    hello: String
    post(id: ID!): Post
    posts: [Post]
  }
  type Mutation {
      addPost(input: PostInput!): Post
      updatePost(id: ID!, input: PostInput!): Post
  }
  input PostInput {
      title: String
      body: String
  }
  type Post {
      id: ID!
      title: String!
      body: String
  }
`;

// define our resolvers
const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        post: async (_, { id }: { id: ID }) => {
            const data = await documentClient.get({
                TableName: TABLE_NAME,
                Key: {
                    id,
                }
            }).promise();
            return data.Item;
        },
        posts: async () => {
            const data = await documentClient.scan({
                TableName: TABLE_NAME,
            }).promise();
            return data.Items;
        }
    },
    Mutation: {
        addPost: async (_, { input: { title, body } }: { input: PostInput }) => {
            const id = uuid();
            await documentClient.put({
                TableName: TABLE_NAME,
                Item: {
                    id,
                    title,
                    body,
                },
            }).promise();
            return {
                id,
                title,
                body
            }
        },
        updatePost: async (_, { id, input: { title, body } }: { id: ID, input: PostInput }) => {
            await documentClient.put({
                TableName: TABLE_NAME,
                Item: {
                    id,
                    title,
                    body,
                },
            }).promise();
            return {
                id,
                title,
                body
            }
        }
    }
};

const server = new ApolloServer({
    typeDefs, resolvers
});

exports.graphqlHandler = server.createHandler();