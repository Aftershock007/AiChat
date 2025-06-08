import { View, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useState } from 'react'

export default function ChatInput({ onSend, isLoading }) {
  const insets = useSafeAreaInsets()

  const [message, setMessage] = useState('')

  async function handleSend() {
    console.log('HI')

    setMessage('')
    try {
      await onSend(message)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <View
        className='bg-[#262626] rounded-3xl'
        style={{ paddingBottom: insets.bottom }}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder='Ask anything...'
          placeholderTextColor='gray'
          multiline
          className='pt-6 pb-2 px-4 text-white'
        />
        <View className='flex-row items-center justify-between px-4'>
          <MaterialCommunityIcons name='plus' size={24} color='white' />
          {!!message ? (
            <View className='bg-white rounded-full p-2'>
              <MaterialCommunityIcons
                name='arrow-up'
                size={24}
                color='black'
                className='ml-auto'
                onPress={handleSend}
                disabled={isLoading}
              />
            </View>
          ) : (
            <View className='bg-white rounded-full p-2'>
              <MaterialCommunityIcons
                name='microphone'
                size={24}
                color='black'
              />
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
