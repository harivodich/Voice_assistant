# 🎙️ Voice Assistant - Hệ thống Trợ lý Ảo AI (Kiến trúc Senior)

Một nền tảng **trợ lý ảo giọng nói cấp production** được xây dựng theo kiến trúc microservices, hỗ trợ AI đa mô hình, giao tiếp real-time và DevOps đầy đủ (Docker + CI/CD + Monitoring).

---

## 🧭 Tóm tắt dự án (Executive Summary)

Voice Assistant là hệ thống AI phân tán cho phép người dùng tương tác bằng **giọng nói và văn bản**, với khả năng xử lý ngữ cảnh và phản hồi thông minh theo thời gian thực.

### Năng lực cốt lõi

- 🎤 Chuyển giọng nói thành văn bản (Whisper)
- 🔊 Chuyển văn bản thành giọng nói (TTS - gTTS)
- 🧠 Nhận diện ý định người dùng (Machine Learning)
- 🤖 Điều phối LLM (Gemma-3-4B / Ollama / Groq)
- ⚡ Giao tiếp real-time (Socket.IO)
- 📌 Lập lịch tác vụ (BullMQ + Redis)
- 📊 Quan sát hệ thống (Prometheus + Grafana)

---

## 🏗️ Kiến trúc hệ thống mức cao

```text
                    ┌────────────────────────┐
                    │     Tầng Client       │
                    │ Web / Mobile / Voice  │
                    └──────────┬─────────────┘
                               │
                ┌──────────────▼──────────────┐
                │     API Gateway (Nginx)     │
                └──────────────┬──────────────┘
                               │
     ┌─────────────────────────┼─────────────────────────┐
     │                         │                         │
┌────▼──────┐        ┌────────▼────────┐      ┌─────────▼────────┐
│ Frontend  │        │ Backend API     │      │ AI Services       │
│ React     │        │ Node.js/Express │      │ Flask (Whisper)   │
└───────────┘        └────────┬────────┘      └─────────┬────────┘
                               │                        │
              ┌────────────────┼───────────────┐       │
              │                │               │       │
       ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐ │
       │ PostgreSQL  │ │ Redis Queue │ │ LLM Layer   │ │
       │ (CSDL chính) │ │ BullMQ      │ │ Gemma/Ollama│ │
       └─────────────┘ └─────────────┘ └─────────────┘ │
                                                        │
                                              ┌─────────▼─────────┐
                                              │ STT / TTS / ML    │
                                              └────────────────────┘
```

---

## 🔄 Luồng xử lý dữ liệu (Voice Pipeline)

```text
Người dùng (Giọng nói)
        ↓
Frontend (Ghi âm audio)
        ↓
Backend API
        ↓
AI Service (Whisper - STT)
        ↓
Phân loại ý định (Intent ML)
        ↓
LLM (Gemma-3-4B)
        ↓
Sinh phản hồi
        ↓
TTS (Chuyển thành giọng nói)
        ↓
Phát lại cho người dùng
```

---

## ⚙️ Phân rã Microservices

### 1. Backend (Node.js + Express)

Chịu trách nhiệm:

- Xác thực người dùng (JWT)
- Điều phối hội thoại
- API gateway logic
- Socket.IO realtime
- Queue xử lý nền (BullMQ)

### 2. AI Services (Python Flask)

Chịu trách nhiệm:

- STT (Whisper inference)
- TTS (gTTS)
- Phân loại ý định
- Tìm kiếm FAQ semantic

### 3. Frontend (React)

Chịu trách nhiệm:

- Giao diện chat
- Ghi âm giọng nói
- Kết nối realtime
- Xác thực người dùng

### 4. Mobile App (React Native)

- Đa nền tảng (iOS/Android/Web)
- Voice chat
- Offline cache
- Socket.IO realtime

---

## 🧠 Thiết kế tầng AI

### Chiến lược điều phối LLM

