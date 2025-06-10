export const getTextResponse = async (
  message: string,
  imageBase64: string | null,
  previousResponseId?: string,
  signal?: AbortSignal
) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, imageBase64, previousResponseId }),
    signal
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export const streamTextResponse = async (
  message: string,
  imageBase64: string | null,
  previousResponseId: string | undefined,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
) => {
  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, imageBase64, previousResponseId }),
    signal
  })
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to stream')
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let responseId: string | undefined
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter((l) => l.trim() !== '')
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line)
        if (parsed.messageChunk) onChunk(parsed.messageChunk)
        if (parsed.responseId) responseId = parsed.responseId
      } catch {
        onChunk(line)
      }
    }
  }
  return { responseId }
}

export async function createAIImage(prompt: string, signal?: AbortSignal) {
  const res = await fetch('/api/chat/createImage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
    signal
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export const getSpeechResponse = async (
  audioBase64: string,
  previousResponseId?: string,
  signal?: AbortSignal
) => {
  const res = await fetch('/api/chat/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, previousResponseId }),
    signal
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export const transcribeAudio = async (
  audioBase64: string,
  signal?: AbortSignal
) => {
  const res = await fetch('/api/chat/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64 }),
    signal
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data.transcribedMessage as string
}
