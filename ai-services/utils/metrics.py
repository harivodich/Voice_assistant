from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import time

# HTTP request counter
http_requests_total = Counter(
    'ai_http_requests_total',
    'Total number of HTTP requests to AI services',
    ['method', 'endpoint', 'status']
)

# HTTP request duration histogram
http_request_duration_seconds = Histogram(
    'ai_http_request_duration_seconds',
    'Duration of HTTP requests to AI services in seconds',
    ['method', 'endpoint'],
    buckets=[0.1, 0.5, 1, 2, 5, 10, 30]
)

# STT processing duration
stt_processing_duration = Histogram(
    'ai_stt_processing_duration_seconds',
    'Duration of STT processing in seconds',
    buckets=[0.5, 1, 2, 5, 10, 20, 30]
)

# TTS processing duration
tts_processing_duration = Histogram(
    'ai_tts_processing_duration_seconds',
    'Duration of TTS processing in seconds',
    buckets=[0.1, 0.5, 1, 2, 5, 10]
)

# Intent prediction duration
intent_processing_duration = Histogram(
    'ai_intent_processing_duration_seconds',
    'Duration of intent prediction in seconds',
    buckets=[0.01, 0.05, 0.1, 0.5, 1]
)

# FAQ retrieval duration
faq_processing_duration = Histogram(
    'ai_faq_processing_duration_seconds',
    'Duration of FAQ retrieval in seconds',
    buckets=[0.01, 0.05, 0.1, 0.5, 1]
)

# Active processing gauge
active_processing = Gauge(
    'ai_active_processing',
    'Number of active AI processing tasks'
)

# Error counter
error_counter = Counter(
    'ai_errors_total',
    'Total number of AI processing errors',
    ['type', 'severity']
)

# Audio file size gauge
audio_file_size_bytes = Histogram(
    'ai_audio_file_size_bytes',
    'Size of audio files processed',
    buckets=[1024, 10240, 102400, 1048576, 10485760, 52428800]
)


class MetricsMiddleware:
    def __init__(self, app):
        self.app = app
    
    def __call__(self, environ, start_response):
        start_time = time.time()
        
        def custom_start_response(status, headers, exc_info=None):
            # Record metrics
            method = environ.get('REQUEST_METHOD', 'UNKNOWN')
            path = environ.get('PATH_INFO', 'UNKNOWN')
            status_code = status.split()[0] if status else '500'
            
            duration = time.time() - start_time
            http_request_duration_seconds.labels(
                method=method,
                endpoint=path
            ).observe(duration)
            
            http_requests_total.labels(
                method=method,
                endpoint=path,
                status=status_code
            ).inc()
            
            return start_response(status, headers, exc_info)
        
        return self.app(environ, custom_start_response)


def init_metrics(app):
    """Initialize Prometheus metrics for Flask app"""
    app.wsgi_app = MetricsMiddleware(app.wsgi_app)
    
    @app.route('/metrics')
    def metrics():
        return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}
