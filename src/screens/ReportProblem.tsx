import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';

interface ReportProblemProps {
  onClose: () => void;
}

export const ReportProblem = ({ onClose }: ReportProblemProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'ios') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de acesso à câmera para tirar fotos. Por favor, permita o acesso nas configurações do seu dispositivo.',
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') }
          ]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível acessar a câmera');
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Erro', 'Por favor, tire uma foto do problema');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, descreva o problema');
      return;
    }

    setLoading(true);

    try {
      // Criar um FormData para enviar a imagem
      const formData = new FormData();
      formData.append('photo', {
        uri: image,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);
      formData.append('description', description);

      // Enviar para o backend
      await api.post('/report-problem', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Sucesso', 'Problema reportado com sucesso!');
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reportar Problema</Text>

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>📸 Tirar Foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Descreva o problema..."
        placeholderTextColor="#666"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>Enviar Relatório</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#B39B94',
  },
  title: {
    fontSize: 24,
    fontFamily: 'serif',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageButton: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'serif',
  },
  input: {
    backgroundColor: '#E8E8E8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    color: '#000',
    fontFamily: 'serif',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#8B6B61',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'serif',
  },
  cancelButton: {
    padding: 15,
  },
  cancelButtonText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'serif',
  },
}); 