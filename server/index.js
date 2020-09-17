import { ApolloServer, gql, PubSub } from "apollo-server";
import fs from "fs";

// how this thing should work
// 1. user presses button -> sends mutation with sound ID
// 2. take that sound ID and forward it to all clients with subscription
// 3. client plays sound when it recieves a subscription event
// 4. ???
// 5. profit

const pubsub = new PubSub();
const SOUND_PLAYED = "SOUND_PLAYED";
const CONNECTIONS = "CONNECTIONS";

let connectionCount = 0;

const resolvers = {
  Query: {
    connections: () => connectionCount,
  },
  Subscription: {
    soundPlayed: {
      subscribe: () => {
        return pubsub.asyncIterator(SOUND_PLAYED);
      },
    },
    connections: {
      subscribe: () => {
        return pubsub.asyncIterator(CONNECTIONS);
      },
    },
  },
  Mutation: {
    playSound: (_, { type }) => {
      const response = {
        id: Date.now(),
        type,
      };

      pubsub.publish(SOUND_PLAYED, { soundPlayed: response });
      return response;
    },
  },
};

// could be replaced with graphql-tools load
// https://www.graphql-tools.com/docs/migration-from-import/
const typeDefs = fs.readFileSync("./schema.graphql", "utf8").toString();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    reportSchema: true,
    variant: "current",
  },
  subscriptions: {
    onConnect: () => {
      connectionCount++;
      pubsub.publish(CONNECTIONS, { connections: connectionCount });
    },
    onDisconnect: () => {
      connectionCount--;
      pubsub.publish(CONNECTIONS, { connections: connectionCount });
    },
  },
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🔈 Server listening at ${url}`);
});
