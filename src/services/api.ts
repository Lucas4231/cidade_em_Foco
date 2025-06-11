import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cria a instância do axios com a URL base
const baseURL = 'https://neondb-3yaa.onrender.com/api';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 segundos de timeout
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('@CidadeEmFoco:token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Erro na requisição:', error);
        return Promise.reject(error);
    }
);

// Função para fazer retry da requisição
const retryRequest = async (config: any, retries = 3, delay = 1000) => {
    try {
        return await api(config);
    } catch (error: any) {
        if (retries === 0) {
            throw error;
        }
        
        // Aguarda antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Tenta novamente com um delay maior
        return retryRequest(config, retries - 1, delay * 2);
    }
};

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Se o erro for 401 (não autorizado)
        if (error.response?.status === 401) {
            return Promise.reject(new Error('Sessão expirada. Por favor, faça login novamente.'));
        }

        // Se for erro 502 (Bad Gateway) ou 503 (Service Unavailable)
        if (error.response?.status === 502 || error.response?.status === 503) {
            return Promise.reject(new Error('Servidor temporariamente indisponível. Por favor, tente novamente em alguns minutos.'));
        }

        // Se for erro de timeout
        if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('O servidor está demorando para responder. Por favor, tente novamente.'));
        }

        // Se for erro de rede
        if (!error.response) {
            return Promise.reject(new Error('Erro de conexão. Verifique sua conexão com a internet.'));
        }

        // Retorna a mensagem de erro do servidor se disponível
        if (error.response?.data?.mensagem) {
            return Promise.reject(new Error(error.response.data.mensagem));
        }

        return Promise.reject(error);
    }
);

// Interface para resposta de autenticação
export interface AuthResponse {
    user: {
        idUser: number;
        nome: string;
        email: string;
        level: number;
    };
    token: string;
}

// Interface para criação de usuário
export interface UserCreate {
    nome: string;
    email: string;
    password: string;
}

// Interface para resposta de erro
export interface ApiError {
    erro?: string;
    mensagem?: string;
    error?: string;
}

// Interface para o relatório de problema
export interface ProblemReport {
    photo: FormData;
    description: string;
}

// Interface para a publicação
export interface Publicacao {
    id: number;
    imagem: string;
    descricao: string;
    curtidas: number;
    createdAt: string;
    usuario: {
        cod_usuario: number;
        nome: string;
        profileImage: string;
    };
}

// Serviço de problemas
export const problemService = {
    // Reportar problema
    async report(data: FormData) {
        try {
            const response = await api.post('/report-problem', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.erro || error.response.data.error || 'Erro ao reportar problema');
            }
            throw error;
        }
    }
};

// Serviço de usuário
export const userService = {
    // Criar usuário
    async create(data: UserCreate) {
        try {
            const response = await api.post('/auth/register', data);
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.mensagem || 'Erro ao criar usuário');
            }
            throw error;
        }
    },

    // Autenticar usuário
    async authenticate(email: string, password: string) {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data as AuthResponse;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.mensagem || 'Erro ao fazer login');
            }
            throw error;
        }
    },

    // Buscar usuário atual
    async getCurrentUser() {
        try {
            const response = await api.get('/user/me');
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.mensagem || 'Erro ao buscar usuário');
            }
            throw error;
        }
    },

    // Atualizar usuário
    async update(data: any) {
        try {
            const response = await api.put('/user/profile', data);
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.mensagem || 'Erro ao atualizar usuário');
            }
            throw error;
        }
    },

    // Atualizar foto do perfil
    async updateProfileImage(imageUrl: string) {
        try {
            const response = await api.put('/user/profile-image', { imageUrl });
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.mensagem || 'Erro ao atualizar foto do perfil');
            }
            throw error;
        }
    }
};

// Funções para publicações
export const publicacaoService = {
    // Criar uma nova publicação
    async criarPublicacao(formData: FormData): Promise<Publicacao> {
        try {
            console.log('Enviando requisição para criar publicação...');
            const response = await api.post('/publicacoes', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                },
                transformRequest: (data, headers) => {
                    return data; // Não transformar o FormData
                },
            });
            console.log('Resposta recebida:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Erro na requisição:', error.response?.data || error.message);
            throw error;
        }
    },

    // Buscar todas as publicações
    async getPublicacoes(): Promise<Publicacao[]> {
        const response = await api.get('/publicacoes');
        return response.data;
    },

    // Curtir uma publicação
    async curtirPublicacao(id: number): Promise<void> {
        await api.post(`/publicacoes/${id}/curtir`);
    },

    // Descurtir uma publicação
    async descurtirPublicacao(id: number): Promise<void> {
        await api.post(`/publicacoes/${id}/descurtir`);
    }
}; 