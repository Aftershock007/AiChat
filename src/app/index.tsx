import ChatInput from '@/components/ChatInput'
import {
  createAIImage,
  getSpeechResponse,
  getTextResponse
} from '@/services/chatService'
import { useChatStore } from '@/store/chatStore'
import { router } from 'expo-router'
import { View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native'

export default function HomeScreen() {
  const createNewChat = useChatStore((state) => state.createNewChat)
  const addNewMessage = useChatStore((state) => state.addNewMessage)
  const setIsWaitingForResponse = useChatStore(
    (state) => state.setIsWaitingForResponse
  )

  const handleSend = async (
    message: string,
    imageBase64: string | null,
    isImageGeneration: boolean,
    audioBase64: string | null
  ) => {
    setIsWaitingForResponse(true)
    const chatId = createNewChat(message.slice(0, 50) || 'New Chat')
    if (!audioBase64) {
      addNewMessage(chatId, {
        id: Date.now().toString(),
        role: 'user',
        message,
        ...(imageBase64 && { image: imageBase64 })
      })
    }
    router.push(`/chat/${chatId}`)
    try {
      let data
      if (audioBase64) {
        data = await getSpeechResponse(audioBase64)
        const myMessage = {
          id: Date.now().toString(),
          role: 'user' as const,
          message: data.transcribedMessage
        }
        addNewMessage(chatId, myMessage)
      } else if (isImageGeneration) {
        data = await createAIImage(message)
      } else {
        data = await getTextResponse(message, imageBase64)
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
      console.error('Chat error:', error)
    } finally {
      setIsWaitingForResponse(false)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className='flex-1 justify-center'>
        <View className='flex-1'>
          <Text className='text-3xl'>Hello World</Text>
        </View>
        <ChatInput onSend={handleSend} />
      </View>
    </TouchableWithoutFeedback>
  )
}
