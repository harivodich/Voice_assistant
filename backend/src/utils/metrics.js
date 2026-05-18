import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Enable default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics for the application

// HTTP request duration histogram
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5, 10],
  registers: [register]
});

// HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Active connections gauge
const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register]
});

// Socket.IO connections gauge
const socketConnections = new client.Gauge({
  name: 'socket_connections',
  help: 'Number of active Socket.IO connections',
  registers: [register]
});

// Voice processing duration histogram
const voiceProcessingDuration = new client.Histogram({
  name: 'voice_processing_duration_seconds',
  help: 'Duration of voice processing in seconds',
  labelNames: ['operation'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

// Database query duration histogram
const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register]
});

// Error counter
const errorCounter = new client.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity'],
  registers: [register]
});

// Middleware to track HTTP requests
const requestMetricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDurationMicroseconds.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });
  });
  
  next();
};

// Export metrics and utilities
export {
  register,
  httpRequestDurationMicroseconds,
  httpRequestsTotal,
  activeConnections,
  socketConnections,
  voiceProcessingDuration,
  dbQueryDuration,
  errorCounter,
  requestMetricsMiddleware
};
