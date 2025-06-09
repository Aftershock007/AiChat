import { Image, View } from 'react-native'
import Markdown from 'react-native-markdown-display'
import { markdownStyles } from '@/utils/markdown'
import { Message } from '@/types/types'

interface MessageListItemProps {
  messageItem: Message
}

export default function MessageListItem({ messageItem }: MessageListItemProps) {
  const { message, role, image } = messageItem
  const isUser = role === 'user'

  return (
    <View className={`mb-3 px-2 ${isUser ? 'items-end' : 'items-start'}`}>
      {!!image && (
        <Image
          source={{ uri: image }}
          className={`${
            isUser ? 'w-40 h-40' : 'w-full aspect-square'
          } rounded-lg mb-2`}
          resizeMode='cover'
        />
      )}
      {!!message && (
        <View
          className={`rounded-xl px-3 py-2 ${
            isUser && 'bg-[#262626] max-w-[75%]'
          }`}>
          <Markdown style={markdownStyles}>{message}</Markdown>
        </View>
      )}
    </View>
  )
}
