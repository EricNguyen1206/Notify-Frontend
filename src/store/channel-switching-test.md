# Channel Switching Logic Test

This document outlines the test scenarios for the updated channel management logic in the WebSocket store.

## Updated Channel Management Features

### 1. **State Tracking**
- `currentChannelId`: Tracks the currently active channel
- `joinedChannels`: Set of all channels the user has joined
- `isInChannel(channelId)`: Check if user is in a specific channel
- `getCurrentChannel()`: Get the current active channel

### 2. **Enhanced Methods**
- `joinChannel(channelId)`: Join a channel (prevents duplicate joins)
- `leaveChannel(channelId)`: Leave a channel (only if actually in it)
- `switchChannel(newChannelId)`: Properly switch between channels
- `leaveAllChannels()`: Leave all joined channels (used on disconnect)

## Test Scenarios

### Scenario 1: Initial Channel Join
```
User State: Not in any channel
Action: Navigate to Channel A
Expected Result:
- Join Channel A
- currentChannelId = "A"
- joinedChannels = {"A"}
```

### Scenario 2: Channel Switching
```
User State: In Channel A
Action: Navigate to Channel B
Expected Result:
- Leave Channel A
- Join Channel B
- currentChannelId = "B"
- joinedChannels = {"B"}
```

### Scenario 3: Same Channel Navigation
```
User State: In Channel A
Action: Navigate to Channel A (refresh/re-navigate)
Expected Result:
- No action taken (already in channel)
- currentChannelId = "A"
- joinedChannels = {"A"}
```

### Scenario 4: Leave Chat Entirely
```
User State: In Channel A
Action: Navigate away from chat (to different page)
Expected Result:
- Leave Channel A
- currentChannelId = null
- joinedChannels = {}
```

### Scenario 5: Disconnect
```
User State: In multiple channels
Action: WebSocket disconnect
Expected Result:
- Leave all channels
- currentChannelId = null
- joinedChannels = {}
- Clear all typing indicators
```

### Scenario 6: Reconnection
```
User State: Disconnected, was in Channel A
Action: Reconnect and navigate to Channel A
Expected Result:
- Join Channel A
- currentChannelId = "A"
- joinedChannels = {"A"}
```

## Implementation Details

### useWebSocketChannelManagement Hook Changes

**Before (Problematic):**
```typescript
useEffect(() => {
  if (isConnected() && channelId && !hasJoined) {
    joinChannel(String(channelId));
    setHasJoined(true);
  }

  // PROBLEM: This cleanup runs on every render
  return () => {
    if (channelId && hasJoined) {
      leaveChannel(String(channelId));
      setHasJoined(false);
    }
  };
}, [channelId, isConnected, hasJoined, joinChannel, leaveChannel]);
```

**After (Fixed):**
```typescript
// Handle channel switching when channelId changes
useEffect(() => {
  if (isConnected()) {
    switchChannel(currentChannelIdString);
  }
}, [channelId, isConnected, switchChannel, currentChannelIdString]);

// Leave channel only when component unmounts (navigating away from chat)
useEffect(() => {
  return () => {
    const currentChannel = getCurrentChannel();
    if (currentChannel && isConnected()) {
      switchChannel(null);
    }
  };
}, []); // Empty deps - only runs on mount/unmount
```

### WebSocket Store Changes

**Enhanced joinChannel:**
```typescript
joinChannel: (channelId: string) => {
  // Check if already in this channel
  if (joinedChannels.has(channelId)) {
    console.log('Already in channel:', channelId);
    return;
  }
  
  // Join and update state
  client.joinChannel(channelId);
  set((state) => {
    const newJoinedChannels = new Set(state.joinedChannels);
    newJoinedChannels.add(channelId);
    return { 
      joinedChannels: newJoinedChannels,
      currentChannelId: channelId 
    };
  });
}
```

**New switchChannel method:**
```typescript
switchChannel: (newChannelId: string | null) => {
  const { currentChannelId } = get();
  
  // If switching to the same channel, do nothing
  if (currentChannelId === newChannelId) {
    return;
  }
  
  // Leave current channel if we're in one
  if (currentChannelId) {
    get().leaveChannel(currentChannelId);
  }
  
  // Join new channel if specified
  if (newChannelId) {
    get().joinChannel(newChannelId);
  }
}
```

## Benefits of the New Implementation

1. **Prevents Duplicate Joins**: Won't join a channel if already in it
2. **Proper Channel Switching**: Automatically leaves previous channel when switching
3. **Clean State Management**: Tracks current channel and all joined channels
4. **Prevents Premature Leaves**: Only leaves channels when actually navigating away
5. **Efficient Operations**: Avoids unnecessary WebSocket messages
6. **Better Error Handling**: Validates channel state before operations
7. **Typing Indicator Cleanup**: Properly clears typing indicators when leaving channels

## Usage in Components

```typescript
const { 
  isInCurrentChannel, 
  currentChannel, 
  typingUsers, 
  connectionState 
} = useWebSocketChannelManagement(channelId);

// Check if we're in the right channel
if (isInCurrentChannel) {
  // Show channel content
} else {
  // Show loading or switching state
}

// Display current channel info
console.log('Current channel:', currentChannel);

// Show typing indicators for current channel
if (typingUsers.length > 0) {
  // Display typing indicators
}
```

This implementation ensures reliable channel switching behavior and prevents the issues that were occurring with the previous implementation.
