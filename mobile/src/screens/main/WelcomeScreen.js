import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { DEFAULT_ASSISTANT_NAME, DEFAULT_ASSISTANT_IMAGE } from '../../constants/presets';

export default function WelcomeScreen({ navigation }) {
  const { userData, logout } = useContext(AuthContext);

  const assistantName = userData?.profile?.assistant_name || DEFAULT_ASSISTANT_NAME;
  const assistantImage = userData?.profile?.assistant_image || DEFAULT_ASSISTANT_IMAGE;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.navigate('Customize')}>
          <Text style={styles.customizeLink}>Tùy chỉnh Trợ lý</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.assistantPreview}>
          <Image
            source={typeof assistantImage === 'number' ? assistantImage : { uri: assistantImage }}
            style={styles.assistantImage}
          />
          <Text style={styles.assistantNameText}>{assistantName}</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Chào mừng, {userData?.name || 'Bạn'}!</Text>
          <Text style={styles.subtitle}>Tôi là {assistantName}, trợ lý ảo cá nhân của bạn.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin tài khoản</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ và tên:</Text>
            <Text style={styles.infoValue}>{userData?.name || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{userData?.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.startButtonText}>Bắt đầu cuộc trò chuyện</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  customizeLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    marginTop: -20,
  },
  assistantPreview: {
    alignItems: 'center',
    marginBottom: 30,
  },
  assistantImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#3b82f6',
    marginBottom: 12,
  },
  assistantNameText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 40,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  infoValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
