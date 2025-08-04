// WebSocket message types
export enum WS_MESSAGE_TYPE {
	// Connection events
	MessageTypeConnect = "connection.connect",
	MessageTypeDisconnect = "connection.disconnect",
	MessageTypePing = "connection.ping",
	MessageTypePong = "connection.pong",

	// Channel events
	MessageTypeJoinChannel = "channel.join",
	MessageTypeLeaveChannel = "channel.leave",
	MessageTypeChannelMessage = "channel.message",
	MessageTypeTyping = "channel.typing",
	MessageTypeStopTyping = "channel.stop_typing",

	// Channel member events
	MessageTypeMemberJoin = "channel.member.join",
	MessageTypeMemberLeave = "channel.member.leave",

	// User events
	MessageTypeUserStatus = "user.status",
	MessageTypeNotification = "user.notification",

	// Error events
	MessageTypeError = "error",
}