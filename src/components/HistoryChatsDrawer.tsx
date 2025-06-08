import {
  DrawerContent,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList
} from '@react-navigation/drawer'
import { router, usePathname } from 'expo-router'
import chatHistory from '@assets/data/chatHistory.json'

export default function HistoryChatsDrawer(props: DrawerContentComponentProps) {
  const pathName = usePathname()

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
