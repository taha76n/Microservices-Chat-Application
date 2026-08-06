"use client"
import { useAppData } from '@/src/context/AppContext'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const ChatApp = () => {
  const {isAuth, loading} = useAppData()
  const router = useRouter();
  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login")
    }
  },[isAuth, router, loading])
  return (
    <div>ChatApp</div>
  )
}

export default ChatApp