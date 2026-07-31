// HTTP-based transport for a future Avalonia + ASP.NET Core backend: commands are plain fetch()
// POST requests, backend-initiated pushes (notifications/actions) arrive over a Server-Sent
// Events stream. Endpoint paths are placeholders - adjust once the .NET API is defined.
(function () {
  const COMMAND_ENDPOINT = '/api/backend';
  const EVENTS_ENDPOINT = '/api/backend/events';

  let deliverMessage = null;
  let deliverInvalidMessage = null;
  let eventSource = null;

  function deliverRaw(raw) {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      if (typeof deliverInvalidMessage === 'function') {
        deliverInvalidMessage(raw);
      }
      return;
    }

    console.log('message', parsed);
    if (typeof deliverMessage === 'function') {
      deliverMessage(parsed);
    }
  }

  function sendMessage(requestId, action, payload) {
    const message = { requestId, action, payload: payload || {} };
    console.log('POST', message);

    fetch(COMMAND_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })
      .then((response) => {
        if (!response.ok) {
          deliverRaw(JSON.stringify({ requestId, ok: false, error: `Backend returned ${response.status}` }));
          return;
        }

        // The command endpoint only acks (empty body); the real reply always arrives over SSE.
        return response.text().then((raw) => {
          if (raw && raw.trim().length > 0) {
            deliverRaw(raw);
          }
        });
      })
      .catch((err) => {
        deliverRaw(JSON.stringify({ requestId, ok: false, error: err.message || 'Network error' }));
      });
  }

  // SSE connects lazily on the first bindMessageHandler call and reconnects itself on drop.
  function ensureEventStream() {
    if (eventSource) {
      return;
    }

    eventSource = new EventSource(EVENTS_ENDPOINT);
    eventSource.onmessage = (event) => deliverRaw(event.data);
  }

  function bindMessageHandler(onMessage, onInvalidMessage) {
    deliverMessage = onMessage;
    deliverInvalidMessage = onInvalidMessage;
    ensureEventStream();
  }

  window.BackendTransport = {
    sendMessage,
    bindMessageHandler
  };
})();
