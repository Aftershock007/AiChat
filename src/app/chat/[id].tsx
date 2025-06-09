import {
  View,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import ChatInput from '@/components/ChatInput'
import MessageListItem from '@/components/MessageListItem'
import { useChatStore } from '@/store/chatStore'
import { useEffect, useRef } from 'react'
import { createAIImage, getTextResponse } from '@/services/chatService'

export default function ChatScreen() {
  const { id } = useLocalSearchParams()
  const flatListRef = useRef<FlatList | null>(null)
  const chat = useChatStore((state) =>
    state.chatHistory.find((c) => c.id === id)
  )
  const addNewMessage = useChatStore((state) => state.addNewMessage)
  const setIsWaitingForResponse = useChatStore(
    (state) => state.setIsWaitingForResponse
  )
  const setAbortController = useChatStore((state) => state.setAbortController)
  const abortController = useChatStore((state) => state.abortController)
  const isWaitingForResponse = useChatStore(
    (state) => state.isWaitingForResponse
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
    return () => clearTimeout(timeout)
  }, [chat?.messages])

  const handleSend = async (
    message: string,
    imageBase64: string | null,
    isImageGeneration: boolean
  ) => {
    if (!chat) return
    const controller = new AbortController()
    setAbortController(controller)
    setIsWaitingForResponse(true)
    addNewMessage(chat.id, {
      id: Date.now().toString(),
      role: 'user' as const,
      message,
      ...(imageBase64 && { image: imageBase64 })
    })
    const previousResponseId = chat.messages.findLast(
      (message) => message.responseId
    )?.responseId
    try {
      let data
      if (isImageGeneration) {
        data = await createAIImage(message, controller.signal)
      } else {
        data = await getTextResponse(
          message,
          imageBase64,
          previousResponseId,
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
      addNewMessage(chat.id, aiResponseMessage)
    } catch (error) {
      console.error('Chat error:', error)
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

  if (!chat) {
    return (
      <View>
        <Text className='text-white'>Chat {id} not found</Text>
      </View>
    )
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className='flex-1'>
        <FlatList
          ref={flatListRef}
          data={chat.messages}
          renderItem={({ item }) => <MessageListItem messageItem={item} />}
          ListFooterComponent={() =>
            isWaitingForResponse && (
              <Text className='text-gray-400 px-6 mb-4 animate-pulse'>
                Waiting for response...
              </Text>
            )
          }
        />
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isWaitingForResponse={isWaitingForResponse}
        />
      </View>
    </TouchableWithoutFeedback>
  )
}
