import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Alert,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { useChatStore } from '@/store/chatStore'
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio'
import * as FileSystem from 'expo-file-system'

interface ChatInputProps {
  onSend: (
    message: string,
    imageBase64: string | null,
    isImageGeneration: boolean,
    recordedAudioPath: string | null
  ) => Promise<void>
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const insets = useSafeAreaInsets()
  const [message, setMessage] = useState('')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isImageGeneration, setIsImageGeneration] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudioPath, setRecordedAudioPath] = useState<string | null>(
    null
  )
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const isWaitingForResponse = useChatStore(
    (state) => state.isWaitingForResponse
  )

  const handleConvertAudio = async () => {
    if (!recordedAudioPath) return null
    return FileSystem.readAsStringAsync(recordedAudioPath, {
      encoding: FileSystem.EncodingType.Base64
    })
  }

  const handleSend = async () => {
    setMessage('')
    setImageBase64(null)
    setRecordedAudioPath(null)
    try {
      const audioBase64 = await handleConvertAudio()
      await onSend(message, imageBase64, isImageGeneration, audioBase64)
    } catch (error) {
      console.error(error)
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 1
    })
    if (!result.canceled && result.assets[0].base64) {
      setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`)
    }
  }

  const startRecording = async () => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync()
      if (!granted) {
        Alert.alert(
          'Permission not granted',
          'Please grant permission to record audio'
        )
        return
      }
      await audioRecorder.prepareToRecordAsync()
      audioRecorder.record()
      setIsRecording(true)
    } catch (error) {
      Alert.alert('Recording error', 'Please try again')
    }
  }

  const stopRecording = async () => {
    try {
      await audioRecorder.stop()
      if (audioRecorder.uri) {
        setRecordedAudioPath(audioRecorder.uri)
      }
      setIsRecording(false)
    } catch (error) {
      Alert.alert('Error stopping the recording')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          className='bg-[#262626] rounded-3xl'
          style={{ paddingBottom: insets.bottom }}>
          {imageBase64 && (
            <ImageBackground
              source={{ uri: imageBase64 }}
              className='w-20 h-20 mx-3 mt-3'
              imageClassName='rounded-2xl'>
              <AntDesign
                name='closecircle'
                size={20}
                color='white'
                className='absolute right-1 top-1'
                onPress={() => setImageBase64(null)}
              />
            </ImageBackground>
          )}
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder='Ask anything...'
            placeholderTextColor='gray'
            multiline
            className='pt-6 pb-2 px-4 text-white'
          />
          <View className='flex-row items-center px-4 gap-3'>
            <MaterialCommunityIcons
              onPress={pickImage}
              name='plus'
              size={24}
              color='white'
            />
            <MaterialCommunityIcons
              name='palette'
              color={isImageGeneration ? 'white' : 'gray'}
              size={24}
              onPress={() => setIsImageGeneration(!isImageGeneration)}
            />
            {!!message || imageBase64 || recordedAudioPath ? (
              <View className='bg-white rounded-full p-2'>
                <MaterialCommunityIcons
                  name='arrow-up'
                  size={24}
                  color='black'
                  className='ml-auto'
                  onPress={handleSend}
                  disabled={isWaitingForResponse}
                />
              </View>
            ) : (
              <Pressable onPress={isRecording ? stopRecording : startRecording}>
                <MaterialCommunityIcons
                  name='microphone'
                  size={24}
                  color={isRecording ? 'white' : 'gray'}
                />
              </Pressable>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
