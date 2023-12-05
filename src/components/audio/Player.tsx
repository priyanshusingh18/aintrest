"use client";
import { Volume1 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";

interface PlayerProps {
  text: string;
  isUserMessage: boolean;
}

const Player = ({ text, isUserMessage }: PlayerProps) => {
  const [audioUrl, setAudioUrl] = useState<null | string>(null);
  const [audio, setAudio] = useState<null | HTMLAudioElement>(null);
  const { toast } = useToast();
  useEffect(() => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.play();
    } else {
      audio && (audio as HTMLAudioElement).play();
    }
    return () => {
      console.log("YEY, audio", audio);
      audio?.pause();
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);
  const handlePlayAudio = async () => {
    console.log(audioUrl, audio);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.play();
      return;
    } else if (audioUrl) {
      console.log("MUST COME HERE");
      setAudio(() => new Audio(audioUrl));
      console.log(audio);
      // audio && (audio as HTMLAudioElement).play();
      return;
    }
    try {
      const response = await fetch("/api/audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
        }),
      });
      if (!response.ok) {
        toast({
          title: "Error Playing Audio",
          description: "Please try again later",
          variant: "destructive",
        });
      }
      const audioBlob = await response.blob();
      const tempAudioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(tempAudioUrl);
      setAudio(() => new Audio(tempAudioUrl));
    } catch (error) {
      toast({
        title: "Error Playing Audio",
        description: "Please try again later",
        variant: "destructive",
      });
      console.error("Error playing audio:", error);
    }
  };
  return (
    <button
      className={`${
        isUserMessage ? "self-end rotate-180 scale-y-[-1]" : ""
      } w-4 h-4  `}
      onClick={() => {
        handlePlayAudio();
      }}
    >
      <Volume1 className="w-4 h-4" />{" "}
    </button>
  );
};

export default Player;
