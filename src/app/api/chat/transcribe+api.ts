import OpenAI from 'openai'
import { toFile } from 'openai/uploads'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY
})

export async function POST(request: Request) {
  const controller = new AbortController()
  if (request.signal.aborted) {
    controller.abort()
  } else {
    request.signal.addEventListener('abort', () => controller.abort())
  }
  const { audioBase64 } = await request.json()
  try {
    const transcription = await openai.audio.transcriptions.create(
      {
        file: await toFile(Buffer.from(audioBase64, 'base64'), 'audio.m4a'),
        model: 'whisper-1'
      },
      { signal: controller.signal }
    )
    return Response.json({ transcribedMessage: transcription.text })
  } catch (error) {
    if (controller.signal.aborted) {
      return Response.json(
        { error: 'Request aborted by the client' },
        { status: 499 }
      )
    }
    return Response.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
