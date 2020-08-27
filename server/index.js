import { ApolloServer, gql, PubSub } from "apollo-server";

// how this thing should work
// 1. user presses button -> sends mutation with sound ID
// 2. take that sound ID and forward it to all clients with subscription
// 3. client plays sound when it recieves a subscription event
// 4. ???
// 5. profit

const typeDefs = gql`
  type Query {
    _empty: String
  }

  type Subscription {
    soundPlayed: Sound
  }

  type Mutation {
    playSound(type: String!): Sound
    test: String
  }

  type Sound {
    id: ID!
    type: String!
  }
`;

const pubsub = new PubSub();
const SOUND_PLAYED = "SOUND_PLAYED";

const resolvers = {
  Subscription: {
    soundPlayed: {
      subscribe: () => {
        console.log("connected");
        return pubsub.asyncIterator(SOUND_PLAYED);
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    reportSchema: true,
    variant: "current",
  },
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🔈 Server listening at ${url}`);
});
