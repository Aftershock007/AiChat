import { View, Text, FlatList } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import ChatInput from '@/components/ChatInput'
import MessageListItem from '@/components/MessageListItem'
import { useChatStore } from '@/store/chatStore'
import { useEffect, useRef } from 'react'

export default function ChatScreen() {
  const { id } = useLocalSearchParams()
  const flatListRef = useRef<FlatList | null>(null)
  const chat = useChatStore((state) =>
    state.chatHistory.find((c) => c.id === id)
  )
  const addNewMessage = useChatStore((state) => state.addNewMessage)

  useEffect(() => {
    const timeout = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
    return () => clearTimeout(timeout)
  }, [chat?.messages])

  const handleSend = async (message: string, imageBase64: string | null) => {
    if (!chat) return
    addNewMessage(chat.id, {
      id: Date.now().toString(),
      role: 'user' as const,
      message,
      ...(imageBase64 && { image: imageBase64 })
    })
    const previousResponseId =
      chat.messages[chat.messages.length - 1]?.responseId
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, previousResponseId, imageBase64 })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error)
      }
      const aiResponseMessage = {
        id: Date.now().toString(),
        message: data.responseMessage,
        responseId: data.responseId,
        role: 'assistant' as const
      }
      addNewMessage(chat.id, aiResponseMessage)
    } catch (error) {
      console.error('Chat error:', error)
    }
  }

  if (!chat) {
    return (
      <View>
        <Text className='text-white'>Chat {id} not found</Text>
      </View>
    )
  }

  return (
    <View className='flex-1'>
      <FlatList
        ref={flatListRef}
        data={chat.messages}
        renderItem={({ item }) => <MessageListItem messageItem={item} />}
      />
      <ChatInput onSend={handleSend} isLoading={false} />
    </View>
  )
}
