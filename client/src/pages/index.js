import React, { useEffect } from "react";
import { Button, Heading, SimpleGrid, Center, Square } from "@chakra-ui/core";
import { gql, useMutation, useSubscription } from "@apollo/client";
import useSound from "use-sound";
import soundSprite from "../assets/sprite.m4a";

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

const durations = {
  zap: 1804,
  woosh: 426,
  honk: 648, // shoutout @Talk2MeGooseman
  bop: 177,
};

const sprites = Object.entries(durations).reduce(
  (acc, [key, duration], index, array) => ({
    ...acc,
    [key]: [
      array.slice(0, index).reduce((total, item) => total + item[1], 0),
      duration,
    ],
  }),
  {}
);

const Page = () => {
  const { data } = useSubscription(SOUND_PLAYED);
  const [playSound] = useMutation(PLAY_SOUND);
  const [play] = useSound(soundSprite, { sprite: sprites });

  useEffect(() => {
    if (data) {
      play({ id: data.soundPlayed.type });
    }
  }, [data]);

  const types = Object.keys(sprites);
  return (
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
