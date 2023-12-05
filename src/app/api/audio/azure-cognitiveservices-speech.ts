// azure-cognitiveservices-speech.js
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { Buffer } from "buffer";
import { PassThrough, Readable } from "stream";
import fs from "fs";

/**
 * Node.js server code to convert text to speech
 * @returns stream
 * @param {*} key your resource key
 * @param {*} region your resource region
 * @param {*} text text to convert to audio/speech
 * @param {*} filename optional - best for long text - temp file for converted speech/audio
 */
const key = process.env.AZURE_AUDIO_KEY!;
const region = process.env.AZURE_REGEION!;
interface testToSpeechParameters {
  text: string;
  filename: string | null;
}
export const textToSpeech = async ({
  text,
  filename,
}: testToSpeechParameters) => {
  // convert callback function to promise
  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechSynthesisOutputFormat = 5; // mp3

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    synthesizer.speakTextAsync(
      text,
      (result: { audioData: any }) => {
        const { audioData } = result;

        synthesizer.close();
        const readableStream = new Readable();
        readableStream._read = () => {}; // Necessary for a readable stream

        // Push the audio data into the stream
        readableStream.push(Buffer.from(audioData));
        readableStream.push(null);
        // return stream from memory
        // const bufferStream = new PassThrough();
        // bufferStream.end(Buffer.from(audioData));
        resolve(readableStream);
      },
      (error: any) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
};
