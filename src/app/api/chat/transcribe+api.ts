import OpenAI from 'openai'
import { toFile } from 'openai/uploads'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY
})

export async function POST(request: Request) {
  const { audioBase64 } = await request.json()
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(Buffer.from(audioBase64, 'base64'), 'audio.m4a'),
      model: 'whisper-1'
    })
    return Response.json({ transcribedMessage: transcription.text })
  } catch (error) {
    console.error(error)
    return Response.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
