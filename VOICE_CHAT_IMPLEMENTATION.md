# Voice Chat Feature Implementation Guide

## Overview

The voice chat feature enables real-time one-to-one voice and video calls between users using WebRTC with SimplePeer and Socket.io for signaling.

## Architecture

### Core Components

#### 1. **useCall Hook** (`src/hooks/useCall.js`)

- Manages the entire call lifecycle
- Handles peer connection using SimplePeer
- Manages audio/video streams
- Tracks call state (incoming, outgoing, active)
- **Features:**
    - Browser support detection
    - Detailed permission error handling
    - WebRTC signaling with ICE candidates
    - Automatic cleanup on call end
    - Call duration tracking

#### 2. **CallWindow Component** (`src/components/Chat/CallWindow.jsx`)

- Displays incoming call interface
- Shows active call with video/audio
- Displays outgoing call waiting screen
- **UI Modes:**
    - **Incoming Call:** Shows caller info with accept/reject buttons
    - **Active Call:** Full-screen call interface with duration timer
    - **Outgoing Call:** Shows recipient with dialing animation
    - **Voice Call:** Custom avatar display with audio visualization
    - **Video Call:** Video streams with PiP local camera

#### 3. **CallModal Component** (`src/components/Chat/CallModal.jsx`)

- Modal to initiate new voice or video calls
- Shows loading state during call initiation
- Displays error messages

#### 4. **AudioVisualization Component** (in CallWindow.jsx)

- Real-time audio level visualization using Canvas
- Shows frequency spectrum during voice calls
- Animated bars representing audio levels

#### 5. **useCallNotification Hook** (`src/hooks/useCallNotification.js`)

- Manages browser notifications for incoming calls
- Requests notification permission from user
- Shows notifications even when app is not focused

### WebSocket Events Flow

#### Initiating a Call

1. User clicks phone/video icon → Opens CallModal
2. User selects Voice/Video → `handleInitiateVoiceCall()` or `handleInitiateVideoCall()`
3. `getRecipientId()` determines the other user
4. `makeCall()` is invoked with recipient ID
5. Media stream is requested (audio/video)
6. Peer connection is initialized as initiator
7. `call_user` event emitted via socket to recipient

#### Receiving a Call

1. Recipient receives `incoming_call` socket event
2. CallWindow component shows incoming call UI
3. Browser notification is displayed
4. User can accept or reject

#### Accepting a Call

1. User clicks Accept button
2. Media stream is requested
3. Peer connection is initialized as non-initiator
4. `accept_call` event is emitted
5. WebRTC negotiation begins (offer/answer exchange)

#### Call State Management

- `incoming_call` → Incoming call notification
- `call_accepted` → Transition to active call
- `offer` ↔ `answer` ↔ `ice_candidate` → WebRTC signaling
- `call_ended` → Call termination

## Features

### ✅ Implemented Features

- [x] Voice calls (audio only)
- [x] Video calls
- [x] Call duration tracking
- [x] Audio visualization during voice calls
- [x] Incoming call notifications (browser + UI)
- [x] Call accept/reject functionality
- [x] Automatic stream cleanup
- [x] WebRTC peer connection management
- [x] ICE candidate handling
- [x] Error handling for permission issues
- [x] Support for different browser types
- [x] Responsive UI for mobile

### 🔄 Call States

```
Idle → Outgoing Initiated → Active Call → Ended
  ↑
  └── Incoming Call → Accept/Reject → Active/Ended
```

## Usage

### Starting a Voice Call

```javascript
// In ChatWindow component
const handleInitiateVoiceCall = async () => {
    const recipientId = getRecipientId();
    if (!recipientId) return;

    await makeCall(recipientId, conversationId, "voice");
};
```

### Accepting an Incoming Call

```javascript
// Call hook provides acceptCall function
await acceptCall("voice"); // or "video"
```

### Ending a Call

```javascript
// Call hook provides endCall function
endCall();
```

## Requirements

### Browser Support

- WebRTC support (Chrome, Firefox, Safari, Edge)
- MediaDevices API
- AudioContext API (for visualization)
- Notification API (optional, for call notifications)

### Permissions Required

- **Microphone:** Required for voice calls
- **Camera:** Required for video calls
- **Notification:** Optional, ask user for incoming call notification

### Dependencies

