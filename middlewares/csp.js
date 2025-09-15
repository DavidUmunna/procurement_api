// csp.js
const helmet = require('helmet');

const cspMiddleware = helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    fontSrc: ["'self'", "https:", "data:"],
    formAction: ["'self'"],
    frameAncestors: ["'self'"],
    imgSrc: ["'self'", "data:"],
    objectSrc: ["'none'"],
    scriptSrc: ["'self'"],
    "script-src-attr": ["'none'"],
    styleSrc: ["'self'", "https:"],
    upgradeInsecureRequests: [],
    reportUri:'/csp-report'
  },
});

module.exports = cspMiddleware;
