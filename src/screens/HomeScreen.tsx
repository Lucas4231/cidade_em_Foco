import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Platform,
    Image,
    Alert,
    Modal,
    ActivityIndicator,
    FlatList,
    RefreshControl
} from 'react-native';
import { authService } from '../services/auth';
import { publicacaoService, Publicacao } from '../services/api';
import { ProfileScreen } from './ProfileScreen';
import { ReportProblem } from './ReportProblem';
import { PublicacaoCard } from '../components/PublicacaoCard';

interface HomeScreenProps {
    onLogout: () => void;
}

export const HomeScreen = ({ onLogout }: HomeScreenProps) => {
    const [currentScreen, setCurrentScreen] = useState<'home' | 'profile'>('home');
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
    const [retryCount, setRetryCount] = useState(0);

    const carregarPublicacoes = async () => {
        try {
            const data = await publicacaoService.getPublicacoes();
            setPublicacoes(data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as publicações');
        }
    };

    useEffect(() => {
        checkServerStatus();
    }, [retryCount]);

    useEffect(() => {
        if (!loading) {
            carregarPublicacoes();
        }
    }, [loading]);

    const checkServerStatus = async () => {
        try {
            setLoading(true);
            await authService.getUser();
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            if (error.message.includes('Servidor temporariamente indisponível')) {
                Alert.alert(
                    'Servidor Indisponível',
                    'O servidor está iniciando. Deseja tentar novamente?',
                    [
                        {
                            text: 'Não',
                            style: 'cancel'
                        },
                        {
                            text: 'Sim',
                            onPress: () => setRetryCount(prev => prev + 1)
                        }
                    ]
                );
            } else {
                Alert.alert('Erro', error.message);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            onLogout();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível fazer logout');
        }
    };

    const handleCurtir = async (id: number) => {
        try {
            await publicacaoService.curtirPublicacao(id);
            carregarPublicacoes(); // Recarrega as publicações para atualizar as curtidas
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível curtir a publicação');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await carregarPublicacoes();
        setRefreshing(false);
    };

    if (currentScreen === 'profile') {
        return <ProfileScreen 
            onBack={() => setCurrentScreen('home')} 
            onLogout={handleLogout}
        />;
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8B6B61" />
                    <Text style={styles.loadingText}>Conectando ao servidor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#F8ECEC" barStyle="dark-content" />
            <View style={styles.container}>
                {/* Lista de publicações */}
                <FlatList
                    data={publicacoes}
                    renderItem={({ item }) => (
                        <PublicacaoCard
                            publicacao={item}
                            onCurtir={handleCurtir}
                        />
                    )}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#8B6B61']}
                        />
                    }
                />

                {/* Menu de navegação inferior */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem}>
                        <Image 
                            source={require('../../assets/icons/icon-question-png.png')}
                            style={styles.navIcon}
                        />
                        <Text style={styles.navText}>Ajuda</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem}>
                        <Image 
                            source={require('../../assets/icons/icon-location-png.png')}
                            style={styles.navIcon}
                        />
                        <Text style={styles.navText}>Mapa</Text>
                    </TouchableOpacity>

                    {/* Botão Adicionar no Centro */}
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => setShowAddModal(true)}
                    >
                        <View style={styles.addButtonInner}>
                            <Text style={styles.addButtonText}>+</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem}>
                        <Image 
                            source={require('../../assets/icons/icon-prefeituras-png.png')}
                            style={styles.navIcon}
                        />
                        <Text style={styles.navText}>Trabalho</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.navItem} 
                        onPress={() => setCurrentScreen('profile')}
                    >
                        <Image 
                            source={require('../../assets/icons/icon-user-png.png')}
                            style={styles.navIcon}
                        />
                        <Text style={styles.navText}>Perfil</Text>
                    </TouchableOpacity>
                </View>

                {/* Modal de Nova Publicação */}
                <Modal
                    visible={showAddModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowAddModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <ReportProblem 
                                onClose={() => setShowAddModal(false)}
                                onPublicacaoCriada={carregarPublicacoes}
                            />
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8ECEC',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    },
    container: {
        flex: 1,
        backgroundColor: '#F8ECEC',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 30,
        color: '#000',
        fontFamily: 'serif',
    },
    logoutButton: {
        backgroundColor: '#6B4F47',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    logoutButtonText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'serif',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#C4A494',
        paddingVertical: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    navItem: {
        alignItems: 'center',
        padding: 10,
    },
    navIcon: {
        width: 24,
        height: 24,
        marginBottom: 4,
        tintColor: '#000',
    },
    navText: {
        fontSize: 12,
        color: '#000',
        fontFamily: 'serif',
    },
    addButton: {
        width: 56,
        height: 56,
        marginBottom: 4,
        backgroundColor: '#8B6B61',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addButtonInner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 28,
        backgroundColor: '#8B6B61',
    },
    addButtonText: {
        fontSize: 32,
        color: '#FFF',
        fontWeight: 'bold',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8ECEC',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#8B6B61',
        fontFamily: 'serif',
    },
    listContent: {
        padding: 15,
    },
}); 