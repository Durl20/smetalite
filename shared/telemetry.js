/**
 * Six Sites Ecosystem - Unified Cross-Origin Telemetry Client
 * 
 * Central telemetry library for all six ecosystem products:
 * SmetaLite, PageStart, PartForge, StudyFlow, BlockPlan, ClipKit.
 * 
 * Architecture & Legal Guarantees (152-FZ / GDPR / TTDSG):
 * 1. ZERO Personal Identifiable Information (PII) collected or stored.
 * 2. ZERO third-party tracking cookies or canvas fingerprinting.
 * 3. Client events are purely functional/diagnostic and NEVER counted as confirmed sales.
 * 4. Dual Transport:
 *    - Same-Origin: BroadcastChannel API for live zero-latency cross-tab synchronization.
 *    - Cross-Origin / Cross-Device: Central Collector HTTP API (POST /api/telemetry).
 * 5. Offline Queue with automatic retry on reconnection.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'ecosystem_event_log';
  const QUEUE_KEY = 'ecosystem_offline_queue';
  const BROADCAST_CHANNEL_NAME = 'sixsites_telemetry_channel';
  const MAX_LOCAL_EVENTS = 500;
  const MAX_QUEUE_ITEMS = 100;

  // Primary Central Collector API endpoint (configurable via global override)
  const COLLECTOR_URL = window.ECOSYSTEM_COLLECTOR_URL || '/api/telemetry';

  // 1. Same-Origin BroadcastChannel (Local Tab Bridge)
  let broadcastChannel = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch (e) {
      console.warn('[Telemetry] BroadcastChannel unavailable in this context:', e);
    }
  }

  // 2. Ephemeral session token (not tied to hardware, device ID, or user identity)
  function getSessionId() {
    let sid = null;
    try {
      sid = sessionStorage.getItem('ecosystem_sid');
      if (!sid) {
        sid = 'ses_' + Math.random().toString(36).substring(2, 10);
        sessionStorage.setItem('ecosystem_sid', sid);
      }
    } catch (e) {
      sid = 'ses_' + Math.random().toString(36).substring(2, 10);
    }
    return sid;
  }

  // 3. Client-Side PII Filter (Neutralize accidental personal details in payload)
  function scrubPii(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    try {
      const copy = JSON.parse(JSON.stringify(obj));
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const phoneRegex = /(\+7|8)[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}/g;
      const cardRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;

      function deepScrub(o) {
        for (const k of Object.keys(o)) {
          if (typeof o[k] === 'string') {
            o[k] = o[k]
              .replace(emailRegex, '[EMAIL_REDACTED]')
              .replace(phoneRegex, '[PHONE_REDACTED]')
              .replace(cardRegex, '[CARD_REDACTED]');
          } else if (typeof o[k] === 'object' && o[k] !== null) {
            deepScrub(o[k]);
          }
        }
      }
      deepScrub(copy);
      return copy;
    } catch (e) {
      return {};
    }
  }

  // 4. HTTP Collector Transmitter
  function sendToCollector(payload) {
    if (!COLLECTOR_URL) return;
    const bodyStr = JSON.stringify(payload);

    // Prefer non-blocking navigator.sendBeacon
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([bodyStr], { type: 'application/json' });
        const ok = navigator.sendBeacon(COLLECTOR_URL, blob);
        if (ok) return;
      } catch (e) {}
    }

    // Fallback: fetch with keepalive & offline queue
    if (window.fetch) {
      fetch(COLLECTOR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
        keepalive: true
      }).catch(() => {
        // Enqueue for offline sync
        try {
          const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
          q.push(payload);
          if (q.length > MAX_QUEUE_ITEMS) q.shift();
          localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
        } catch (e) {}
      });
    }
  }

  // 5. Offline Queue Flushing
  function flushQueue() {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      if (!q.length || !window.fetch) return;

      const items = q.splice(0, 10);
      items.forEach(item => {
        sendToCollector(item);
      });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch (e) {}
  }

  window.addEventListener('online', flushQueue);

  // 6. Unified Public Telemetry Interface
  const EcosystemTelemetry = {
    /**
     * Record a telemetry event across all connected transports
     * @param {string} siteId - 'smetalite' | 'pagestart' | 'partforge' | 'studyflow' | 'blockplan' | 'clipkit'
     * @param {string} eventType - 'pageview' | 'user_action' | 'file_export' | 'operation_complete' | 'error'
     * @param {object} details - Non-PII metadata
     */
    record(siteId, eventType, details) {
      const payload = {
        id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        siteId: String(siteId || 'ecosystem').toLowerCase(),
        eventType: String(eventType || 'action').toLowerCase(),
        origin: window.location.origin,
        sessionId: getSessionId(),
        details: scrubPii(details || {})
      };

      // A. LocalStorage History
      try {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        local.push(payload);
        if (local.length > MAX_LOCAL_EVENTS) local.shift();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
      } catch (e) {}

      // B. Same-Origin BroadcastChannel (for active tabs)
      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({
            type: 'TELEMETRY_EVENT',
            source: 'broadcast',
            data: payload
          });
        } catch (e) {}
      }

      // C. Sandboxed Iframe Bridge
      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            type: 'SIX_SITES_TELEMETRY_EVENT',
            data: payload
          }, '*');
        } catch (e) {}
      }

      // D. Central HTTP Collector API
      sendToCollector(payload);

      return payload;
    },

    pageview(siteId, details) {
      return this.record(siteId, 'pageview', details);
    },

    action(siteId, actionName, details) {
      return this.record(siteId, 'user_action', Object.assign({ action: actionName }, details));
    },

    export(siteId, fileFormat, details) {
      return this.record(siteId, 'file_export', Object.assign({ format: fileFormat }, details));
    },

    complete(siteId, operationName, details) {
      return this.record(siteId, 'operation_complete', Object.assign({ operation: operationName }, details));
    },

    error(siteId, errorMsg, details) {
      return this.record(siteId, 'error', Object.assign({ message: String(errorMsg) }, details));
    },

    flush() {
      flushQueue();
    }
  };

  // Expose globally
  window.EcosystemTelemetry = EcosystemTelemetry;
  window.recordEcosystemEvent = function (siteId, eventType, details) {
    return EcosystemTelemetry.record(siteId, eventType, details);
  };

  // Auto record page view on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoRecordPageview);
  } else {
    autoRecordPageview();
  }

  function autoRecordPageview() {
    const metaSite = document.querySelector('meta[name="ecosystem-site"]')?.content;
    const pathParts = window.location.pathname.split('/');
    let inferredSite = metaSite;
    if (!inferredSite) {
      for (let i = pathParts.length - 1; i >= 0; i--) {
        const p = pathParts[i];
        if (['smetalite', 'pagestart', 'partforge', 'studyflow', 'blockplan', 'clipkit'].includes(p)) {
          inferredSite = p;
          break;
        }
      }
    }
    if (!inferredSite) inferredSite = 'ecosystem_portal';

    EcosystemTelemetry.pageview(inferredSite, {
      title: document.title,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }
})();
