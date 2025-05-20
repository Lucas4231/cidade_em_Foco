import { api } from './api';

export const uploadService = {
    async uploadImage(imageUri: string) {
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'profile.jpg'
            } as any);

            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Erro ao fazer upload da imagem:', error);
            throw new Error('Não foi possível fazer upload da imagem');
        }
    },

    async deleteImage(publicId: string) {
        const response = await api.delete(`/upload/${publicId}`);
        return response.data;
    }
}; 