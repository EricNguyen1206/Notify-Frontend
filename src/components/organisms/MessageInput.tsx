import { getPublicUrl, handleFileUpload } from "@/lib/supabase";
import { Paperclip, Send } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface MessageInputProps {
  onSendMessage: (message: string, url?: string, fileName?: string) => void;
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
  disabled = false,
}: MessageInputProps) {
  const messageRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  //   const [hasTyped, setHasTyped] = useState(false);

  const handleSend = () => {
    const messageValue = messageRef.current?.value || "";
    if (messageValue.trim() && isConnected && !disabled && !isUploading) {
      onSendMessage(messageValue.trim());
      if (messageRef.current) {
        messageRef.current.value = "";
      }
      //   setHasTyped(false);

      // // Stop typing indicator when sending
      // if (onStopTyping) {
      //     onStopTyping()
      // }
    }
  };

  const triggerFilePicker = () => {
    if (disabled || !isConnected || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || disabled || !isConnected) return;

    try {
      setIsUploading(true);
      const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "uploads";
      const FOLDER = "public";

      const uploaded = await handleFileUpload(BUCKET, FOLDER, file);
      if (!uploaded?.path) {
        return;
      }

      const storedFileName = uploaded.path.split("/").pop() || uploaded.path;
      const publicUrl = await getPublicUrl(BUCKET, FOLDER, storedFileName);

      // Send message with attachment URL and original file name
      onSendMessage("", publicUrl, file.name);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      // reset input value to allow re-selecting the same file
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;

    // // Handle typing indicators
    // if (newMessage.length > 0 && !hasTyped && onStartTyping) {
    //   onStartTyping();
    //   setHasTyped(true);
    // } else if (newMessage.length === 0 && hasTyped && onStopTyping) {
    //   onStopTyping();
    //   setHasTyped(false);
    // }
  };

  //   // Auto-stop typing after 3 seconds of inactivity
  //   useEffect(() => {
  //     if (hasTyped && onStopTyping) {
  //       const timer = setTimeout(() => {
  //         onStopTyping();
  //         setHasTyped(false);
  //       }, 3000);

  //       return () => clearTimeout(timer);
  //     }
  //   }, [hasTyped, onStopTyping]);

  const getMessageValue = () => {
    return messageRef.current?.value || "";
  };

  return (
    <div className="p-chat-outer bg-background border-t border-chat-border">
      <div className="h-[40px] flex items-center space-x-3">
        <div className="flex-1 w-full flex items-center space-x-2">
          <div className="">
            <input id="picture" type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
            <Button onClick={triggerFilePicker} disabled={disabled || !isConnected || isUploading} className="h-10 w-10  p-0 hover:bg-chat-accent/10">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          <Input
            type="text"
            ref={messageRef}
            placeholder={disabled ? "Chat disabled" : !isConnected ? "Connecting..." : "Type a message..."}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={disabled || !isConnected || isUploading}
            className="flex-1 bg-transparent outline-none resize-none disabled:cursor-not-allowed disabled:text-gray-400 font-normal text-base"
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!getMessageValue().trim() || disabled || !isConnected || isUploading}
          className="h-10 w-10 p-0 bg-chat-primary hover:bg-chat-secondary disabled:bg-gray-300 rounded-chat"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
