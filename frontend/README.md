# Voice Assistant Frontend

Frontend application cho Voice Assistant được xây dựng với React, Vite, và TailwindCSS.

## Tính năng

- **Giao diện hiện đại** với TailwindCSS
- **Real-time communication** với Socket.IO
- **Voice chat** - Trò chuyện bằng giọng nói
- **Text chat** - Trò chuyện bằng văn bản
- **Reminder management** - Quản lý nhắc nhở
- **Responsive design** - Tương thích trên mọi thiết bị

## Công nghệ

- **React 19** - UI framework
- **Vite** - Build tool và development server
- **TailwindCSS** - CSS framework
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd voice-assistant/frontend

# Install dependencies
npm install
```

## Cấu hình môi trường

Tạo file `.env` trong thư mục gốc:

```env
VITE_PROXY_TARGET=http://localhost:3000
```

## Chạy ứng dụng

### Development mode

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5173`

### Build cho production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Docker Deployment

### Build và chạy với Docker

```bash
# Build image
docker build -t voice-assistant-frontend .

# Run container
docker run -p 5173:80 voice-assistant-frontend
```

### Sử dụng Docker Compose

```bash
# Start frontend với backend và database
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services included:**
- **Frontend** (React + Nginx)
- **Backend API** (từ image voice-assistant-backend)
- **PostgreSQL Database**
- **Redis Server**

## Cấu trúc dự án

```
src/
├── components/     # Reusable UI components
├── features/       # Feature-based components
├── context/        # React context providers
├── navigation/     # Routing configuration
├── assets/         # Static assets
├── socket/         # Socket.IO configuration
└── main.jsx        # Entry point
```

## Development

### Scripts

```bash
npm run dev      # Chạy development server
npm run build    # Build cho production
npm run lint     # Chạy ESLint
npm run preview  # Preview production build
```

### Docker Commands

```bash
npm run docker:build      # Build Docker image
npm run docker:run        # Run Docker container
npm run docker:compose:up # Start với docker-compose
npm run docker:compose:down # Stop docker-compose
```

## API Integration

Frontend kết nối đến backend API qua:

- **REST API** - `/api/*` endpoints
- **WebSocket** - Socket.IO cho real-time communication
- **Proxy configuration** - Vite proxy cho development

## Security

- Environment variables cho sensitive data
- CORS configuration
- Input validation
- Secure WebSocket connections

## Todo

- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Implement PWA
- [ ] Add offline support
- [ ] Performance optimization

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit your changes
4. Push to the branch
5. Create Pull Request

## License

This project is licensed under the MIT License.
