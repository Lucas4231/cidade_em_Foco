import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { userService } from '../services/api';

interface CadastroScreenProps {
  setShowRegister: React.Dispatch<React.SetStateAction<boolean>>;
}

const CadastroScreen = ({ setShowRegister }: CadastroScreenProps) => {
  const [dados, setDados] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      // Validações básicas
      if (!dados.nome || !dados.email || !dados.password || !dados.confirmPassword) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos');
        return;
      }

      // Validação do tamanho do email
      if (dados.email.length > 45) {
        Alert.alert('Erro', 'O email não pode ter mais que 45 caracteres');
        return;
      }

      if (dados.password !== dados.confirmPassword) {
        Alert.alert('Erro', 'As senhas não coincidem');
        return;
      }

      setLoading(true);

      // Remove confirmPassword e adiciona level antes de enviar para a API
      const { confirmPassword, ...rest } = dados;
      const userData = {
        ...rest,
        level: 1 // Usuário comum
      };
      
      await userService.create(userData);
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      setShowRegister(false); // Volta para a tela de login
    } catch (error: any) {
      Alert.alert('Erro', error.message);
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
        <Image
          source={require('../../assets/LOGOMARCA.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Cadastro</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.icon}>👤</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#666"
            value={dados.nome}
            onChangeText={(text) => setDados({ ...dados, nome: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.icon}>✉️</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={dados.email}
            onChangeText={(text) => setDados({ ...dados, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={45}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.icon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            value={dados.password}
            onChangeText={(text) => setDados({ ...dados, password: text })}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.icon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirmar senha"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            value={dados.confirmPassword}
            onChangeText={(text) => setDados({ ...dados, confirmPassword: text })}
          />
        </View>

        <TouchableOpacity 
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.registerButtonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já possui conta? </Text>
          <TouchableOpacity onPress={() => setShowRegister(false)}>
            <Text style={styles.loginLink}>fazer login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B39B94',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    marginBottom: 30,
    textAlign: 'center',
    color: '#000',
    fontFamily: 'serif',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginRight: 8,
    fontSize: 18,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    fontFamily: 'serif',
  },
  eyeIcon: {
    padding: 8,
    opacity: 0.7,
  },
  registerButton: {
    backgroundColor: '#8B6B61',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  loginText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'serif',
  },
  loginLink: {
    color: '#8B6B61',
    fontSize: 18,
    fontFamily: 'serif',
  },
});

export default CadastroScreen; 