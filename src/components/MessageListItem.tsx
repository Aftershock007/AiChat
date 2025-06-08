import { Text, View } from 'react-native'
import Markdown from 'react-native-markdown-display'
import { markdownStyles } from '@/utils/markdown'

export default function MessageListItem({ messageItem }: any) {
  const { message, role } = messageItem
  const isUser = role === 'user'

  return (
    <View
      className={`flex-row mb-3 px-2 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}>
      <View
        className={`rounded-xl px-3 py-2 ${
          isUser && 'bg-[#262626] max-w-[75%]'
        }`}>
        <Markdown style={markdownStyles}>{message}</Markdown>
      </View>
    </View>
  )
}
