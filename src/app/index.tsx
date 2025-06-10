import ChatInput from '@/components/ChatInput'
import { createAIImage, streamTextResponse } from '@/services/chatService'
import { useChatStore } from '@/store/chatStore'
import { router } from 'expo-router'
import { View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { generateId } from '@/utils/generateId'

export default function HomeScreen() {
  const createNewChat = useChatStore((state) => state.createNewChat)
  const addNewMessage = useChatStore((state) => state.addNewMessage)
  const updateMessage = useChatStore((state) => state.updateMessage)
  const setIsWaitingForResponse = useChatStore(
    (state) => state.setIsWaitingForResponse
  )
  const setAbortController = useChatStore((state) => state.setAbortController)
  const abortController = useChatStore((state) => state.abortController)
  const isWaitingForResponse = useChatStore(
    (state) => state.isWaitingForResponse
  )

  const handleSend = async (
    message: string,
    imageBase64: string | null,
    isImageGeneration: boolean
  ) => {
    const controller = new AbortController()
    setAbortController(controller)
    setIsWaitingForResponse(true)
    const chatId = createNewChat(message.slice(0, 50) || 'New Chat')
    addNewMessage(chatId, {
      id: generateId(),
      role: 'user',
      message,
      ...(imageBase64 && { image: imageBase64 })
    })
    const assistantId = generateId()
    addNewMessage(chatId, { id: assistantId, role: 'assistant', message: '' })
    router.push(`/chat/${chatId}`)
    try {
      if (isImageGeneration) {
        const data = await createAIImage(message, controller.signal)
        updateMessage(chatId, assistantId, { image: data.image })
      } else {
        let accumulated = ''
        const { responseId } = await streamTextResponse(
          message,
          imageBase64,
          undefined,
          (chunk) => {
            accumulated += chunk
            updateMessage(chatId, assistantId, { message: accumulated })
          },
          controller.signal
        )
        updateMessage(chatId, assistantId, { responseId })
      }
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') {
        console.error('Chat error:', error)
      }
    } finally {
      setAbortController(null)
      setIsWaitingForResponse(false)
    }
  }

  const handleStop = () => {
    abortController?.abort()
    setAbortController(null)
    setIsWaitingForResponse(false)
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className='flex-1 justify-center'>
        <View className='flex-1'>
          <Text className='text-3xl'>Hello World</Text>
        </View>
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isWaitingForResponse={isWaitingForResponse}
        />
      </View>
    </TouchableWithoutFeedback>
  )
}
