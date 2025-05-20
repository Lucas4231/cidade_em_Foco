import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { api } from '../services/api';
import { USER_LEVEL_LABELS } from '../constants/userLevels';
import { authService } from '../services/auth';

interface User {
    cod_usuario: number;
    nome: string;
    email: string;
    level: number;
    createdat: string;
}

export const AdminScreen = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao carregar usuários');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadUsers();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    const renderItem = ({ item }: { item: User }) => (
        <View style={styles.userCard}>
            <Text style={styles.userName}>{item.nome}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <View style={styles.userInfo}>
                <Text style={styles.userLevel}>
                    Nível: {USER_LEVEL_LABELS[item.level as keyof typeof USER_LEVEL_LABELS]}
                </Text>
                <Text style={styles.userDate}>
                    Cadastro: {formatDate(item.createdat)}
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#8B6B61" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Usuários</Text>
            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={(item) => item.cod_usuario.toString()}
                contentContainerStyle={styles.listContainer}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B39B94',
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: '#B39B94',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontFamily: 'serif',
        color: '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 20,
    },
    userCard: {
        backgroundColor: '#E8E8E8',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    userName: {
        fontSize: 18,
        fontFamily: 'serif',
        color: '#000',
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    userInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    userLevel: {
        fontSize: 14,
        color: '#8B6B61',
    },
    userDate: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        marginTop: 20,
    },
}); 