import { Paperclip, Send, Smile } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"

export default function MessageInput({ onSendMessage }: { onSendMessage: (message: string) => void }) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    console.log("TEST ", message);
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log("TEST ", message);
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-5 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="flex-1 w-full">
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 w-full">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200 cursor-not-allowed">
              <Paperclip className="w-4 h-4 text-gray-500" />
            </Button>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent outline-none resize-none"
            />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200 cursor-not-allowed">
              <Smile className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          className="h-10 w-10 p-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}