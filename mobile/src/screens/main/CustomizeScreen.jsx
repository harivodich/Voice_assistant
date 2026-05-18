import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/userService';
import { PRESET_ASSISTANT_IMAGES, DEFAULT_ASSISTANT_NAME } from '../../constants/presets';

export default function CustomizeScreen({ navigation }) {
  const { userData, userToken, updateUserData } = useContext(AuthContext);

  const [name, setName] = useState(userData?.profile?.assistant_name || DEFAULT_ASSISTANT_NAME);
  const [selectedImage, setSelectedImage] = useState(userData?.profile?.assistant_image || PRESET_ASSISTANT_IMAGES[0]);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên trợ lý');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.updateProfile({
        assistant_name: name.trim(),
        assistant_image: selectedImage
      }, userToken);

      // Backend returns { message, user: { ... } }
      await updateUserData(response.user);
      Alert.alert('Thành công', 'Đã cập nhật thông tin trợ lý', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tùy chỉnh Trợ lý</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hình ảnh đại diện</Text>
          <View style={styles.imagePreviewContainer}>
            <Image
              source={typeof selectedImage === 'number' ? selectedImage : { uri: selectedImage }}
              style={styles.mainPreview}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsContainer}>
            {PRESET_ASSISTANT_IMAGES.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImage(img)}
                style={[
                  styles.presetItem,
                  selectedImage === img && styles.selectedPresetItem
                ]}
              >
                <Image
                  source={typeof img === 'number' ? img : { uri: img }}
                  style={styles.presetImage}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tên trợ lý</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ví dụ: Mây, Sol, Linh..."
            placeholderTextColor="#64748b"
          />
          <Text style={styles.hintText}>Tên này sẽ hiển thị trong các cuộc hội thoại.</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  backButton: {
    color: '#3b82f6',
    fontSize: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3b82f6',
    backgroundColor: '#1e293b',
  },
  presetsContainer: {
    flexDirection: 'row',
  },
  presetItem: {
    marginRight: 12,
    borderRadius: 40,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPresetItem: {
    borderColor: '#3b82f6',
  },
  presetImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e293b',
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  hintText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
