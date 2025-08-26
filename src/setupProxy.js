const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/projects', '/collaborators', '/profile', '/health', '/cleanup', '/upload', '/uploads'],
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};