import React, { useEffect, useState, useRef } from "react";
import {
  Badge,
  Box,
  Button,
  Heading,
  SimpleGrid,
  Center,
  Square,
} from "@chakra-ui/core";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import useSound from "use-sound";
import soundSprite from "../assets/sprite.m4a";
import { Helmet } from "react-helmet";
import randomColor from "randomcolor";
import { readableColor } from "polished";

const PLAY_SOUND = gql`
  mutation PlaySound($type: String!) {
    playSound(type: $type) {
      id
      type
    }
  }
`;

const SOUND_PLAYED = gql`
  subscription SoundPlayed {
    soundPlayed {
      id
      type
    }
  }
`;

const GET_CONNECTIONS = gql`
  query GetConnections {
    connections
  }
`;

const CONNECTIONS = gql`
  subscription Connections {
    connections
  }
`;

const durations = {
  zap: 1804,
  woosh: 426,
  horn: 648, // shoutout @Talk2MeGooseman
  bop: 177,
};

const sprite = Object.entries(durations).reduce(
  (acc, [key, duration], index, array) => ({
    ...acc,
    [key]: [
      array.slice(0, index).reduce((total, item) => total + item[1], 0),
      duration,
    ],
  }),
  // need to supply a default key to prevent this issue:
  // https://github.com/goldfire/howler.js/issues/851
  { __default: [0, 0] }
);

function ConnectionStatus({ connections, subscribeToMore }) {
  useEffect(
    () =>
      subscribeToMore({
        document: CONNECTIONS,
        updateQuery: (prev, { subscriptionData }) => subscriptionData.data,
      }),
    []
  );

  return <Badge colorScheme="teal">{connections} spammers spamming</Badge>;
}

const Page = () => {
  const { data } = useSubscription(SOUND_PLAYED);
  const { data: connectionsData, loading, error, subscribeToMore } = useQuery(
    GET_CONNECTIONS
  );
  const [playSound] = useMutation(PLAY_SOUND);
  const [play] = useSound(soundSprite, { sprite });
  const [flashing, setFlashing] = useState([]);
  const timeoutMap = useRef({});

  useEffect(() => {
    if (data) {
      // TODO: adjust volume depending on sound type
      const { type } = data.soundPlayed;
      play({ id: type });

      if (!flashing.includes(type)) {
        setFlashing((prevFlashing) => [...prevFlashing, type]);
      } else {
        clearTimeout(timeoutMap.current[type]);
      }

      timeoutMap.current[type] = setTimeout(() => {
        setFlashing((prevFlashing) =>
          prevFlashing.filter((item) => item !== type)
        );
      }, 250);
    }
  }, [data, play]);

  const types = Object.keys(sprite).filter((type) => type !== "__default");
  return (
    <>
      <Box position="absolute" top="2" left="2">
        {loading ? (
          "Loading..."
        ) : error ? (
          error.message
        ) : (
          <ConnectionStatus
            connections={connectionsData.connections}
            subscribeToMore={subscribeToMore}
          />
        )}
      </Box>
      <Center minH="100vh" flexDirection="column">
        <Helmet title="JamSpam">
          <link
            rel="icon"
            href="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/speaker_1f508.png"
          />
        </Helmet>
        <Heading mb="4" fontSize="3xl">
          JamSpam
        </Heading>
        <SimpleGrid spacing="4" columns={Math.sqrt(types.length)}>
          {types.map((type) => {
            const backgroundColor = randomColor({ seed: type });
            return (
              <Square
                as={Button}
                size="120px"
                key={type}
                onClick={() => playSound({ variables: { type } })}
                style={
                  flashing.includes(type)
                    ? {
                        backgroundColor,
                        color: readableColor(backgroundColor),
                      }
                    : null
                }
              >
                {type}
              </Square>
            );
          })}
        </SimpleGrid>
      </Center>
    </>
  );
};

export default Page;
