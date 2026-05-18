<<<<<<< HEAD

# Voice Assistant Mobile App

Ứng dụng di động cho Voice Assistant được xây dựng với React Native và Expo, hỗ trợ voice chat và real-time communication.

## Tính năng

- **Voice Chat** - Ghi âm và trò chuyện bằng giọng nói
- **Text Chat** - Trò chuyện bằng văn bản
- **Real-time Communication** - Socket.IO cho live updates
- **Cross-platform** - Hỗ trợ iOS, Android, và Web
- **Audio Processing** - Xử lý audio với Expo Audio & AV
- **Navigation** - React Navigation cho multi-screen
- **Offline Storage** - AsyncStorage cho conversations
- **User Authentication** - Đăng nhập/đăng ký
- **Voice Recording** - Ghi âm chất lượng cao

## Công nghệ Sử dụng

- **Framework**: React Native 0.81
- **Platform**: Expo SDK 54
- **Navigation**: React Navigation v7
- **Audio**: Expo Audio & Expo AV
- **Storage**: AsyncStorage
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios
- **Icons**: Expo Vector Icons
- **Styling**: Expo StyleSheet & Flexbox
- **TypeScript**: Type safety

## Cài đặt

### Yêu cầu hệ thống

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (cho Android development)
- Xcode (cho iOS development) - macOS only

### 1. Clone và cài đặt

```bash
# Clone repository
git clone <repository-url>
cd voice-assistant/mobile

# Install dependencies
npm install

# Start development server
npx expo start
```

### 2. Environment Variables

Tạo file `.env` trong thư mục mobile:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_AI_SERVICE_URL=http://localhost:5000
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000

# App Configuration
EXPO_PUBLIC_APP_NAME=Voice Assistant
EXPO_PUBLIC_APP_VERSION=1.0.0
```

## Chạy ứng dụng

### Development Mode

```bash
# Start development server
npx expo start
```

Sau khi start, bạn sẽ thấy các options:

- **Scan QR Code** - Dùng Expo Go app trên điện thoại
- **Android Emulator** - `npx expo start --android`
- **iOS Simulator** - `npx expo start --ios`
- **Web Browser** - `npx expo start --web`

### Production Build

```bash
# Build cho Android
npx expo build:android

# Build cho iOS
npx expo build:ios

# Build cho Web
npx expo build:web
```

## Platform-specific Setup

### Android Development

```bash
# Yêu cầu
- Android Studio
- Android SDK (API Level 34+)
- Java Development Kit

# Chạy với emulator
npx expo start --android
```

### iOS Development

```bash
# Yêu cầu (macOS only)
- Xcode 14+
- iOS Simulator
- Apple Developer Account (cho device testing)

# Chạy với simulator
npx expo start --ios
```

### Web Development

```bash
# Chạy trên browser
npx expo start --web

# Hoặc build static
npx expo build:web
```

## Cấu trúc dự án

```bash
mobile/
├── app/                  # App structure với file-based routing
│   ├── (tabs)/         # Tab navigation
│   ├── chat/            # Chat screens
│   ├── auth/            # Authentication screens
│   └── _layout.tsx       # Root layout
├── src/                  # Source code
│   ├── components/      # Reusable components
│   ├── context/         # React context providers
│   ├── navigation/      # Navigation configuration
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript types
├── assets/               # Static assets
│   ├── fonts/           # Custom fonts
│   └── icons/           # App icons
├── constants/            # App constants
└── scripts/              # Build scripts
```

## Development

### Scripts hữu ích

```bash
npm start          # Start Expo development server
npm run android    # Start với Android emulator
npm run ios         # Start với iOS simulator
npm run web         # Start trong web browser
npm run lint        # Run ESLint
npm run reset-project # Reset to blank template
```

### Environment Variables cho Development

```env
# Local development
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_AI_SERVICE_URL=http://localhost:5000
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000

# Production
EXPO_PUBLIC_API_URL=https://your-api-domain.com
EXPO_PUBLIC_AI_SERVICE_URL=https://your-ai-domain.com
EXPO_PUBLIC_SOCKET_URL=https://your-socket-domain.com
```

## API Integration

### Backend Connection

```typescript
// services/api.ts
import axios from "axios";
import Constants from "expo-constants";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
```

### Socket.IO Connection

```typescript
// services/socket.ts
import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";

const SOCKET_URL =
  Constants.expoConfig?.extra?.socketUrl || process.env.EXPO_PUBLIC_SOCKET_URL;

