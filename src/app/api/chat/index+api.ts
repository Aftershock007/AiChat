import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY,
  dangerouslyAllowBrowser: true
})

export async function POST(request: Request) {
  const { message, previousResponseId, imageBase64 } = await request.json()
  let messageContent = message
  if (imageBase64) {
    messageContent = [
      {
        role: 'user',
        content: message
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_image',
            image_url: imageBase64
          }
        ]
      }
    ]
  }

  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1',
      input: messageContent,
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
