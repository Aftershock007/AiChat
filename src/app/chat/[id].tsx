import { View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import chatHistory from '@assets/data/chatHistory.json'

export default function ChatScreen() {
  const { id } = useLocalSearchParams()
  const chat = chatHistory.find((chat) => chat.id === id)

  if (!chat) {
    return (
      <View>
        <Text className='text-white'>Chat {id} not found</Text>
      </View>
    )
  }

  return (
    <View>
      <Text className='text-white'>Chat Screen: {chat.title}</Text>
    </View>
  )
}
