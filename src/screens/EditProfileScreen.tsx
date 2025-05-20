import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { authService } from '../services/auth';

interface EditProfileScreenProps {
  navigation: any;
}

export const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await authService.getUser();
      if (user) {
        setUserData(prevState => ({
          ...prevState,
          nome: user.nome,
          email: user.email
        }));
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do usuário');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validações
      if (!userData.nome || !userData.email) {
        Alert.alert('Erro', 'Nome e email são obrigatórios');
        return;
      }

      if (userData.novaSenha && userData.novaSenha !== userData.confirmarSenha) {
        Alert.alert('Erro', 'As senhas não coincidem');
        return;
      }

      if (userData.novaSenha && !userData.senhaAtual) {
        Alert.alert('Erro', 'Para alterar a senha, informe a senha atual');
        return;
      }

      // Prepara os dados para atualização
      const updateData: any = {
        nome: userData.nome,
        email: userData.email
      };

      if (userData.novaSenha && userData.senhaAtual) {
        updateData.senhaAtual = userData.senhaAtual;
        updateData.novaSenha = userData.novaSenha;
        console.log('Tentando atualizar senha...'); // Log para debug
      }

      await authService.updateUser(updateData);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
      navigation.goBack();
    } catch (error: any) {
      console.error('Erro detalhado:', error); // Log para debug
      if (error.response?.status === 401) {
        Alert.alert('Erro', 'Senha atual incorreta. Por favor, verifique e tente novamente.');
      } else if (error.response?.status === 400) {
        Alert.alert('Erro', error.response.data.mensagem || 'Dados inválidos');
      } else {
        Alert.alert('Erro', error.message || 'Erro ao atualizar perfil. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Editar Perfil</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={userData.nome}
            onChangeText={(text) => setUserData(prev => ({ ...prev, nome: text }))}
            placeholder="Seu nome"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={userData.email}
            onChangeText={(text) => setUserData(prev => ({ ...prev, email: text }))}
            placeholder="Seu email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Alterar Senha</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Senha Atual</Text>
          <TextInput
            style={styles.input}
            value={userData.senhaAtual}
            onChangeText={(text) => setUserData(prev => ({ ...prev, senhaAtual: text }))}
            placeholder="Digite sua senha atual"
            placeholderTextColor="#666"
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nova Senha</Text>
          <TextInput
            style={styles.input}
            value={userData.novaSenha}
            onChangeText={(text) => setUserData(prev => ({ ...prev, novaSenha: text }))}
            placeholder="Digite a nova senha"
            placeholderTextColor="#666"
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmar Nova Senha</Text>
          <TextInput
            style={styles.input}
            value={userData.confirmarSenha}
            onChangeText={(text) => setUserData(prev => ({ ...prev, confirmarSenha: text }))}
            placeholder="Confirme a nova senha"
            placeholderTextColor="#666"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EAE6',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B6B61',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  separator: {
    height: 1,
    backgroundColor: '#DDD',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#8B6B61',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#B48E7B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 