import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@CidadeEmFoco:token';

export interface AuthUser {
    cod_usuario: number;
    nome: string;
    email: string;
    level: number;
    profileImage?: string;
}

export interface UpdateUserData {
    nome?: string;
    email?: string;
    senhaAtual?: string;
    novaSenha?: string;
    profileImage?: string;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
}

export const authService = {
    // Login de usuário
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data && response.data.token) {
                await this.setAuth(response.data.token);
            }
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.mensagem) {
                throw new Error(error.response.data.mensagem);
            }
            throw error;
        }
    },

    // Salvar token e dados do usuário
    async setAuth(token: string) {
        try {
            // Salva o token no AsyncStorage
            await AsyncStorage.setItem(TOKEN_KEY, token);
            
            // Configura o token no header do axios
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
            console.error('Erro ao configurar token:', error);
            throw new Error('Erro ao configurar autenticação');
        }
    },

    // Recuperar token salvo
    async getStoredToken(): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (token) {
                // Se encontrou o token, já configura no axios
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            return token;
        } catch (error) {
            console.error('Erro ao recuperar token:', error);
            return null;
        }
    },

    // Recuperar dados do usuário
    async getUser(): Promise<AuthUser | null> {
        try {
            // Primeiro verifica se tem token
            const token = await this.getStoredToken();
            if (!token) {
                return null;
            }

            const response = await api.get('/user/me');
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar usuário:', error);
            if (error.response?.status === 401) {
                await this.logout();
                throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }
            throw error;
        }
    },

    // Verificar se está autenticado
    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await this.getStoredToken();
            if (!token) {
                return false;
            }

            const user = await this.getUser();
            return !!user;
        } catch (error) {
            await this.logout(); // Limpa o token se houver erro
            return false;
        }
    },

    // Fazer logout
    async logout() {
        try {
            // Remove o token do AsyncStorage
            await AsyncStorage.removeItem(TOKEN_KEY);
            
            // Remove o token do header do axios
            delete api.defaults.headers.common['Authorization'];
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            throw new Error('Erro ao fazer logout');
        }
    },

    // Atualizar dados do usuário
    async updateUser(data: UpdateUserData): Promise<AuthUser> {
        try {
            const response = await api.put('/user/profile', data);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao atualizar usuário:', error);
            throw new Error(error.response?.data?.mensagem || 'Erro ao atualizar perfil');
        }
    }
}; 