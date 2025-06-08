export const getTextResponse = async (
  message: string,
  imageBase64: string | null,
  previousResponseId?: string
) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, imageBase64, previousResponseId })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export async function createAIImage(prompt: string) {
  const res = await fetch('/api/chat/createImage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export const getSpeechResponse = async (
  audioBase64: string,
  previousResponseId?: string
) => {
  const res = await fetch('/api/chat/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, previousResponseId })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}
