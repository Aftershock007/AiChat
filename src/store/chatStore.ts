import { Chat, Message } from '@/types/types'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface ChatStore {
  chatHistory: Chat[]
  isWaitingForResponse: boolean
  abortController: AbortController | null
  setIsWaitingForResponse: (isWaitingForResponse: boolean) => void
  setAbortController: (controller: AbortController | null) => void
  createNewChat: (title: string) => string
  addNewMessage: (chatId: string, message: Message) => void
  updateMessage: (
    chatId: string,
    messageId: string,
    update: Partial<Message>
  ) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      chatHistory: [],
      isWaitingForResponse: false,
      abortController: null,
      setIsWaitingForResponse: (isWaitingForResponse: boolean) => {
        set({ isWaitingForResponse })
      },
      setAbortController: (controller: AbortController | null) => {
        set({ abortController: controller })
      },
      createNewChat: (title: string) => {
        const newChat: Chat = { id: Date.now().toString(), title, messages: [] }
        set((state) => ({ chatHistory: [newChat, ...state.chatHistory] }))
        return newChat.id
      },
      addNewMessage: (chatId: string, message: Message) => {
        set((state) => ({
          chatHistory: state.chatHistory.map((chat) =>
            chat.id === chatId
              ? { ...chat, messages: [...chat.messages, message] }
              : chat
          )
        }))
      },
      updateMessage: (
        chatId: string,
        messageId: string,
        update: Partial<Message>
      ) => {
        set((state) => ({
          chatHistory: state.chatHistory.map((chat) => {
            if (chat.id !== chatId) return chat
            return {
              ...chat,
              messages: chat.messages.map((m) =>
                m.id === messageId ? { ...m, ...update } : m
              )
            }
          })
        }))
      }
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ chatHistory: state.chatHistory })
    }
  )
)
