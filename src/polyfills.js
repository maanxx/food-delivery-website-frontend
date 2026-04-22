// Polyfills for Node.js modules in browser
// This file MUST be loaded BEFORE any other modules
// Import EventEmitter to ensure it's available globally for simple-peer
/* global globalThis */

const { EventEmitter } = require("events");

// Inject EventEmitter globally - CRITICAL for simple-peer
if (typeof window !== "undefined") {
    window.EventEmitter = EventEmitter;
}

if (typeof global !== "undefined") {
    global.EventEmitter = EventEmitter;
}

// Also expose it on globalThis for better compatibility
if (typeof globalThis !== "undefined") {
    globalThis.EventEmitter = EventEmitter;
}

console.log(
    "✅ Polyfills loaded - EventEmitter:",
    typeof EventEmitter,
    typeof window?.EventEmitter,
    typeof global?.EventEmitter,
);
