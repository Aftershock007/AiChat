import ChatInput from '@/components/ChatInput'
import { createAIImage, getTextResponse } from '@/services/chatService'
import { useChatStore } from '@/store/chatStore'
import { router } from 'expo-router'
import { View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native'

export default function HomeScreen() {
  const createNewChat = useChatStore((state) => state.createNewChat)
  const addNewMessage = useChatStore((state) => state.addNewMessage)
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
      id: Date.now().toString(),
      role: 'user',
      message,
      ...(imageBase64 && { image: imageBase64 })
    })
    router.push(`/chat/${chatId}`)
    try {
      let data
      if (isImageGeneration) {
        data = await createAIImage(message, controller.signal)
      } else {
        data = await getTextResponse(
          message,
          imageBase64,
          undefined,
          controller.signal
        )
      }
      const aiResponseMessage = {
        id: Date.now().toString(),
        message: data.responseMessage,
        responseId: data.responseId,
        image: data.image,
        role: 'assistant' as const
      }
      addNewMessage(chatId, aiResponseMessage)
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