```text
Câu hỏi người dùng
      ↓
Nhận diện ý định
      ↓
Routing logic
   ├── FAQ → Embedding Search
   ├── Task → Tool execution
   └── General → LLM (Gemma-3-4B)
```

### Quyết định kiến trúc quan trọng

- Không gọi LLM cho mọi request
- Routing để giảm chi phí và độ trễ
- Cache Redis cho truy vấn phổ biến

---

## 🧰 Công nghệ sử dụng

### Backend

- Node.js (Express)
- PostgreSQL + Sequelize
- Redis + BullMQ
- Socket.IO
- JWT + bcrypt

### AI Services

- Flask
- Faster-Whisper
- Sentence Transformers
- scikit-learn

### Frontend

- React 19 + Vite
- TailwindCSS
- Axios
- Socket.IO Client

### DevOps

- Docker / Docker Compose
- Nginx Reverse Proxy
- GitHub Actions CI/CD
- Prometheus + Grafana

---

## 🚀 Kiến trúc triển khai

```text
GitHub Push
   ↓
GitHub Actions CI
   ↓
Build Docker Images
   ↓
Deploy VPS
   ↓
Docker Compose Up
   ↓
Nginx Reverse Proxy
```

---

## 🔁 CI/CD Pipeline (Production)

```yaml
name: Auto Deploy Voice Assistant (Safe Production)

on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}

          script: |
            set -e

            cd services/voice-assistant/

            echo "================================="
            echo "💾 BACKUP DATABASE"
            echo "================================="

            BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"

            docker exec voice-assistant-postgres \
              pg_dump -U $DB_USER $DB_NAME > ./backups/$BACKUP_FILE

            echo "Backup saved: $BACKUP_FILE"

            echo "================================="
            echo "📥 UPDATE SOURCE CODE"
            echo "================================="

            git fetch origin master
            git reset --hard origin/master

            echo "================================="
            echo "🐳 DEPLOY NEW VERSION (ZERO DOWNTIME)"
            echo "================================="

            docker compose -f docker-compose.production.yml up -d --build

            echo "================================="
            echo "❤️ HEALTH CHECK GATEWAY"
            echo "================================="

            for i in {1..10}
            do
              if curl -f http://localhost/health; then
                echo "✅ Health check passed"
                exit 0
              fi

              echo "⏳ Waiting... attempt $i"
              sleep 5
            done

            echo "❌ HEALTH CHECK FAILED - ROLLBACK"

            echo "================================="
            echo "🔁 ROLLBACK"
            echo "================================="

            git reset --hard HEAD~1
            docker compose -f docker-compose.production.yml up -d --build

            exit 1
```

---

## 📊 Quan sát hệ thống (Observability)

### Metrics chính

- Độ trễ API (p50 / p95 / p99)
- Tỷ lệ lỗi (4xx / 5xx)
- Kết nối WebSocket
- Độ dài queue Redis
- CPU / RAM / Disk
- Thời gian xử lý STT/TTS

### Dashboard Grafana

- Sức khỏe hệ thống
- Hiệu năng API
- Latency AI inference
- Queue processing

### Loki Log Aggregation

Hệ thống sử dụng **Loki** để thu thập và quản lý logs từ tất cả các services:

#### Kiến trúc Logging

```text
Services (Backend/AI Services)
        ↓
    Loki Clients (pino-loki / loki-logger-handler)
        ↓
    Loki Server (port 3100)
        ↓
    Grafana Dashboard
```

#### Cấu hình

**Backend (Node.js):**
- Logger sử dụng `pino` + `pino-loki`
- Cấu hình trong `backend/src/utils/logger.js`
- Environment variables:
  - `LOKI_URL`: URL của Loki server (default: `http://loki:3100`)
  - `LOG_LEVEL`: Level logging (default: `info`)
  - `NODE_ENV`: Environment (default: `development`)

