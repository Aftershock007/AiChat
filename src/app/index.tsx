import ChatInput from '@/components/ChatInput'
import { useChatStore } from '@/store/chatStore'
import { router } from 'expo-router'
import { View, Text } from 'react-native'

export default function HomeScreen() {
  const createNewChat = useChatStore((state) => state.createNewChat)
  const addNewMessage = useChatStore((state) => state.addNewMessage)

  const handleSend = async (message: string) => {
    const chatId = createNewChat(message.slice(0, 50))
    addNewMessage(chatId, {
      id: Date.now().toString(),
      role: 'user',
      message
    })
    router.push(`/chat/${chatId}`)
    try {
      const response = await fetch('/api/chat')
      const data = await response.json()
      console.log(data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <View className='flex-1 justify-center'>
      <View className='flex-1'>
        <Text className='text-3xl'>Hello World</Text>
      </View>
      <ChatInput onSend={handleSend} />
    </View>
  )
}
