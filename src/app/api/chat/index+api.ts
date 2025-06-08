import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY,
  dangerouslyAllowBrowser: true
})

export async function POST(request: Request) {
  const { message, previousResponseId } = await request.json()

  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1',
      input: message,
      ...(previousResponseId && { previous_response_id: previousResponseId })
    })
    return Response.json({
      responseMessage: response.output_text,
      responseId: response.id
    })
  } catch (error) {
    console.error('OpenAI error:', error)
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
