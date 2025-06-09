import OpenAI from 'openai'

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
  const { prompt } = await request.json()
  try {
    const img = await openai.images.generate(
      {
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024'
      },
      { signal: controller.signal }
    )
    const base64Image = img?.data?.[0]?.b64_json
    return Response.json({ image: `data:image/png;base64,${base64Image}` })
  } catch (error) {
    if (controller.signal.aborted) {
      return Response.json(
        { error: 'Request aborted by the client' },
        { status: 499 }
      )
    }
    console.error(error)
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
