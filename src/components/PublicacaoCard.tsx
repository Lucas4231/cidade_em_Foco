import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Publicacao } from '../services/api';

interface PublicacaoCardProps {
  publicacao: Publicacao;
  onCurtir: (id: number) => void;
}

export const PublicacaoCard = ({ publicacao, onCurtir }: PublicacaoCardProps) => {
  return (
    <View style={styles.container}>
      {/* Cabeçalho com foto e nome do usuário */}
      <View style={styles.header}>
        <Image
          source={{ uri: publicacao.usuario.profileImage || 'https://via.placeholder.com/40' }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{publicacao.usuario.nome}</Text>
      </View>

      {/* Imagem da publicação */}
      <Image
        source={{ uri: publicacao.imagem }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Descrição */}
      <Text style={styles.description}>{publicacao.descricao}</Text>

      {/* Botão de curtir */}
      <TouchableOpacity
        style={styles.likeButton}
        onPress={() => onCurtir(publicacao.id)}
      >
        <Text style={styles.likeButtonText}>
          ❤️ {publicacao.curtidas} curtidas
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 15,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'serif',
  },
  image: {
    width: '100%',
    height: Dimensions.get('window').width,
    aspectRatio: 1,
  },
  description: {
    padding: 15,
    fontSize: 16,
    color: '#000',
    fontFamily: 'serif',
  },
  likeButton: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  likeButtonText: {
    fontSize: 16,
    color: '#8B6B61',
    fontFamily: 'serif',
  },
}); 