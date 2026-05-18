import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { AuthContext } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import { DEFAULT_ASSISTANT_NAME, DEFAULT_ASSISTANT_IMAGE } from '../../constants/presets';

const { width } = Dimensions.get('window');

export default function ChatScreen({ navigation }) {
  const { userData, userToken, logout } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showTextChat, setShowTextChat] = useState(false);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);

  const assistantName = userData?.profile?.assistant_name || DEFAULT_ASSISTANT_NAME;
  const assistantImage = userData?.profile?.assistant_image || DEFAULT_ASSISTANT_IMAGE;

  const flatListRef = useRef();

  useEffect(() => {
    loadChatHistory();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      handleVoiceMessage(uri);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const handleVoiceMessage = async (uri) => {
    setIsLoading(true);
    try {
      const response = await chatService.sendVoiceMessage(uri, userToken);

      // Hiển thị văn bản người dùng đã nói (STT) từ server trả về
      const userText = response.user_text || response.text || '(Không rõ nội dung)';

      const userMessage = {
        id: Date.now().toString(),
        text: userText,
        sender: 'user'
      };
      setMessages(prev => [...prev, userMessage]);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        text: response.reply || 'Xin lỗi, tôi không nhận được phản hồi.',
        sender: 'assistant'
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (response.reply) {
        playAssistantResponse(response.reply);
      }
    } catch (error) {
      console.error('Voice message error:', error);
      const errorMessage = {
        id: Date.now().toString(),
        text: 'Lỗi xử lý giọng nói: ' + (error.message || 'Không thể kết nối'),
        sender: 'assistant',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAssistantResponse = async (text) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Chuyển sang dùng GET và truyền text qua query params để tương thích tốt nhất với expo-av
      const encodedText = encodeURIComponent(text);
      const url = `${chatService.getSpeechUrl()}?text=${encodedText}`;

      const { sound: newSound } = await Audio.Sound.createAsync(
        {
          uri: url,
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const data = await chatService.getHistory(userToken);
      if (data && data.history) {
        const historyMessages = data.history.map(msg => ({
          id: msg.id || msg.conversationId || Math.random().toString(),
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'assistant',
          createdAt: msg.createdAt
        })).reverse();

        if (historyMessages.length > 0) {
          setMessages(historyMessages);
        } else {
          setMessages([
            { id: '1', text: `Xin chào! Tôi là ${assistantName}. Tôi có thể giúp gì cho bạn?`, sender: 'assistant' }
          ]);
        }
      }
    } catch (error) {
      console.error('Lỗi tải lịch sử:', error);
      setMessages([{ id: '1', text: `Xin chào! Tôi là ${assistantName}. Tôi có thể giúp gì cho bạn?`, sender: 'assistant' }]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    const messageToSend = text || inputText;
    if (!messageToSend.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: messageToSend.trim(),
      sender: 'user'
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(messageToSend, userToken);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        text: response.reply || response.message || 'Xin lỗi, tôi không nhận được phản hồi.',
        sender: 'assistant'
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      // Thêm vào cuối block try của handleSendMessage
      if (response.reply || response.message) {playAssistantResponse(response.reply || response.message);
      }
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lỗi: ' + (error.message || 'Không thể kết nối tới máy chủ'),
        sender: 'assistant',
        isError: true
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userBubble : styles.assistantBubble,
      item.isError && styles.errorBubble
    ]}>
      <Text style={[
        styles.messageText,
        item.sender === 'user' ? styles.userMessageText : styles.assistantMessageText
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
          <Ionicons name="chevron-back" size={28} color="#3b82f6" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={typeof assistantImage === 'number' ? assistantImage : { uri: assistantImage }}
            style={styles.headerAssistantImage}
          />
          <Text style={styles.title} numberOfLines={1}>{assistantName}</Text>
        </View>

        <TouchableOpacity onPress={logout} style={styles.headerRight}>
          <Text style={styles.logoutButton}>Thoát</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.voiceMainArea}>
        <View style={styles.waveContainer}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Image
                source={isRecording ? require('../../../assets/ai.gif') : require('../../../assets/ai-static.png')}
                style={styles.waveImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.assistantStatusText}>
            {isLoading ? 'Đang trả lời...' : (isRecording ? 'Đang lắng nghe...' : assistantName)}
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <View style={{ width: 60 }} />

          <TouchableOpacity
            style={styles.micButtonContainer}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={isRecording ? ['#ef4444', '#dc2626'] : ['#3b82f6', '#2563eb']}
              style={styles.micButton}
            >
              <Ionicons name={isRecording ? "stop" : "mic"} size={32} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatToggleButton}
            onPress={() => setShowTextChat(true)}
          >
            <Ionicons name="chatbubble-ellipses" size={28} color="#94a3b8" />
            {messages.length > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{messages.length}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showTextChat}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTextChat(false)}>
              <Ionicons name="chevron-down" size={30} color="#3b82f6" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Hội thoại</Text>
            <View style={{ width: 30 }} />
          </View>

          {isInitialLoading ? (
            <View style={styles.loadingArea}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.chatArea}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingText}>Đang trả lời...</Text>
            </View>
          ) : null}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#64748b"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAssistantImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#1e293b',
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  voiceMainArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  waveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  outerCircle: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  innerCircle: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    backgroundColor: '#000',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveImage: {
    width: '100%',
    height: '60%',
  },
  liveBadge: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b5cf6',
    marginRight: 6,
  },
  liveText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: 'bold',
  },
  assistantStatusText: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '500',
    marginTop: 40,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  micButtonContainer: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatToggleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#3b82f6',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatArea: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: '#450a0a',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  assistantMessageText: {
    color: '#f8fafc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 14,
    marginLeft: 8,
  },
  loadingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 8,
    color: '#f8fafc',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#3b82f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
  },
});