- `simple-peer` (^9.11.1) - WebRTC library
- `socket.io-client` (^4.8.3) - Socket signaling
- `antd` (^5.22.7) - UI components
- `react` (^18.3.1) - React framework

## Error Handling

### Permission Errors

- **NotAllowedError:** User denied permission
    - UI shows: "Permission denied. Please enable camera/microphone in browser settings."
- **NotFoundError:** No device found
    - UI shows: "No camera/microphone found on your device"
- **NotReadableError:** Device in use
    - UI shows: "Camera/Microphone is already in use by another application"

### Connection Errors

- Failed WebRTC connection with detailed error messages
- Automatic fallback and error recovery
- User-friendly error messages displayed

## Performance Considerations

1. **Stream Cleanup:** Automatic stop of media tracks on call end
2. **Memory Leaks:** Proper cleanup of event listeners
3. **ICE Servers:** Public STUN servers for NAT traversal
4. **Compression:** No compression, use raw WebRTC for low latency

## Security

1. **Token-Based Authentication:** Socket.io authenticated with JWT
2. **User Validation:** Recipient ID verified before call
3. **Stream Encryption:** WebRTC uses DTLS-SRTP for encryption
4. **No Data Storage:** Streams processed in memory only

## Testing

### Manual Testing Checklist

- [ ] Voice call initiation works
- [ ] Video call initiation works
- [ ] Accept incoming call works
- [ ] Reject incoming call works
- [ ] Call duration timer works
- [ ] Audio visualization displays correctly
- [ ] Call end properly cleans up resources
- [ ] Error messages display correctly
- [ ] Notifications appear for incoming calls
- [ ] Works on mobile devices
- [ ] Works in different browsers

### Testing Scenarios

1. **Basic Voice Call**
    - Initiate voice call → Accept → Verify audio → End call
2. **Video Call**
    - Initiate video call → Accept → Verify video → End call
3. **Rejected Call**
    - Initiate call → Reject → Verify caller sees rejection
4. **Permission Denied**
    - Deny microphone permission → Verify error message
5. **Network Disruption**
    - Start call → Disconnect network → Verify error handling

## Troubleshooting

### Common Issues

#### "Group calls are not yet supported"

- User tried to call in group conversation
- Solution: Only works with 1-to-1 conversations

#### "Unable to determine recipient"

- Conversation data is malformed
- Solution: Check conversation structure, verify it has recipient IDs

#### "Permission denied"

- User blocked microphone/camera access
- Solution: Check browser settings, enable permissions, reload page

#### No audio/video during call

- Stream not properly connected
- Solution: Check devices, verify permissions, try different browser

#### Call not connecting

- Network/firewall issue
- Solution: Check internet connection, try without VPN, check STUN server

## API Integration

### Call Service Endpoints

```javascript
POST / api / calls / initiate; // Start a call
POST / api / calls / { callId } / accept; // Accept call
POST / api / calls / { callId } / reject; // Reject call
POST / api / calls / { callId } / end; // End call
GET / api / calls / active; // Get active calls
GET / api / calls / history / { id }; // Get call history
```

## Future Enhancements

1. **Screen Sharing**
2. **Call Recording**
3. **Call Transfer**
4. **Conference Calls**
5. **Message During Call**
6. **Call Statistics (latency, quality)**
7. **Bandwidth Adaptation**
8. **Call History and Analytics**

## Configuration

### Environment Variables

```env
REACT_APP_SOCKET_URL=http://localhost:5678
REACT_APP_STUN_SERVERS=["stun:stun1.l.google.com:19302"]
```

### STUN/TURN Servers (For Production)

Replace default STUN servers in useCall.js with production servers:

```javascript
iceServers: [
    { urls: ["stun:stun1.l.google.com:19302"] },
    {
        urls: ["turn:your-turn-server.com:3478"],
        username: "user",
        credential: "password",
    },
];
```

## Files Modified/Created

### Modified Files

- `src/components/Chat/ChatWindow.jsx` - Optimized recipient detection
- `src/components/Chat/CallWindow.jsx` - Added audio visualization
- `src/components/Chat/CallWindow.module.css` - Added visualization styles
- `src/hooks/useCall.js` - Enhanced error handling

### New Files

- `src/hooks/useCallNotification.js` - Browser notification hook

## Support

For issues or questions:

1. Check browser console for detailed error logs
2. Verify all permissions are granted
3. Check network connectivity
4. Try in incognito mode
5. Test in different browser
