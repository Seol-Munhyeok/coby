// src/store/userStore.js
import { create } from 'zustand'

export const useUserStore = create((set) => ({
  nickname: localStorage.getItem('nickname') || '',
  id: localStorage.getItem('userId') || null, // userId 상태 추가
  setNickname: (name) => {
    localStorage.setItem('nickname', name)
    set({ nickname: name })
  },
  setId: (newId) => { // setId 액션 추가
    localStorage.setItem('userId', newId) // userId를 localStorage에 저장
    set({ id: newId })
  },
}))
