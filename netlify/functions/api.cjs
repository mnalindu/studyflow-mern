// Netlify's Lambda-compatible function entrypoint.
// Keep this file at repository-root/netlify/functions/api.cjs
const { handler } = require("../../backend/netlifyHandler");
exports.handler = handler;
