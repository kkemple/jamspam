import React, { useEffect } from "react";
import { Button, Heading, SimpleGrid, Center, Square } from "@chakra-ui/core";
import { gql, useMutation, useSubscription } from "@apollo/client";

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

const sprites = {
  play: [0, 1000],
  bop: [1000, 2000],
  spin: [2000, 3000],
  swipe: [3000, 4000],
  console: [4000, 5000],
  chat: [5000, 6000],
  spam: [6000, 7000],
  sing: [7000, 8000],
  zap: [8000, 9000],
};

const Page = () => {
  const { data } = useSubscription(SOUND_PLAYED);
  const [playSound] = useMutation(PLAY_SOUND);

  useEffect(() => {
    console.log(data?.soundPlayed.type);
  }, [data]);

  const types = Object.keys(sprites);
  return (
    <Center minH="100vh" flexDirection="column">
      <Heading mb="4" fontSize="3xl">
        JamSpam
      </Heading>
      <SimpleGrid spacing="4" columns={Math.sqrt(types.length)}>
        {types.map((type) => (
          <Square
            as={Button}
            size="120px"
            key={type}
            onClick={() => playSound({ variables: { type } })}
          >
            {type}
          </Square>
        ))}
      </SimpleGrid>
    </Center>
  );
};

export default Page;
