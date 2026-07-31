// Picks the transport implementation before backend-api.js loads: Photino hosts expose
// window.external.sendMessage, everything else (e.g. a browser talking to an Avalonia/.NET
// Web API backend) falls back to the HTTP+SSE transport. Uses document.write so the chosen
// script loads synchronously, in order, just like a static <script> tag would.
(function () {
  const hasPhotino = typeof window.external !== 'undefined' && typeof window.external.sendMessage === 'function';
  const file = hasPhotino ? 'backend-transport-photino.js' : 'backend-transport-http.js';

  document.write('<script src="' + file + '"><\/script>');
})();
