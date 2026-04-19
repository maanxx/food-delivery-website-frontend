# 🔧 WebRTC Handshake Timeout Fix

## Problem

Remote stream not received after 5 seconds, causing WebRTC handshake to fail:

```
❌ [Timeout] Remote stream not received after 5 seconds!
This means the WebRTC handshake did NOT complete successfully
```

## Root Causes Fixed

### 1. **Race Condition: Answer Arrives Before Peer Ready**

- **Problem**: Signals (OFFER, ANSWER, ICE candidates) arrived before the peer connection was fully initialized
- **Solution**: Queue pending signals and process them when peer is marked as ready
- **Code**: Added `pendingSignalsRef` and `processPendingSignals()` function

### 2. **Insufficient Timeout Window**

- **Problem**: 5 seconds is too short for real-world network latency + browser processing
- **Solution**: Increased timeout from 5 seconds to 15 seconds
- **Impact**: Allows more time for signals to propagate through backend

### 3. **Missing Signal Structure Validation**

- **Problem**: Answer signal might arrive in unexpected format, causing silent failures
- **Solution**: Added validation in `processPendingSignals()` to check answer structure
- **Checks**:
    - Answer must have `type: 'answer'`
    - Answer must have `sdp` field
    - Retry failed signals up to 3 times

### 4. **Peer Readiness Not Tracked**

- **Problem**: Didn't know when peer was ready to receive signals
- **Solution**: Added `peerReadyRef` to track peer readiness state
- **Implementation**:
    - Set to `true` after 100ms when peer is created
    - Also set to `true` when `peer.on('connect')` fires
    - Process pending signals when peer becomes ready

---

## Changes Made

### File: `src/hooks/useCall.js`

#### New Refs Added

```javascript
const peerReadyRef = useRef(false); // Track if peer is ready
const pendingSignalsRef = useRef([]); // Queue signals if not ready
const answerRetryCountRef = useRef(0); // Track retry attempts
```

#### New Function: `processPendingSignals()`

- Processes queued signals when peer is ready
- Validates signal structure before signaling
- Implements retry logic for failed answers
- Logs detailed progress for debugging

#### Updated: `call_accepted` Handler

```javascript
// Queue signals instead of signaling immediately
if (data.answer && !isCleaningUpRef.current) {
    pendingSignalsRef.current.push({
        data: data.answer,
        type: "answer",
        receivedAt: Date.now(),
    });
    console.log(`📋 Answer queued (pending signals: ${pendingSignalsRef.current.length})`);

    if (peerReadyRef.current && peerRef.current) {
        processPendingSignals();
    }
}
```

#### Updated: `answer` Event Handler

```javascript
// Queue signals instead of signaling immediately
if (!isCleaningUpRef.current) {
    pendingSignalsRef.current.push({
        data: data.answer,
        type: "answer",
        receivedAt: Date.now(),
    });
    console.log(`📋 Answer queued (pending signals: ${pendingSignalsRef.current.length})`);

    if (peerReadyRef.current && peerRef.current) {
        processPendingSignals();
    }
}
```

#### Updated: `peer.on('connect')` Handler

```javascript
peer.on("connect", () => {
    console.log("✅ [peer.on.connect] WebRTC connection established");
    // Mark peer as ready and process any pending signals
    peerReadyRef.current = true;
    console.log("✅ [peer.on.connect] Peer marked as ready, processing pending signals...");
    processPendingSignals();
});
```

#### Updated: Peer Creation

```javascript
// Mark peer as ready after a short delay
setTimeout(() => {
    if (!isCleaningUpRef.current && peerRef.current === peer) {
        peerReadyRef.current = true;
        console.log("✅ [createPeerConnection] Peer marked as ready");
        processPendingSignals();
    }
}, 100);
```

#### Updated: Remote Stream Timeout

```javascript
// Increased from 5000ms to 15000ms
const timeoutId = setTimeout(() => {
    if (!callState.remoteStream && callState.inCall) {
        console.error("❌ [Timeout] Remote stream not received after 15 seconds!");
        console.error("   Diagnostic information:");
        console.error("   - Peer ready:", peerReadyRef.current);
        console.error("   - Pending signals:", pendingSignalsRef.current.length);
        // ... more diagnostic info
    }
}, 15000);
```

---

## Testing the Fix

### Expected Console Logs (Success)

```
✅ Registering call event listeners
✅ [makeCall] Peer connection initialized
✅ [createPeerConnection] SimplePeer created successfully
✅ [createPeerConnection] Peer marked as ready
📤 [peer.on.signal] SENDING WebRTC signal: offer
✅ Offer SDP contains audio media
✅ [socket.call_accepted] Call accepted
📋 Answer queued (pending signals: 1)
📤 [processPendingSignals] Processing queued answer signal
✅ Answer structure valid, signaling to peer...
✅ Answer signaled successfully
✅ [peer.on.connect] WebRTC connection established
📥 [peer.on.stream] Received remote media stream
✅ [peer.on.stream] Remote stream has 1 audio track(s)
🎧 [CallWindow] Setting up remote audio
✅ Audio playback started successfully
```

### How to Test

1. **Open browser Developer Tools** (F12)
2. **Go to Console tab**
3. **Make a voice or video call**
4. **Look for the logs above**
5. **Verify remote stream is received within 15 seconds**

### If Still Failing

1. **Check for pending signals**: Look for `📋 Answer queued` message
2. **Check peer ready state**: Look for `Peer marked as ready`
3. **Check for answer reception**: Look for `📤 [processPendingSignals]`
4. **Check for connection**: Look for `✅ [peer.on.connect]`
5. **If any step is missing**, it indicates a backend issue

---

## Diagnostic Information Added

### In Timeout Error

```
Diagnostic information:
- Peer ready: true/false
- Pending signals: number
- Peer instance: true/false
```

### Troubleshooting Steps Included

```
1. Check that both users are online
2. Check browser console for errors
3. Check network connectivity
4. Try refreshing the page and calling again
```

---

## Backward Compatibility

✅ All changes are backward compatible:

- Signal queuing happens transparently
- Timeout increase doesn't break anything
- Validation only rejects malformed signals
- Existing functionality unchanged

---

## Performance Impact

✅ Minimal performance impact:

- Queuing adds negligible memory/CPU overhead
- Validation happens once per signal
- Processing is done asynchronously
- No impact on normal call flow

---

## Next Steps if Still Failing

If timeouts continue after this fix:

1. **Backend Issue**: OFFER not being forwarded to receiver
2. **Network Issue**: Signals blocked by firewall/network
3. **Browser Issue**: WebRTC not supported or disabled
4. **Permission Issue**: Microphone permission denied

Check the diagnostic logs to determine which step is failing.
