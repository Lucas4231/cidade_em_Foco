import React, { useState, useRef } from 'react';
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
import { authService } from '../services/auth';

interface LoginScreenProps {
  setShowRegister: React.Dispatch<React.SetStateAction<boolean>>;
  onLoginSuccess: () => void;
}

const LoginScreen = ({ setShowRegister, onLoginSuccess }: LoginScreenProps) => {
  const [dados, setDados] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Refs para os inputs
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    try {
      if (!dados.email || !dados.password) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos');
        return;
      }

      setLoading(true);
      const response = await authService.login(dados.email, dados.password);
      
      if (response.token) {
        await authService.setAuth(response.token);
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        onLoginSuccess();
      } else {
        Alert.alert('Erro', 'Token não recebido do servidor');
      }
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../../assets/LOGOMARCA.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Image
          source={require('../../assets/CEF - Letras.png')}
          style={styles.letters}
          resizeMode="contain"
        />

        <Text style={styles.title}>Login</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.icon}>✉️</Text>
          <TextInput
            style={styles.input}
            placeholder="email ou username"
            placeholderTextColor="#666"
            value={dados.email}
            onChangeText={(text) => setDados({ ...dados, email: text })}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.icon}>🔒</Text>
          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            value={dados.password}
            onChangeText={(text) => setDados({ ...dados, password: text })}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPassword}>Esqueci a senha</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não possui conta? </Text>
          <TouchableOpacity onPress={() => setShowRegister(true)}>
            <Text style={styles.registerLink}>cadastre-se</Text>
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
    marginBottom: 0,
  },
  letters: {
    width: 250,
    height: 60,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: 5,
  },
  forgotPassword: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'serif',
  },
  loginButton: {
    backgroundColor: '#8B6B61',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  registerText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'serif',
  },
  registerLink: {
    color: '#8B6B61',
    fontSize: 18,
    fontFamily: 'serif',
  },
});

export default LoginScreen; 