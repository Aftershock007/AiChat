import ChatInput from '@/components/ChatInput'
import { View, Text } from 'react-native'

export default function HomeScreen() {
  const handleSend = (message: string) => {
    console.log(message)
  }

  return (
    <View className='flex-1 justify-center'>
      <View className='flex-1'>
        <Text className='text-3xl'>Hello World</Text>
      </View>
      <ChatInput onSend={handleSend} isLoading={false} />
    </View>
  )
}
