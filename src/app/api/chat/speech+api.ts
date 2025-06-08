import OpenAI from 'openai'
import { toFile } from 'openai/uploads'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY
})

export async function POST(request: Request) {
  const { audioBase64, previousResponseId } = await request.json()
  console.log(audioBase64)
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(Buffer.from(audioBase64, 'base64'), 'audio.m4a'),
      model: 'whisper-1'
    })
    console.log('transcription: ', transcription.text)
    const response = await openai.responses.create({
      model: 'gpt-4.1',
      input: transcription.text,
      ...(previousResponseId && { previous_response_id: previousResponseId })
    })
    return Response.json({
      responseId: response.id,
      responseMessage: response.output_text,
      transcribedMessage: transcription.text
    })
  } catch (error) {
    console.log(error)
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
