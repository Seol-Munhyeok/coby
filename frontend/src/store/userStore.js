// src/store/userStore.js
import { create } from 'zustand'

export const useUserStore = create((set) => ({
  nickname: localStorage.getItem('nickname') || '',
  setNickname: (name) => {
    localStorage.setItem('nickname', name)
    set({ nickname: name })
  },
}))