**AI Services (Python):**
- Logger sử dụng `logging` + `loki-logger-handler`
- Cấu hình trong `ai-services/utils/logger.py`
- Environment variables:
  - `LOKI_URL`: URL của Loki server (default: `http://loki:3100`)
  - `LOG_LEVEL`: Level logging (default: `INFO`)
  - `FLASK_ENV`: Environment (default: `development`)

#### Sử dụng

**Trong Backend:**
```javascript
import { logger, createChildLogger } from './utils/logger.js';

// Sử dụng logger chính
logger.info('Server started');
logger.error('Error occurred', { error: err });

// Tạo child logger với context
const childLogger = createChildLogger({ module: 'auth' });
childLogger.info('User logged in', { userId });
```

**Trong AI Services:**
```python
from utils.logger import get_logger

logger = get_logger()
logger.info('Processing audio file')
logger.error('STT failed', {'error': str(e)})
```

#### Truy cập Logs

1. **Grafana Dashboard:**
   - Truy cập: `http://localhost:3001`
   - Login với credentials mặc định: `admin/admin`
   - Chọn "Explore" → Chọn datasource "Loki"
   - Query logs bằng label filters:
     - `{service="voice-assistant-backend"}`
     - `{service="voice-assistant-ai-services"}`

2. **Loki API:**
   - Direct API: `http://localhost:3100`
   - Query logs qua API endpoint `/loki/api/v1/query`

#### Log Retention

- Logs được lưu giữ trong 7 ngày (168h) mặc định
- Có thể cấu hình trong `monitoring/loki/loki-config.yml`

---

## 🗄️ Thiết kế cơ sở dữ liệu

### Bảng chính

```text
Users
├── id
├── email
├── password_hash

Conversations
├── id
├── user_id
├── messages

Reminders
├── id
├── user_id
├── schedule_time
├── status
```

### Chiến lược scale

- Index theo user_id
- Cache Redis session nóng
- Partition hội thoại dài hạn

---

## 🔐 Kiến trúc bảo mật

- JWT access + refresh token
- Mã hóa mật khẩu bcrypt
- Helmet security headers
- CORS whitelist
- Input validation
- Rate limiting (đang phát triển)

---

## ⚡ Tối ưu hiệu năng

- Cache Redis
- Xử lý async bằng queue
- Lazy loading AI model
- WebSocket thay polling
- Reverse proxy Nginx

---

## 🧯 Chiến lược xử lý lỗi

| Thành phần | Chiến lược                  |
| ---------- | --------------------------- |
| AI Service | Retry + fallback            |
| LLM        | Timeout + fallback response |
| Redis      | Persistent queue            |
| DB         | Connection pool             |
| API        | Circuit breaker (planned)   |

---

## 📡 API mẫu

### Chat API

```http
POST /api/assistant/chat
Authorization: Bearer <token>
```

```json
{
  "message": "Thời tiết hôm nay thế nào?"
}
```

### Response

```json
{
  "reply": "Hôm nay thời tiết...",
  "intent": "weather"
}
```

---

## 🧪 Chiến lược kiểm thử

- Unit test (service layer)
- Integration test (API + DB)
- Load test (k6 - planned)
- Test AI inference

---

## 📈 Thiết kế mở rộng

### Scale ngang

- Backend stateless
- Load balancing Nginx
- Redis shared state

### Giảm nghẽn

- Queue cho LLM inference
- Cache STT/TTS
- Read replica DB (future)

---

## 🧭 Roadmap

- [x] Microservices architecture
- [x] Docker deployment
- [x] CI/CD pipeline
- [x] Monitoring stack
- [ ] Kubernetes migration
- [ ] Rate limiting
- [ ] Multi-language support
- [ ] Streaming LLM responses

---

## 📄 License

MIT License

---

## 👨‍💻 Tác giả

Hệ thống Voice Assistant AI – Dự án Full-stack AI phân tán với microservices, hỗ trợ giọng nói, LLM và DevOps đầy đủ.
