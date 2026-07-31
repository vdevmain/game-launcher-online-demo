// Generic backend push-message routing, decoupled from the transport (Photino today, maybe
// direct .NET APIs later). Handlers only ever see { action, data } - never window.external.
(function () {
  const handlers = new Map();

  function register(action, handle) {
    handlers.set(action, { action, handle });
  }

  function dispatch(message) {
    const action = message && typeof message.action === 'string' ? message.action : null;
    const handler = action ? handlers.get(action) : null;
    if (!handler) {
      return false;
    }

    handler.handle(message.data);
    return true;
  }

  window.MessageActions = { register, dispatch };
})();
