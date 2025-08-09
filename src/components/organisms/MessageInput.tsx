import { Paperclip, Send, Smile } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
  isConnected?: boolean;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  isConnected = true,
  disabled = false
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [hasTyped, setHasTyped] = useState(false)

  const handleSend = () => {
    if (message.trim() && isConnected && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      setHasTyped(false)

      // Stop typing indicator when sending
      if (onStopTyping) {
        onStopTyping()
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value
    setMessage(newMessage)

    // Handle typing indicators
    if (newMessage.length > 0 && !hasTyped && onStartTyping) {
      onStartTyping()
      setHasTyped(true)
    } else if (newMessage.length === 0 && hasTyped && onStopTyping) {
      onStopTyping()
      setHasTyped(false)
    }
  }

  // Auto-stop typing after 3 seconds of inactivity
  useEffect(() => {
    if (hasTyped && onStopTyping) {
      const timer = setTimeout(() => {
        onStopTyping()
        setHasTyped(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [message, hasTyped, onStopTyping])

  return (
    <div className="p-5 bg-white border-t border-gray-200">
      {/* Connection status indicator */}
      {!isConnected && (
        <div className="mb-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1">
          Not connected to chat server
        </div>
      )}

      <div className="flex items-center space-x-3">
        <div className="flex-1 w-full">
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 w-full">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200 cursor-not-allowed">
              <Paperclip className="w-4 h-4 text-gray-500" />
            </Button>
            <input
              type="text"
              placeholder={
                disabled
                  ? "Chat disabled"
                  : !isConnected
                    ? "Connecting..."
                    : "Type a message..."
              }
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={disabled || !isConnected}
              className="flex-1 bg-transparent outline-none resize-none disabled:cursor-not-allowed disabled:text-gray-400"
            />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200 cursor-not-allowed">
              <Smile className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || !isConnected}
          className="h-10 w-10 p-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
