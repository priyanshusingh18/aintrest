import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { textToAudioValidator } from "@/lib/validators/TextToSpeechValidators";

import { textToSpeech } from "./azure-cognitiveservices-speech";

export const POST = async (req, res) => {
  const body = await req.json();
  const { getUser } = getKindeServerSession();
  const user = getUser();
  const { id: userId } = user;

  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { text } = textToAudioValidator.parse(body);
  try {
    const aud: ReadableStream = await textToSpeech({ text, filename: null });
    // response.headers.set("Content-Type", "audio/mpeg");
    // response.headers.set("Transfer-Encoding", "chunked");

    // const resa = new Response();
    // aud.pipe(resa);
    // console.log(res);

    // return bufferStream.pipe();

    return new Response(aud);
  } catch (error) {
    console.log(error, "HUUH");
    return NextResponse;
    res.error(error);
  }
};
