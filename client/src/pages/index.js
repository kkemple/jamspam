import React from "react";
import { Button } from "@chakra-ui/core";
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

const Page = () => {
  const { data, loading, error } = useSubscription(SOUND_PLAYED);
  const [playSound] = useMutation(PLAY_SOUND);

  console.log(data, loading, error);

  return (
    <>
      <h1>Play Sound</h1>
      <Button onClick={() => playSound({ variables: { type: "test" } })}>
        Play it!
      </Button>
    </>
  );
};

export default Page;
