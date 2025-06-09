import { useChatStore } from '@/store/chatStore'
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList
} from '@react-navigation/drawer'
import { router, usePathname } from 'expo-router'

export default function HistoryChatsDrawer(props: DrawerContentComponentProps) {
  const pathName = usePathname()
  const chatHistory = useChatStore((state) => state.chatHistory)

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      {chatHistory.map((chat) => (
        <DrawerItem
          key={chat.id}
          label={chat.title}
          inactiveTintColor='white'
          focused={pathName === `/chat/${chat.id}`}
          onPress={() => router.push(`/chat/${chat.id}`)}
        />
      ))}
    </DrawerContentScrollView>
  )
}
