import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY
})

export async function POST(request: Request) {
  const { prompt } = await request.json()

  try {
    const img = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1024x1024'
    })
    const base64Image = img?.data?.[0]?.b64_json
    return Response.json({ image: `data:image/png;base64,${base64Image}` })
  } catch (error) {
    console.error(error)
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
