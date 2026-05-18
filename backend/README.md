# Voice Assistant Backend

Backend API cho ứng dụng trợ lý ảo giọng nói được xây dựng với Node.js, Express, và Socket.IO.

## 🚀 Tính năng

- **Xác thực người dùng** (JWT-based authentication)
- **Trò chuyện bằng giọng nói** (Voice chat với xử lý audio)
- **Trò chuyện văn bản** (Text-based chat)
- **Nhắc nhở thông minh** (Smart reminders với worker)
- **Lịch sử trò chuyện** (Conversation history)
- **Real-time communication** (Socket.IO cho real-time updates)
- **Tổng hợp giọng nói** (Text-to-speech)

## 🛠️ Công nghệ

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **Sequelize** - ORM cho PostgreSQL
- **PostgreSQL** - Database
- **Redis** - In-memory data store cho queue system
- **BullMQ** - Queue system cho background jobs
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Helmet** - Security headers
- **Morgan** - HTTP request logger
- **Axios** - HTTP client

## 📦 Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd voice-assistant/backend

# Install dependencies
npm install
```

## ⚙️ Cấu hình môi trường

Tạo file `.env` trong thư mục gốc và cấu hình các biến sau:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/voice_assistant

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-here

# CORS
CORS_ORIGIN=http://localhost:3000

# Other environment variables as needed
```

## 🗄️ Database Setup

```bash
# Tạo database PostgreSQL
createdb voice_assistant

# Cài đặt và chạy Redis (cho BullMQ)
# Ubuntu/Debian:
sudo apt-get install redis-server
sudo systemctl start redis

# macOS:
brew install redis
brew services start redis

# Khi chạy ở development mode, Sequelize sẽ tự động tạo bảng theo models
NODE_ENV=development npm run dev
```

## 🚀 Chạy ứng dụng

### Development mode

```bash
npm run dev
```

Server sẽ tự động restart khi có thay đổi code.

### Production mode

```bash
npm start
```

## 📡 API Endpoints

### Health Check

- `GET /health` - Kiểm tra trạng thái server

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Assistant

- `POST /api/assistant/voice-chat` - Trò chuyện bằng giọng nói (upload audio file)
- `POST /api/assistant/chat` - Trò chuyện bằng văn bản
- `POST /api/assistant/speak` - Tổng hợp giọng nói từ text

### Reminders

- `POST /api/reminders/:id/acknowledge` - Xác nhận đã nhận nhắc nhở

### History

- `GET /api/history` - Lấy lịch sử trò chuyện

## 🔐 Authentication

Tất cả các endpoint (trừ `/health` và authentication endpoints) đều yêu cầu JWT token trong header:

```
Authorization: Bearer <your-jwt-token>
```

## 🌐 Real-time Events

Sử dụng Socket.IO cho real-time communication:

- **Connection events** - Khi người dùng kết nối/ngắt kết nối
- **Reminder notifications** - Thông báo nhắc nhở real-time (qua BullMQ)
- **Assistant responses** - Phản hồi từ trợ lý ảo

## 📋 Queue System (BullMQ + Redis)

Hệ thống queue sử dụng BullMQ và Redis để xử lý background jobs:

- **Reminder Queue** - Xử lý và gửi thông báo nhắc nhở
- **Worker Process** - Chạy background jobs để gửi notifications qua Socket.IO
- **Redis Connection** - Cấu hình Redis tại `src/config/redis.js`

## 📁 Cấu trúc dự án

```
src/
├── controllers/     # Logic xử lý request
├── middleware/      # Custom middleware
├── models/         # Database models
├── repository/     # Database access layer
├── routes/         # API routes
├── services/       # Business logic
├── socket/         # Socket.IO handlers
├── utils/          # Utility functions
├── workers/        # Background jobs (BullMQ)
├── queues/         # Queue definitions (BullMQ)
├── config/         # Configuration files (Redis, etc.)
├── db/            # Database configuration
└── server.js      # Entry point
```

## 🔧 Development

### Scripts

```bash
npm run dev    # Chạy development mode với nodemon
npm start      # Chạy production mode
```

### Logging

- Sử dụng Morgan cho HTTP request logging
- Custom logging cho application events

## 🛡️ Security

- Helmet.js cho security headers
- CORS configuration
- JWT authentication
- Input validation
- Rate limiting (nếu cần)

## � API Documentation

Swagger documentation có sẵn tại:

- **Development**: `http://localhost:3000/api-docs`
- **Production**: `https://api.voice-assistant.com/api-docs`

Documentation bao gồm:

- Tất cả API endpoints với mô tả chi tiết
- Request/response schemas
- Authentication requirements
- Error responses
- Interactive testing interface

## �📝 Todo

- [x] Add API documentation (Swagger)
- [x] Implement Redis + BullMQ queue system
- [x] Docker containerization
- [ ] Implement rate limiting
- [ ] Add input validation middleware
- [ ] Setup automated testing
- [ ] Add monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit your changes
4. Push to the branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.
