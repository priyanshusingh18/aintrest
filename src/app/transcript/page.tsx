import "regenerator-runtime";

import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const SpeechInput = () => {
  const [text, setText] = useState("");
  const { transcript, resetTranscript, finalTranscript } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) setText((prevText) => prevText + finalTranscript + " ");
    resetTranscript();
  }, [finalTranscript]);

  const handleChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setText(e.target.value);
  };

  const handleSpeechRecognition = () => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopSpeechRecognition = () => {
    SpeechRecognition.stopListening();
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={handleChange}
        className="w-96 h-28"
        placeholder="Type or speak here..."
      />
      <button className="p-12" onClick={handleSpeechRecognition}>
        Start Speech Recognition
      </button>
      <button onClick={stopSpeechRecognition}>Stop Speech Recognition</button>
    </div>
  );
};

export default SpeechInput;
