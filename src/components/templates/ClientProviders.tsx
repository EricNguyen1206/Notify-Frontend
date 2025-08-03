'use client'

import MessagesWebSocketProvider from "./MessagesWebSocketProvider"

export function ClientProviders({ userId, children }: { userId: number, children: React.ReactNode }) {
  return (
    <MessagesWebSocketProvider
      userId={userId}
      autoConnect={true}
    >
      {children}
    </MessagesWebSocketProvider>
  )
}