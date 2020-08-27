import fetch from "isomorphic-fetch";
import ws from "isomorphic-ws";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";

const httpLink = new HttpLink({
  uri: "http://localhost:4000",
  fetch,
});

const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000/graphql",
  webSocketImpl: ws,
  options: {
    reconnect: true,
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
});

export default client;
