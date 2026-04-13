# Voice Chat Feature - Quick Start Guide

## Quick Integration Steps

### 1. **Voice Chat is Already Integrated! ✅**

The voice chat feature is fully implemented in your ChatWindow component. Users can start voice calls by:

1. Opening a conversation with another user
2. Clicking the phone icon in the chat header
3. Selecting "Voice Call" or "Video Call"

### 2. **What Users Need to Do**

#### For Voice Calls:

- ✅ Grant microphone permission when prompted
- ✅ Accept or reject incoming calls
- ✅ Allow browser notifications (optional)

#### For Video Calls:

- ✅ Grant camera AND microphone permission when prompted
- ✅ Same accept/reject flow

### 3. **Testing the Feature Locally**

#### Prerequisites:

- Two browser instances or windows (for testing)
- Microphone/Camera (for actual calls)
- WebSocket server running on port 5678

#### Test Steps:

1. Open app in two browser windows
2. Login with different users
3. User A searches for User B
4. Open conversation with User B
5. User A clicks phone icon
6. User B receives incoming call notification
7. User B clicks Accept
8. Voice call starts!

### 4. **Required Socket Events (Backend)**

Ensure your backend emits these WebSocket events:

```javascript
// For initiating call
socket.on("call_user", (data) => {
    // Forward to recipient
    io.to(recipientUserId).emit("incoming_call", {
        callId: generateId(),
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        conversationId: data.conversationId,
        callType: data.callType, // 'voice' or 'video'
    });
});

// For accepting call
socket.on("accept_call", (data) => {
    // Notify caller about acceptance
    io.to(data.toUserId).emit("call_accepted", {
        callId: data.callId,
        fromUserId: currentUserId,
    });
});

// For rejecting call
socket.on("reject_call", (data) => {
    io.to(data.toUserId).emit("call_rejected", {
        reason: data.reason,
    });
});

// For WebRTC signaling
socket.on("offer", (data) => {
    io.to(data.toUserId).emit("offer", {
        offer: data.offer,
        fromUserId: currentUserId,
    });
});

socket.on("answer", (data) => {
    io.to(data.toUserId).emit("answer", {
        answer: data.answer,
        fromUserId: currentUserId,
    });
});

socket.on("ice_candidate", (data) => {
    io.to(data.toUserId).emit("ice_candidate", {
        candidate: data.candidate,
        fromUserId: currentUserId,
    });
});

// For ending call
socket.on("end_call", (data) => {
    io.to(data.toUserId).emit("call_ended");
});
```

### 5. **Enabling Browser Notifications**

When users first try to make/receive a call, they'll see:

- A request for notification permission
- Browser notification will show for incoming calls

Users can enable notifications in browser settings:

- Chrome/Edge: Settings → Privacy → Notifications
- Firefox: Security tab → Permissions → Notifications
- Safari: Settings → Websites → Notifications

### 6. **Testing with Media Devices**

Use the `mediaHelper` utility to check device availability:

```javascript
import { getDeviceInfo } from "@helpers/mediaHelper";

// Check device capabilities
const info = await getDeviceInfo();
console.log("Device Info:", info);
// Returns: {
//   webRTCSupported: true,
//   audioAvailable: true,
//   videoAvailable: true,
//   audioPermission: true,
//   videoPermission: true,
//   userAgent: "...",
//   platform: "..."
// }
```

### 7. **Handling Common Issues**

#### Issue: "Unable to determine recipient"

**Cause:** Conversation data missing recipient information
**Fix:** Ensure conversation has proper structure with user IDs

#### Issue: "Permission denied"

**Cause:** User blocked microphone/camera
**Fix:** Check browser permissions, enable in settings, refresh page

#### Issue: "Group calls are not yet supported"

**Cause:** User tried to call in a group chat
**Fix:** Only 1-to-1 conversations support calls for now

#### Issue: "No camera/microphone found"

**Cause:** Device not connected or recognized
**Fix:** Check devices are connected, refresh browser, try different browser

### 8. **User Experience Flow**

```
Chat Screen
    ↓
Click Phone Icon
    ↓
SelectCall Type (Voice/Video)
    ↓
Grant Permissions
    ↓
Outgoing Call Screen (with dialing animation)
    ↓
Recipient Receives Notification
    ↓
Recipient Accepts/Rejects
    ↓
If Accepted → Active Call Screen
    ├─ Audio/Video Stream
    ├─ Call Duration Timer
    ├─ End Call Button
    └─ (Voice Calls: Audio Visualization)
    ↓
Call Ends & Cleans Up
```

### 9. **Features Available**

✅ Voice calls (audio only)
✅ Video calls (audio + video)
✅ Incoming call notifications
✅ Call duration tracking
✅ Audio visualization during voice calls
✅ Automatic stream cleanup
✅ Error handling with user-friendly messages
✅ Support for different browsers
✅ Responsive mobile UI

### 10. **Development Mode Debugging**

Enable detailed WebRTC logging:

```javascript
// In browser console
localStorage.setItem("DEBUG", "simple-peer:*");
// Refresh page - will see detailed SimplePeer logs
```

Monitor call state changes:

```javascript
// In ChatWindow component - already done, but can add:
useEffect(() => {
    console.log("Call State:", callState);
}, [callState]);
```

### 11. **Next Steps for Deployment**

1. ✅ Test locally with real devices
2. Deploy to staging environment
3. Test with real users
4. Configure TURN servers for NAT traversal (if behind corporate firewall)
5. Monitor call quality metrics
6. Gather user feedback
7. Optimize based on feedback

### 12. **Production Checklist**

- [ ] STUN/TURN servers configured
- [ ] Socket.io event handlers implemented
- [ ] Error monitoring set up
- [ ] User notifications enabled
- [ ] Mobile responsiveness tested
- [ ] Different browsers tested
- [ ] Network latency tested
- [ ] Privacy policy updated
- [ ] User documentation ready
- [ ] Support team trained

## Architecture Summary

```
ChatWindow
├── CallModal (Initiate Call UI)
├── CallWindow (Call UI)
│   ├── Incoming Call Panel
│   ├── Active Call Panel
│   │   ├── Video Streams
│   │   └── Audio Visualization
│   └── Outgoing Call Panel
└── useCall Hook
    ├── getMediaStream (Permission Handling)
    ├── initializePeerConnection (WebRTC)
    ├── makeCall (Initiate)
    ├── acceptCall (Accept)
    ├── rejectCall (Reject)
    └── endCall (Cleanup)

Signaling: Socket.io
├── incoming_call
├── call_accepted
├── call_rejected
├── offer/answer/ice_candidate
└── call_ended

Notifications: useCallNotification Hook
└── Browser Notifications
```

## Support & Troubleshooting

For detailed troubleshooting, see: `VOICE_CHAT_IMPLEMENTATION.md`

For media device utilities, see: `src/helpers/mediaHelper.js`

## Questions?

1. Check the console for detailed error messages
2. Review VOICE_CHAT_IMPLEMENTATION.md for detailed docs
3. Check browser developer tools for WebRTC stats
4. Test with mediaHelper utilities for device detection
