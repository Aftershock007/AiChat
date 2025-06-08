import { View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import chatHistory from '@assets/data/chatHistory.json'
import ChatInput from '@/components/ChatInput'

export default function ChatScreen() {
  const { id } = useLocalSearchParams()
  const chat = chatHistory.find((chat) => chat.id === id)

  const handleSend = (message: string) => {
    console.log(message)
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
      <Text className='flax-1 text-white'>Message</Text>
      <ChatInput onSend={handleSend} isLoading={false} />
    </View>
  )
}
