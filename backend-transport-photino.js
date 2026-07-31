// Photino-specific transport: talks to the .NET host via window.external's message channel.
// backend-api.js only ever calls window.BackendTransport.sendMessage/bindMessageHandler, so
// swapping to another host (e.g. plain HTTP calls against an Avalonia/.NET Web API backend)
// only requires providing a different implementation of this interface - see the comment
// on window.BackendTransport below for the contract to keep.
(function () {
  function sendMessage(requestId, action, payload) {
    const message = { requestId, action, payload: payload || {} };
    console.log('sendMessage', message);
    window.external.sendMessage(JSON.stringify(message));
  }

  // onMessage(parsedObject) is invoked for every message coming from the backend (both
  // responses to sendMessage calls and unsolicited pushes). onInvalidMessage(rawString) is
  // invoked when a message could not be parsed.
  function bindMessageHandler(onMessage, onInvalidMessage) {
    window.external.receiveMessage((raw) => {
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        if (typeof onInvalidMessage === 'function') {
          onInvalidMessage(raw);
        }
        return;
      }

      console.log('receiveMessage', parsed);
      onMessage(parsed);
    });
  }

  window.BackendTransport = {
    sendMessage,
    bindMessageHandler
  };
})();
