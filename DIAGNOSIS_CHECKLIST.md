# 🔍 Voice Call Diagnosis - Checklist

The timeout error means **remote stream not received after 5 seconds**.
This indicates the **WebRTC handshake is incomplete**.

---

## 📋 Step-by-Step Diagnostic Checklist

### Step 1️⃣: OFFER Being Sent?

**Look for this log:**

```
📤 [peer.on.signal] SENDING WebRTC signal: offer, callId: ...
   Signal data: {type: 'offer', sdp: ...}
   Emitting 'offer' event to backend...
   ✅ Offer SDP contains audio media
   ✅ 'offer' emitted
```

**If you see this** → Step 2
**If you DON'T see this** → ❌ Peer connection not created

---

### Step 2️⃣: Call Accepted by Recipient?

**Look for this log:**

```
✅ [socket.call_accepted] Call accepted by recipient: {...}
✅ [socket.call_accepted] Event data contains: {
   callId: 'xxx',
   hasAnswer: true/false,
   hasAnswerField: true/false,
   allKeys: [...]
}
```

**IMPORTANT: Check `allKeys`** - what fields are in the event?

- If you see `answer` in allKeys → Step 3
- If you DON'T see `answer` in allKeys → ⚠️ Backend issue #1

---

### Step 3️⃣: ANSWER in call_accepted Event or Separate Event?

#### Option A: ANSWER in call_accepted

**Look for:**

```
📞 [socket.call_accepted] ANSWER included in call_accepted event!
   Answer data: {type: 'answer', sdp: ...}
   Signaling answer to peer...
   ✅ Answer signaled successfully
```

#### Option B: ANSWER in Separate Event

**Look for:**

```
📞 [socket.on.answer] RECEIVED ANSWER from backend
   Answer data: {type: 'answer', sdp: ...}
   Received and signaling answer
   ✅ Answer signaled to peer
```

**If you see EITHER of these** → Step 4
**If you see NEITHER** → ❌ **BACKEND ISSUE #2** - Answer not being forwarded

---

### Step 4️⃣: Remote Stream Received?

**Look for:**

```
📥 [peer.on.stream] Received remote media stream
   Stream ID: xxx
   Stream tracks: 1
   Audio tracks: 1, Video tracks: 0
   Track 0: {
      kind: 'audio',
      enabled: true,
      readyState: 'live',
      label: '...'
   }
   ✅ [peer.on.stream] Remote stream has 1 audio track(s)
```

**If you see this** → Step 5
**If you DON'T see this** → ⚠️ Stream event not emitted (answer issue)

---

### Step 5️⃣: Audio Playback Started?

**Look for:**

```
🎧 [CallWindow] Setting up remote audio
   Stream: {...}
   Stream ID: xxx
   Audio tracks count: 1
   Attempting to play audio...
   ✅ Audio playback started successfully
```

**If you see this** → ✅ **Everything working! Audio should play**
**If you DON'T see this** → ⚠️ Audio element issue

---

## 🎯 Quick Diagnosis

### You see timeout but NO answer logs?

```
❌ Step 1: ✅ OFFER sent
❌ Step 2: ✅ call_accepted received
❌ Step 3: ❌ NO ANSWER (neither option A nor B)
❌ Step 4: ❌ NO remote stream
→ BACKEND ISSUE: Answer not being forwarded
```

### You see answer but NO remote stream?

```
❌ Step 1: ✅ OFFER sent
❌ Step 2: ✅ call_accepted received
❌ Step 3: ✅ ANSWER received
❌ Step 4: ❌ NO remote stream
→ POSSIBLE ISSUES:
   - Remote peer not sending audio
   - Network/firewall blocking media
   - ICE candidates not exchanging
```

### You see remote stream but NO audio playback?

