"use client";
import React, { useState, useEffect, useRef } from "react";
import { BlobServiceClient } from "@azure/storage-blob";
import { useToast } from "../ui/use-toast";

if (typeof window !== "undefined") {
  var recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
}
const AZURE_ACCOUNT_NAME = "aintrestblob";
const AZURE_ACCOUNT_KEY =
  "r+yhSpSvOsh9lysH0oHsB30qtU60gOWovlOIo20gRcv52bK0nlysACWTFebuZsf9IVfkYT6pm+q0+AStUh4YRQ==";
const CONTAINER_NAME = "aintrestapp";
const yourSASToken = `?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2023-11-25T19:51:13Z&st=2023-11-25T11:51:13Z&sip=0.0.0.0-255.255.255.255&spr=https,http&sig=oVBBGAYvolfoLz1a%2BXPtCZEkL40E6Hrilnel3EGdH%2B8%3D`;

const VoiceRecognitionButton: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audio, setAudio] = useState<null | HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks: Blob[] = [];

  const { toast } = useToast();
  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setTranscription(transcript);
    };

    recognition.onend = () => {
      stopListening();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
    };

    const initializeMediaRecorder = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new MediaRecorder(mediaStream);

        mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          sendAudioToAzureBlobStorage(audioBlob);
          audioChunks.length = 0;
        };
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    initializeMediaRecorder();

    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startListening = () => {
    if (recognition && mediaRecorderRef.current) {
      recognition.start();
      mediaRecorderRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition && mediaRecorderRef.current) {
      recognition.stop();
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const sendAudioToAzureBlobStorage = async (audioBlob: Blob) => {
    const blobServiceClient = new BlobServiceClient(
      `https://${AZURE_ACCOUNT_NAME}.blob.core.windows.net${yourSASToken}`
    );
    const containerClient =
      blobServiceClient.getContainerClient(CONTAINER_NAME);

    const blobName = `audio/${Date.now()}.wav`;

    await containerClient.uploadBlockBlob(blobName, audioBlob, audioBlob.size, {
      blobHTTPHeaders: { blobContentType: "audio/wav" },
    });

    setAudioUrl(
      `https://${AZURE_ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}${yourSASToken}`
    );
  };

  const playAudio = async () => {
    if (audio) audio.pause();
    if (audioUrl) {
      const tempAudio = new Audio(audioUrl);
      await setAudio(tempAudio);
      if (audio) audio.play();
    } else {
      return toast({
        title: "There was a problem sending this message",
        description: "Please refresh this page and try again",
        variant: "destructive",
      });
    }
  };
  const playAudio1 = async () => {
    if (audio) {
      audio.pause();
    }
    if (audioUrl) {
      const tempAudio = new Audio(audioUrl);
      await setAudio(tempAudio);
      if (audio) audio.play();
    } else {
      return toast({
        title: "There was a problem sending this message",
        description: "Please refresh this page and try again",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="container mx-auto p-8 bg-white rounded-md shadow-md">
      <button
        className={`px-4 py-2 ${
          isListening ? "bg-red-400" : "bg-green-400"
        } text-white rounded-md`}
        onClick={isListening ? stopListening : startListening}
      >
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>
      <button
        className={`mx-4 px-4 py-2 ${
          audioUrl ? "bg-blue-500" : "bg-gray-500"
        } text-white rounded-md`}
        onClick={() => {
          playAudio1();
        }}
        // disabled={!audioUrl}
      >
        Play Recorded Sound
      </button>
      <p className="text-lg mt-4">Transcription: {transcription}</p>
    </div>
  );
};

export default VoiceRecognitionButton;
