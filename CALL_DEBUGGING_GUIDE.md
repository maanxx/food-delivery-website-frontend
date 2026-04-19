# Voice Call Debugging Guide

## Problem

Remote audio stream not received during voice calls - users can't hear each other.

## Root Cause Investigation

The issue is that the `peer.on('stream')` event is **never triggered**, which means the WebRTC handshake is incomplete.

### WebRTC Handshake Flow (Expected)

```
1. Caller sends OFFER via socket.emit("offer")
   ✅ Confirmed in logs: "📤 [peer.on.signal] SENDING WebRTC signal: offer"

2. Backend forwards OFFER to receiver
   ⚠️ Cannot verify - depends on backend

3. Receiver creates ANSWER and sends via socket.emit("answer")
   ❓ NOT SEEN in logs! This is the problem!

4. Backend forwards ANSWER back to caller
   ❓ NOT SEEN in logs!

5. Caller receives ANSWER and signals to peer
   ❓ NOT SEEN in logs!

6. SimplePeer emits 'stream' event with remote stream
   ❌ NEVER HAPPENS - this is why we can't hear!
```

## Enhanced Logging Added

### In `useCall.js`:

1. **call_accepted Event Handler**
    - Now logs ALL keys in the data object
    - Checks if `answer` is included in the event
    - If answer exists, signals it immediately to peer
2. **Socket Event Listeners**
    - Logs when listeners are registered
    - Shows socket ID
    - Lists all events being monitored

3. **Timeout Detector**
    - Waits 5 seconds for remote stream
    - If not received, logs detailed diagnostic info
    - Shows current state and refs for debugging

4. **Answer Event Handler**
    - Enhanced logging to show answer data
    - Confirms answer signaled to peer

5. **ICE Candidate Handler**
    - Logs when candidates are received
    - Confirms candidates signaled to peer

## What to Look For in Logs

### ✅ Success Indicators (should see all of these)

```
✅ Registering call event listeners
📤 [peer.on.signal] SENDING WebRTC signal: offer
✅ Offer SDP contains audio media
✅ [socket.call_accepted] Call accepted
📞 [socket.on.answer] RECEIVED ANSWER from backend
   OR
📞 [socket.call_accepted] ANSWER included in call_accepted event!
📥 [peer.on.stream] Received remote media stream
🎧 [CallWindow] Setting up remote audio
✅ Audio playback started successfully
```

### ❌ Failure Indicators (if you see these, problem found)

```
⚠️ [Timeout] Remote stream not received after 5 seconds!
   This means steps 3-5 above failed

❓ [socket.on.answer] peerRef.current is null!
   Peer not created before answer received

⚠️ NO AUDIO TRACKS IN REMOTE STREAM!
   Remote peer not sending audio
```

## Testing Steps

1. **Make a voice call**
2. **Wait for "call_accepted" log**
3. **Check if "answer" is received:**
    - Look for `📞 [socket.on.answer] RECEIVED ANSWER`
    - OR look for `ANSWER included in call_accepted event`
4. **If answer received**, check for:
    - `📥 [peer.on.stream] Received remote media stream`
5. **If remote stream received**, check for:
    - `🎧 [CallWindow] Setting up remote audio`
    - `✅ Audio playback started successfully`

## Possible Issues & Solutions

### Issue 1: Answer Never Received

**Symptom**: No logs with "📞 [socket.on.answer]" or "ANSWER included in call_accepted"

**Possible Causes**:

- Backend not forwarding answer from receiver
- Answer is in a different socket event name
- Network issues preventing message delivery

**What to Check**:

1. Backend logs to see if receiver is sending answer
2. Try to find all socket events received (look for "📡 Socket event")

### Issue 2: Peer Not Ready When Answer Arrives

**Symptom**: "⚠️ [socket.on.answer] peerRef.current is null!"

**Possible Causes**:

- Answer arriving before peer connection created
- Cleanup happening too early

**What to Check**:

1. Timing of peer creation vs answer received
2. Is peerRef.current being set correctly?

### Issue 3: Remote Not Sending Audio

**Symptom**: Stream received but "⚠️ NO AUDIO TRACKS IN REMOTE STREAM!"

**Possible Causes**:

- Remote user's microphone not enabled
- Remote browser permissions not granted
- Remote peer not including audio in constraints

**What to Check**:

1. Ensure remote user grants microphone permission
2. Check remote user's audio track is enabled
3. Verify audio constraint in getMediaStream()

## How to Debug Backend

If all frontend logs are correct but still no remote stream, the backend is the issue:

1. **Check if backend receives the OFFER** from initiator
2. **Check if backend forwards OFFER** to receiver
3. **Check if backend receives ANSWER** from receiver
4. **Check if backend forwards ANSWER** to initiator
5. **Check if backend forwards ICE candidates** in both directions

## Files Modified

- `src/hooks/useCall.js` - Enhanced logging & answer handling
- `src/components/Chat/CallWindow.jsx` - Audio playback setup

## Next Steps

1. Run a voice call with these logs enabled
2. Paste the logs here for analysis
3. I can pinpoint exactly where the problem is
