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
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to stream')
  }
  if (!res.body) {
    const data = await getTextResponse(
      message,
      imageBase64,
      previousResponseId,
      signal
    )
    onChunk(data.responseMessage)
    return { responseId: data.responseId }
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let responseId: string | undefined
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value)
    const parts = buffer.split('\n')
    buffer = parts.pop() ?? ''
    for (const line of parts) {
      if (line.trim() === '') continue
      try {
        const parsed = JSON.parse(line)
        if (parsed.messageChunk) onChunk(parsed.messageChunk)
        if (parsed.responseId) responseId = parsed.responseId
      } catch {
        onChunk(line)
      }
    }
  }
  if (buffer.trim() !== '') {
    try {
      const parsed = JSON.parse(buffer)
      if (parsed.messageChunk) onChunk(parsed.messageChunk)
      if (parsed.responseId) responseId = parsed.responseId
    } catch {
      onChunk(buffer)
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
