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
import { createAIImage, streamTextResponse } from '@/services/chatService'
import { generateId } from '@/utils/generateId'

export default function ChatScreen() {
  const { id } = useLocalSearchParams()
  const flatListRef = useRef<FlatList | null>(null)
  const chat = useChatStore((state) =>
    state.chatHistory.find((c) => c.id === id)
  )
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
      id: generateId(),
      role: 'user' as const,
      message,
      ...(imageBase64 && { image: imageBase64 })
    })
    const assistantId = generateId()
    addNewMessage(chat.id, {
      id: assistantId,
      role: 'assistant',
      message: ''
    })
    const previousResponseId = chat.messages.findLast(
      (message) => message.responseId
    )?.responseId
    try {
      if (isImageGeneration) {
        const data = await createAIImage(message, controller.signal)
        updateMessage(chat.id, assistantId, { image: data.image })
      } else {
        let accumulated = ''
        const { responseId } = await streamTextResponse(
          message,
          imageBase64,
          previousResponseId,
          (chunk) => {
            accumulated += chunk
            updateMessage(chat.id, assistantId, { message: accumulated })
          },
          controller.signal
        )
        updateMessage(chat.id, assistantId, { responseId })
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
          className='flex-1'
          onScrollBeginDrag={Keyboard.dismiss}
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