```
❌ Step 1: ✅ OFFER sent
❌ Step 2: ✅ call_accepted received
❌ Step 3: ✅ ANSWER received
❌ Step 4: ✅ Remote stream received
❌ Step 5: ❌ NO audio playback
→ POSSIBLE ISSUES:
   - Browser autoplay policy
   - Audio element muted
   - Volume issue
```

---

## 🔧 Backend Issues Checklist

### BACKEND ISSUE #1: No ANSWER field in call_accepted

**What's happening:**

- Backend forwards call_accepted but doesn't include the answer
- Answer needs to be sent separately via socket.emit("answer")

**Check backend code for:**

```javascript
// Backend should do one of:

// Option 1: Include answer in call_accepted
socket.emit("call_accepted", {
  callId: xxx,
  answer: receiverAnswerSDP,  // ← This should be included
  recipientName: xxx,
  ...
});

// Option 2: Send answer as separate event
socket.emit("answer", {
  callId: xxx,
  answer: receiverAnswerSDP,
  toUserId: xxx,
});
```

---

### BACKEND ISSUE #2: Answer Not Being Forwarded at All

**What's happening:**

- Receiver sends answer via socket.emit("answer")
- Backend is NOT forwarding it to the initiator

**Check backend code for:**

```javascript
// Backend should listen for answer from receiver and forward to initiator
socket.on("answer", (data) => {
    // Find the other peer in the call
    const otherPeer = findOtherPeer(data.callId, socket.id);

    // Forward answer to initiator
    otherPeer.emit("answer", {
        callId: data.callId,
        answer: data.answer,
        recipientId: socket.userId,
    });
});
```

---

## 📊 Complete Flow Verification

### When Call is Initiated:

```
Frontend (Initiator)                Backend                Frontend (Receiver)
     |                               |                           |
     |-- initiateCall API ---------->|                           |
     |                               |                           |
     |                      Create CallRecord                    |
     |                      with callId                          |
     |                               |                           |
     |                      notify_incoming_call                 |
     |                               |---------->| emit("incoming_call")
     |                               |                           |
     |<-- API response (callId) -----|                           |
     |                               |          [User accepts]   |
     | Create peer & OFFER           |   acceptCall API         |
     |                               |<---------|               |
     |                               |          Get media        |
     |-- socket.emit("offer") ----->|                           |
     |                               |-- forward to initiator-->| Create peer
     |<-- offer received ------------|                           |
     |                               |          Create ANSWER <--|
     |                               |<-- socket.emit("answer")|
     |                               |                           |
     |<-- ANSWER (KEY!) -------------|  <-- BACKEND MUST DO THIS
     | signal(answer) to peer        |
     | → Establishes RTC connection  |
     | → peer.on('stream') fires ✅  |
```

---

## 🚨 What to Report If Issue Persists

When creating a bug report, include these logs:

1. **call_accepted event data:**
    - All keys/fields
    - Whether `answer` field exists

2. **Check if you see:**
    - `📞 [socket.on.answer] RECEIVED ANSWER` ← Yes/No?
    - `ANSWER included in call_accepted event` ← Yes/No?

3. **Check if you see:**
    - `📥 [peer.on.stream] Received remote media stream` ← Yes/No?

4. **Check if you see:**
    - `🎧 [CallWindow] Setting up remote audio` ← Yes/No?
    - `✅ Audio playback started successfully` ← Yes/No?

---

## 💡 Summary

| Issue                   | Symptom                             | Location                   |
| ----------------------- | ----------------------------------- | -------------------------- |
| **No ANSWER received**  | Timeout after 5s, no answer logs    | Backend issue              |
| **Answer not signaled** | Answer log exists but no stream     | Frontend (fixed)           |
| **No remote stream**    | Answer signaled but no stream event | WebRTC issue or network    |
| **No audio playback**   | Stream received but no audio sound  | Frontend - autoplay policy |

---

## Next Steps

1. **Run a test call**
2. **Open Developer Tools (F12) → Console**
3. **Check which step fails** using the checklist above
4. **Report which step is failing**
5. **I'll provide the exact fix**
