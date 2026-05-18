import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

export default function ReminderBanner({ message, onDismiss, token, getSpeechUrl }) {
  const [sound, setSound] = useState(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const isMounted = useRef(true);
  const timeoutRef = useRef(null);
  const soundRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 20,
    }).start();

    startRepeatingVoice();

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      stopVoice();
    };
  }, []);

  const stopVoice = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const currentSound = soundRef.current || sound;
    if (currentSound) {
      try {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        soundRef.current = null;
        setSound(null);
      } catch (e) {
        console.log('Error stopping sound', e);
      }
    }
  };

  const startRepeatingVoice = async () => {
    if (!message || !isMounted.current) return;

    // Giải phóng âm thanh trước đó nếu đang chạy để tránh tràn bộ nhớ
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (e) {}
    }

    try {
      const encodedText = encodeURIComponent(`Thông báo: ${message}`);
      const url = `${getSpeechUrl()}?text=${encodedText}`;

      const { sound: newSound } = await Audio.Sound.createAsync(
        {
          uri: url,
          headers: { Authorization: `Bearer ${token}` }
        },
        { shouldPlay: true }
      );

      if (!isMounted.current) {
        await newSound.unloadAsync();
        return;
      }

      soundRef.current = newSound;
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish && isMounted.current) {
          // Xóa timeout cũ nếu có trước khi tạo mới
          if (timeoutRef.current) clearTimeout(timeoutRef.current);

          timeoutRef.current = setTimeout(() => {
            if (isMounted.current) startRepeatingVoice();
          }, 3000);
        }
      });
    } catch (error) {
      console.error('Reminder TTS error:', error);
    }
  };

  const handleDismiss = () => {
    // Dừng giọng nói NGAY LẬP TỨC khi bấm nút
    isMounted.current = false;
    stopVoice();

    Animated.timing(translateY, {
      toValue: -120,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={24} color="#f59e0b" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Nhắc nhở công việc</Text>
          <Text style={styles.message} numberOfLines={2}>{message}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
          <Text style={styles.closeButtonText}>TẮT</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 9999,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    color: '#f8fafc',
    fontSize: 15,
  },
  closeButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  closeButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
