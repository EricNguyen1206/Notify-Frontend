### Tính năng: Gửi tin nhắn kèm file (upload Supabase)

- Đã cập nhật `src/components/organisms/MessageInput.tsx` để hỗ trợ chọn tệp và upload lên Supabase Storage bằng các helper sẵn có (`handleFileUpload`, `getPublicUrl`). Sau khi upload, component gọi `onSendMessage("", publicUrl, originalFileName)` để gửi tin nhắn kèm đường dẫn file.
- Mở rộng chữ ký props `onSendMessage` của `MessageInput` thành `(message: string, url?: string, fileName?: string)`.
- Điều chỉnh `src/app/messages/[id]/action.ts` để `handleSendMessage(message, url?, fileName?)` chuyển tiếp đủ tham số sang `useSocketStore.sendMessage(channelId, message, url, fileName)`.
- Không thay đổi `useChatStore` vì đã có sẵn thuộc tính `url` và `fileName` trong `Message` và phần nhận tin WebSocket đã map các trường này.

#### Yêu cầu cấu hình
- Cần đặt biến môi trường Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Tùy chọn: `NEXT_PUBLIC_SUPABASE_BUCKET` (mặc định `uploads` nếu không cấu hình).
- Bucket phải bật public và có thư mục `messages` hoặc quyền cho phép tạo file mới trong đường dẫn `messages/`.

#### Cách sử dụng
- Trong màn hình `messages/[id]`, người dùng có thể:
  - Nhập tin nhắn văn bản và nhấn Enter hoặc nút gửi.
  - Bấm icon kẹp giấy để chọn tệp. Tệp sẽ được upload, tạo public URL và gửi thành tin nhắn chỉ chứa file (không có text) với `url` và `fileName`.
- Nút gửi và input sẽ bị disable trong lúc upload để tránh gửi trùng.

#### File đã chỉnh sửa
- `src/components/organisms/MessageInput.tsx`
- `src/app/messages/[id]/action.ts`

#### Ghi chú kỹ thuật
- Upload sử dụng `handleFileUpload(bucket, folder, file)`, sau đó lấy public link bằng `getPublicUrl(bucket, folder, storedFileName)`.
- Đường dẫn file lưu trên server là `${folder}/file_${Date.now()}.${ext}`; client hiển thị tên tệp gốc qua `file.name`.
- Socket đã hỗ trợ `(text, url, fileName)` nên chỉ cần truyền đúng tham số.
