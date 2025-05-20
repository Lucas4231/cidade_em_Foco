import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    Platform,
    StatusBar,
    Modal,
    TextInput,
    Alert,
    RefreshControl,
    Image
} from 'react-native';
import { authService, AuthUser } from '../services/auth';
import { uploadService } from '../services/upload';
import * as ImagePicker from 'expo-image-picker';

interface ProfileScreenProps {
    onBack: () => void;
}

export const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [editForm, setEditForm] = useState({
        nome: '',
        email: '',
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await authService.getUser();
            if (userData) {
                setUser(userData);
                setEditForm(prev => ({
                    ...prev,
                    nome: userData.nome,
                    email: userData.email
                }));
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados do usuário');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!editForm.nome.trim() || !editForm.email.trim()) {
            Alert.alert('Erro', 'Nome e email são obrigatórios');
            return;
        }

        if (editForm.novaSenha) {
            if (!editForm.senhaAtual) {
                Alert.alert('Erro', 'Para alterar a senha, informe a senha atual');
                return;
            }
            if (editForm.novaSenha !== editForm.confirmarSenha) {
                Alert.alert('Erro', 'As senhas não coincidem');
                return;
            }
        }

        setEditLoading(true);
        try {
            const updateData = {
                nome: editForm.nome,
                email: editForm.email,
                senhaAtual: editForm.senhaAtual,
                novaSenha: editForm.novaSenha
            };

            console.log('Dados enviados para atualização:', updateData);
            const response = await authService.updateUser(updateData);
            console.log('Resposta da atualização:', response);
            
            await loadUserData();
            setShowEditModal(false);
            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Não foi possível atualizar o perfil');
        } finally {
            setEditLoading(false);
        }
    };

    const handleImageUpload = async () => {
        try {
            setUploadingImage(true);
            
            // Solicitar permissão para acessar a galeria
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Erro', 'Precisamos de permissão para acessar suas fotos');
                return;
            }

            // Selecionar imagem
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) {
                return;
            }

            const imageUri = result.assets[0].uri;

            // Fazer upload da imagem
            const uploadResult = await uploadService.uploadImage(imageUri);
            
            // Atualizar o perfil do usuário com a nova URL da imagem
            const updatedUser = await authService.updateUser({ profileImage: uploadResult.url });
            setUser(updatedUser);
            
            Alert.alert('Sucesso', 'Imagem de perfil atualizada com sucesso!');
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Não foi possível atualizar a imagem de perfil');
        } finally {
            setUploadingImage(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B6B61" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#C4A494" barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea}>
                {/* Botão Voltar */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.topBarTitle}>Perfil</Text>
                    <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => setShowEditModal(true)}
                    >
                        <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={loadUserData}
                            progressBackgroundColor="#B48E7B"
                            colors={['#8B6B61']}
                            tintColor="#8B6B61"
                            progressViewOffset={20}
                        />
                    }
                >
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.avatarContainer}
                            onPress={handleImageUpload}
                            disabled={uploadingImage}
                        >
                            {user?.profileImage ? (
                                <Image 
                                    source={{ uri: user.profileImage }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {user?.nome?.charAt(0).toUpperCase() || '?'}
                                </Text>
                            )}
                            {uploadingImage && (
                                <View style={styles.uploadingOverlay}>
                                    <ActivityIndicator color="#FFF" />
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'email@exemplo.com'}</Text>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Problemas{'\n'}Relatados</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Em{'\n'}Análise</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Problemas{'\n'}Resolvidos</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Meus Relatos</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllButton}>Ver Todos</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                Você ainda não relatou nenhum problema.
                            </Text>
                            <TouchableOpacity style={styles.reportButton}>
                                <Text style={styles.reportButtonText}>Relatar um Problema</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Configurações</Text>
                        <View style={styles.settingsContainer}>
                            <TouchableOpacity style={styles.settingItem}>
                                <Text style={styles.settingText}>Notificações</Text>
                                <Text style={styles.settingArrow}>→</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.settingItem}>
                                <Text style={styles.settingText}>Privacidade</Text>
                                <Text style={styles.settingArrow}>→</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.settingItem}>
                                <Text style={styles.settingText}>Ajuda</Text>
                                <Text style={styles.settingArrow}>→</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Modal de Edição */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ScrollView style={styles.modalScroll}>
                            <Text style={styles.modalTitle}>Editar Perfil</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Nome"
                                value={editForm.nome}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, nome: text }))}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={editForm.email}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Text style={styles.sectionTitle}>Alterar Senha (opcional)</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Senha Atual"
                                secureTextEntry
                                value={editForm.senhaAtual}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, senhaAtual: text }))}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Nova Senha"
                                secureTextEntry
                                value={editForm.novaSenha}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, novaSenha: text }))}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Confirmar Nova Senha"
                                secureTextEntry
                                value={editForm.confirmarSenha}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, confirmarSenha: text }))}
                            />

                            <TouchableOpacity
                                style={[styles.saveButton, editLoading && styles.saveButtonDisabled]}
                                onPress={handleEdit}
                                disabled={editLoading}
                            >
                                {editLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B48E7B',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#B48E7B',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#B48E7B',
    },
    scrollViewContent: {
        flexGrow: 1,
        backgroundColor: '#B48E7B',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#C4A494',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 24,
        color: '#000',
    },
    topBarTitle: {
        fontSize: 20,
        fontFamily: 'serif',
        color: '#000',
    },
    editButton: {
        padding: 8,
    },
    editButtonText: {
        color: '#8B6B61',
        fontSize: 16,
        fontFamily: 'serif',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8ECEC',
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#C4A494',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#8B6B61',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 40,
        color: '#FFF',
        fontFamily: 'serif',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontFamily: 'serif',
        color: '#000',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: '#4A4A4A',
        fontFamily: 'serif',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: '#FFF',
        margin: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8B6B61',
        fontFamily: 'serif',
    },
    statLabel: {
        fontSize: 14,
        color: '#4A4A4A',
        textAlign: 'center',
        fontFamily: 'serif',
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'serif',
        color: '#000',
    },
    seeAllButton: {
        color: '#8B6B61',
        fontSize: 14,
        fontFamily: 'serif',
    },
    emptyState: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#4A4A4A',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'serif',
    },
    reportButton: {
        backgroundColor: '#8B6B61',
        paddingVertical: 12,
        paddingHorizontal: 24,
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
    reportButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'serif',
    },
    settingsContainer: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingText: {
        fontSize: 16,
        color: '#000',
        fontFamily: 'serif',
    },
    settingArrow: {
        fontSize: 20,
        color: '#8B6B61',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        height: '80%',
        backgroundColor: '#F8ECEC',
        borderRadius: 20,
        overflow: 'hidden',
    },
    modalScroll: {
        flex: 1,
        backgroundColor: '#F8ECEC',
        padding: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: 'serif',
        color: '#000',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#E8E8E8',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        color: '#000',
        fontFamily: 'serif',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#8B6B61',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'serif',
    },
    cancelButton: {
        padding: 15,
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#000',
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'serif',
    },
}); 