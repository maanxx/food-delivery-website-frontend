# 🧪 WebRTC Handshake Fix - Testing Guide

## Quick Test (5 minutes)

### Step 1: Open the App

```bash
npm start
# or your usual start command
```

### Step 2: Enable Developer Console

Press `F12` → Click "Console" tab

### Step 3: Make a Voice Call

1. Login with two different accounts (use incognito mode for second account)
2. Navigate to chat with the other user
3. Click the **voice call button** (phone icon)
4. **Watch the console logs**

### Step 4: Check for Success Logs

Look for these logs in order:

```
✅ Registering call event listeners
✅ [createPeerConnection] SimplePeer created successfully
✅ [createPeerConnection] Peer marked as ready
📤 [peer.on.signal] SENDING WebRTC signal: offer
✅ Offer SDP contains audio media
✅ [socket.call_accepted] Call accepted by recipient
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

### Step 5: Verify Audio

- Both users should hear audio within **15 seconds**
- User on the receiving end should see "call accepted" dialog
- Remote audio should play automatically

---

## Detailed Diagnostic Test

### If You See Timeout Error

1. **Check peer readiness**:
    - Look for `Peer marked as ready`
    - If NOT found → Issue with peer initialization

2. **Check pending signals**:
    - Look for `Answer queued`
    - If NOT found → Backend not forwarding answer

3. **Check answer processing**:
    - Look for `Processing queued answer signal`
    - If NOT found → Peer was never marked ready

4. **Check connection**:
    - Look for `WebRTC connection established`
    - If NOT found → Answer structure might be invalid

---

## Expected Timeline

| Step                   | Expected Time | What's Happening                      |
| ---------------------- | ------------- | ------------------------------------- |
| Call initiated         | 0s            | Dialog shown to recipient             |
| Call accepted          | 1-2s          | Recipient clicks accept               |
| OFFER sent             | 2-3s          | Caller's peer generates offer         |
| Backend forwards OFFER | 3-5s          | Backend queues and sends to recipient |
| ANSWER generated       | 5-7s          | Recipient's peer generates answer     |
| ANSWER received        | 7-10s         | Caller receives answer from backend   |
| Stream connected       | 10-12s        | WebRTC connection established         |
| Audio playing          | 12-15s        | Remote stream received and played     |

If any step takes longer than expected, there might be a backend or network issue.

---

## Troubleshooting by Symptom

### Symptom: Timeout after 15 seconds

**Check these in console:**

1. Is "OFFER sent" logged?
    - NO → Peer didn't create offer (peer creation issue)
    - YES → Continue to #2

2. Is "Call accepted" logged?
    - NO → Recipient didn't accept or backend didn't notify (backend/socket issue)
    - YES → Continue to #3

3. Is "Answer queued" logged?
    - NO → Recipient didn't send answer (peer at recipient side not working)
    - YES → Continue to #4

4. Is "Processing queued answer signal" logged?
    - NO → Peer never marked as ready (peer initialization issue)
    - YES → Continue to #5

5. Is "Answer signaled successfully" logged?
    - NO → Answer structure invalid (backend issue)
    - YES → Continue to #6

6. Is "WebRTC connection established" logged?
    - NO → Peer didn't connect (network/ICE issue)
    - YES → Issue is with audio playback (CallWindow.jsx)

---

### Symptom: Users can see each other but can't hear

**Check these in console:**

1. Is "Remote stream received" logged?
    - NO → Peer didn't send stream (remote peer issue)
    - YES → Continue to #2

2. Is "Audio tracks: 1" logged?
    - NO → Remote peer didn't send audio (microphone muted or disabled)
    - YES → Continue to #3

3. Is "Audio playback started successfully" logged?
    - NO → Audio element issue (check CallWindow.jsx)
    - YES → Audio should be playing (check speaker volume)

---

### Symptom: One-way audio (can hear but not heard)

**This means:**

- Your side: ✅ Remote stream received, ✅ Audio playing
- Remote side: ❌ Remote stream NOT received, ❌ Audio timeout

**The remote side needs to fix their issue** - refer them to the timeout troubleshooting above.

---

## Console Filter Tips

### Show only WebRTC logs

```javascript
// Paste in console to filter
console.clear();
// Logs starting with ✅, ❌, 📞, 📤, 📥 are WebRTC-related
```

### Find the actual error

```javascript
// Search console for: ❌ Failed
// Or search for: ⚠️
```

### Monitor peer state

```javascript
// Look for these patterns in order:
// 1. SimplePeer created
// 2. Peer marked as ready
// 3. OFFER sent
// 4. ANSWER queued
// 5. ANSWER signaled
// 6. WebRTC connection established
// 7. Remote stream received
```

---

## Files Modified

- ✅ `src/hooks/useCall.js` - WebRTC signal handling and timeout logic
- ✅ `WEBRTC_HANDSHAKE_FIX.md` - Full technical details

---

## Rollback (if needed)

If something breaks, you can revert to the previous version by:

1. Using Git: `git checkout src/hooks/useCall.js`
2. Or manually restore from backup

But the changes are backwards compatible and should improve reliability.

---

## Success Criteria

✅ Call goes through within 15 seconds
✅ Remote audio is heard
✅ No timeout errors in console
✅ No "failed to signal" errors
✅ Connection established log appears

If all of the above are true, the fix is working! 🎉
