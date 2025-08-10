import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ubicacion } from '../types';
import { ubicacionesAPI } from '../services/api';

interface RouteParams {
  accion: 'CheckIn' | 'CheckOut' | 'EliminarItems';
  titulo: string;
}

export const SeleccionarUbicacionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accion, titulo } = route.params as RouteParams;
  
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUbicaciones();
  }, []);

  const loadUbicaciones = async () => {
    setLoading(true);
    try {
      const data = await ubicacionesAPI.getAll();
      setUbicaciones(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarUbicacion = (ubicacion: Ubicacion) => {
    navigation.navigate(accion, { ubicacion });
  };

  const renderUbicacion = ({ item }: { item: Ubicacion }) => (
    <TouchableOpacity
      style={styles.ubicacionCard}
      onPress={() => seleccionarUbicacion(item)}
    >
      <View style={styles.ubicacionInfo}>
        <Text style={styles.ubicacionNombre}>{item.rack}-{item.fila}-{item.columna}</Text>
        <Text style={styles.ubicacionDetalle}>
          Rack: {item.rack} | Fila: {item.fila} | Columna: {item.columna}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{titulo}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>
          Selecciona la ubicación donde realizarás la operación:
        </Text>

        <FlatList
          data={ubicaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUbicacion}
          refreshing={loading}
          onRefresh={loadUbicaciones}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  ubicacionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ubicacionInfo: {
    flex: 1,
  },
  ubicacionNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ubicacionDetalle: {
    fontSize: 12,
    color: '#666',
  },
});
