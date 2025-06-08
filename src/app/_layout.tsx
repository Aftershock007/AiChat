import '../../global.css'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Drawer } from 'expo-router/drawer'
import { StyleSheet } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import { DarkTheme, ThemeProvider } from '@react-navigation/native'
import HistoryChatsDrawer from '@/components/HistoryChatsDrawer'

const myTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: 'white'
  }
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={myTheme}>
        <Drawer
          drawerContent={HistoryChatsDrawer}
          screenOptions={{
            headerTitle: '',
            headerStyle: { backgroundColor: 'black' },
            drawerInactiveTintColor: 'white',
            drawerStyle: {
              borderRightColor: 'gray',
              borderRightWidth: StyleSheet.hairlineWidth
            }
          }}>
          <Drawer.Screen
            name='index'
            options={{
              drawerLabel: 'ChatGPT',
              drawerIcon: () => (
                <FontAwesome5 name='atom' size={18} color='white' />
              )
            }}
          />
          <Drawer.Screen
            name='chat/[id]'
            options={{ drawerItemStyle: { display: 'none' } }}
          />
        </Drawer>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
