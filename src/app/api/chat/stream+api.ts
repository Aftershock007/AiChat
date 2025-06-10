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
  let messageContent: any = message
  if (imageBase64) {
    messageContent = [
      { role: 'user', content: message },
      {
        role: 'user',
        content: [{ type: 'input_image', image_url: imageBase64 }]
      }
    ]
  }
  try {
    const stream = (await openai.responses.create(
      {
        model: 'gpt-4.1',
        input: messageContent,
        stream: true,
        ...(previousResponseId && { previous_response_id: previousResponseId })
      } as any,
      { signal: controller.signal }
    )) as any
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'response.output_text.delta') {
            controller.enqueue(
              encoder.encode(JSON.stringify({ messageChunk: event.delta }))
            )
            controller.enqueue(encoder.encode('\n'))
          } else if (event.type === 'response.completed') {
            controller.enqueue(
              encoder.encode(JSON.stringify({ responseId: event.response.id }))
            )
            controller.enqueue(encoder.encode('\n'))
          }
        }
        controller.close()
      }
    })
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
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