export const connectSocket = (): Socket => {
  return io(SOCKET_URL, {
    transports: ["websocket"],
  });
};
```

## Audio Processing

### Voice Recording

```typescript
// services/audio.ts
import * as FileSystem from "expo-file-system";
import * as Audio from "expo-av";

export const startRecording = async () => {
  try {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );

    await recording.startAsync();
    return recording;
  } catch (error) {
    console.error("Failed to start recording:", error);
  }
};
```

### Audio Playback

```typescript
// services/audio.ts
import { Audio } from "expo-av";

export const playAudio = async (uri: string) => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
    );

    await sound.setPositionAsync(0);
    return sound;
  } catch (error) {
    console.error("Failed to play audio:", error);
  }
};
```

## Authentication

### JWT Token Management

```typescript
// services/auth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";

export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Failed to store token:", error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get token:", error);
    return null;
  }
};
```

## Navigation Structure

### Tab Navigation

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <MessageSquareIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <HistoryIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <UserIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

## Deployment

### Expo Development Build

```bash
# Build và deploy cho development
npx eas build --profile development

# Preview trên device
npx eas preview
```

### Production Build

```bash
# Cấu hình EAS (Expo Application Services)
npx eas build:configure

# Build production
npx eas build --profile production

# Submit to stores
npx eas submit
```

### Environment Variables cho Production

```bash
# eas.json configuration
eas build --profile production \
  --env EXPO_PUBLIC_API_URL=https://api.yourdomain.com \
  --env EXPO_PUBLIC_AI_SERVICE_URL=https://ai.yourdomain.com \
  --env EXPO_PUBLIC_SOCKET_URL=https://socket.yourdomain.com
```

## Security Best Practices

### API Security

- Sử dụng HTTPS cho production
- Validate và sanitize inputs
- Implement rate limiting
- Secure JWT token storage

### Mobile Security

```typescript
// Security utilities
export const validateInput = (input: string): boolean => {
  // Basic validation
  return input.length > 0 && input.length < 1000;
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially harmful content
  return input.replace(/<script[^>]*>.*?<\/script>/gi, "");
};
```

## Debugging

### Common Issues

1. **Metro bundler issues**:

   ```bash
   # Clear cache
   npx expo start -c

   # Reset project
   npm run reset-project
   ```

2. **Audio permission issues**:

   ```typescript
   // Request permissions properly
   const { status } = await Audio.requestPermissionsAsync();
   if (status !== "granted") {
     Alert.alert(
       "Permission required",
       "Microphone access needed for voice chat",
     );
   }
   ```

3. **Network issues**:

   ```bash
   # Check API connectivity
   curl http://localhost:3000/health

   # Test Socket.IO connection
   npx expo start --tunnel
   ```

### Debug Tools

```bash
# React Native Debugger
npx react-native log-android
npx react-native log-ios

# Expo debugging
npx expo start --dev-client

# Performance monitoring
npx expo start --minify
```

## Performance Optimization

### Bundle Size Optimization

```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "NODE_ENV": "production"
      },
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

### Memory Management

```typescript
// Optimize audio processing
export const optimizeAudioBuffer = (buffer: ArrayBuffer): ArrayBuffer => {
  // Downsample if needed
  const sampleRate = 44100;
  const channels = 1;

  // Implementation for audio optimization
  return buffer;
};

// Cleanup resources
useEffect(() => {
  return () => {
    // Cleanup audio resources
    if (recording) {
      recording.stopAsync();
    }
  };
}, []);
```

## Testing

### Unit Testing

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test
```

### E2E Testing

```bash
# Install Detox cho E2E
npm install --save-dev detox

# Run E2E tests
npm run e2e
```

## Integration với Backend

### API Endpoints Usage

```typescript
// services/chatService.ts
export interface ChatMessage {
  id: string;
  text: string;
  audioUrl?: string;
  timestamp: Date;
  userId: string;
}

export const sendMessage = async (message: string, audioFile?: File) => {
  const formData = new FormData();
  formData.append("message", message);

  if (audioFile) {
    formData.append("audio", audioFile);
  }

  const response = await api.post("/api/assistant/chat", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
```

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/mobile-improvement`
3. Make changes
4. Test trên multiple platforms
5. Commit changes: `git commit -m 'Add mobile feature'`
6. Push branch: `git push origin feature/mobile-improvement`
7. Create Pull Request

## License

This project is licensed under the MIT License.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://expo.dev/router)
- [React Navigation](https://reactnavigation.org/)
- [Expo Audio Documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
- [Expo AV Documentation](https://docs.expo.dev/versions/latest/sdk/av/)
