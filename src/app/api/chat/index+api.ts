import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY,
  dangerouslyAllowBrowser: true
})

export async function POST(request: Request) {
  const controller = new AbortController()
  if (request.signal.aborted) {
    controller.abort()
  } else {
    request.signal.addEventListener('abort', () => controller.abort())
  }
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
    const response = await openai.responses.create(
      {
        model: 'gpt-4.1',
        input: messageContent,
        ...(previousResponseId && { previous_response_id: previousResponseId })
      },
      { signal: controller.signal }
    )
    return Response.json({
      responseMessage: response.output_text,
      responseId: response.id
    })
  } catch (error) {
    if (controller.signal.aborted) {
      return Response.json(
        { error: 'Request aborted by the client' },
        { status: 499 }
      )
    }
    console.error('OpenAI error:', error)
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
