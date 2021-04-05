const { ApolloServer, gql } = require('apollo-server-lambda');
const AWS = require('aws-sdk');
const uuid = require('uuid').v4;

const documentClient = new AWS.DynamoDB.DocumentClient()

const typeDefs = gql`
  type Query {
    hello: String
    post(id: String!): Post
  }
  type Mutation {
      addPost(input: PostInput): Post
  }
  input PostInput {
      title: String!
      body: String!
  }
  type Post {
      id: String!
      title: String!
      body: String
  }
`;

const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        post: async (_, { id }) => {
            const data = await documentClient.get({
                TableName: process.env.TABLE,
                Key: {
                    id,
                }
            }).promise();
            return data.Item;
        }
    },
    Mutation: {
        addPost: async (_, { input: { title, body } }) => {
            const id = uuid();
            await documentClient.put({
                TableName: process.env.TABLE,
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
    }
};

const server = new ApolloServer({
    typeDefs, resolvers
});

exports.graphqlHandler = server.createHandler();