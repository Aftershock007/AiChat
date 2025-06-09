import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Alert,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio'
import * as FileSystem from 'expo-file-system'
import { transcribeAudio } from '@/services/chatService'

interface ChatInputProps {
  onSend: (
    message: string,
    imageBase64: string | null,
    isImageGeneration: boolean
  ) => Promise<void>
  isWaitingForResponse: boolean
  onStop: () => void
}

export default function ChatInput({
  onSend,
  isWaitingForResponse,
  onStop
}: ChatInputProps) {
  const insets = useSafeAreaInsets()
  const [message, setMessage] = useState('')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isImageGeneration, setIsImageGeneration] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)

  const handleSend = async () => {
    const text = message
    setMessage('')
    setImageBase64(null)
    try {
      await onSend(text, imageBase64, isImageGeneration)
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
      setIsTranscribing(false)
    } catch (error) {
      Alert.alert('Recording error', 'Please try again')
    }
  }

  const stopRecording = async () => {
    try {
      await audioRecorder.stop()
      setIsTranscribing(false)
      if (audioRecorder.uri) {
        try {
          setIsTranscribing(true)
          const base64 = await FileSystem.readAsStringAsync(audioRecorder.uri, {
            encoding: FileSystem.EncodingType.Base64
          })
          const text = await transcribeAudio(base64)
          setMessage((prev) => (prev ? `${prev} ${text}` : text))
        } catch (error) {
          Alert.alert('Transcription error', 'Please try again')
        } finally {
          setIsTranscribing(false)
        }
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
            <Pressable
              disabled={isTranscribing}
              onPress={isRecording ? stopRecording : startRecording}>
              {isTranscribing ? (
                <ActivityIndicator size={24} color='white' />
              ) : (
                <MaterialCommunityIcons
                  name='microphone'
                  size={24}
                  color={isRecording ? 'white' : 'gray'}
                />
              )}
            </Pressable>
            {isWaitingForResponse ? (
              <Pressable
                onPress={onStop}
                className='ml-auto bg-white rounded-full p-2'>
                <MaterialCommunityIcons name='stop' size={24} color='red' />
              </Pressable>
            ) : (
              (!!message || imageBase64) && (
                <View className='bg-white rounded-full p-2'>
                  <MaterialCommunityIcons
                    name='arrow-up'
                    size={24}
                    color='black'
                    className='ml-auto'
                    onPress={handleSend}
                  />
                </View>
              )
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
