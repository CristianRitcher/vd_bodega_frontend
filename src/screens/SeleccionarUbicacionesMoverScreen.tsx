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
import { useNavigation } from '@react-navigation/native';
import { Ubicacion } from '../types';
import { ubicacionesAPI } from '../services/api';

export const SeleccionarUbicacionesMoverScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [ubicacionOrigen, setUbicacionOrigen] = useState<Ubicacion | null>(null);
  const [ubicacionDestino, setUbicacionDestino] = useState<Ubicacion | null>(null);

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

  const seleccionarOrigen = (ubicacion: Ubicacion) => {
    setUbicacionOrigen(ubicacion);
    // Si ya hay destino seleccionado y es el mismo, limpiarlo
    if (ubicacionDestino?.id === ubicacion.id) {
      setUbicacionDestino(null);
    }
  };

  const seleccionarDestino = (ubicacion: Ubicacion) => {
    if (ubicacionOrigen?.id === ubicacion.id) {
      Alert.alert('Error', 'La ubicación de destino debe ser diferente al origen');
      return;
    }
    setUbicacionDestino(ubicacion);
  };

  const continuar = () => {
    if (!ubicacionOrigen) {
      Alert.alert('Error', 'Selecciona la ubicación de origen');
      return;
    }
    if (!ubicacionDestino) {
      Alert.alert('Error', 'Selecciona la ubicación de destino');
      return;
    }

    navigation.navigate('MoverItems', {
      ubicacionOrigen,
      ubicacionDestino,
    });
  };

  const renderUbicacion = ({ item }: { item: Ubicacion }) => {
    const isOrigen = ubicacionOrigen?.id === item.id;
    const isDestino = ubicacionDestino?.id === item.id;
    const isDisabled = ubicacionOrigen && ubicacionOrigen.id === item.id && ubicacionDestino;

    return (
      <View style={styles.ubicacionContainer}>
        <TouchableOpacity
          style={[
            styles.ubicacionCard,
            isOrigen && styles.ubicacionOrigen,
            isDestino && styles.ubicacionDestino,
          ]}
          onPress={() => {
            if (!ubicacionOrigen) {
              seleccionarOrigen(item);
            } else if (!ubicacionDestino) {
              seleccionarDestino(item);
            } else {
              // Si ambas están seleccionadas, permitir cambiar origen
              setUbicacionOrigen(item);
              setUbicacionDestino(null);
            }
          }}
        >
          <View style={styles.ubicacionInfo}>
            <Text style={styles.ubicacionNombre}>{item.rack}-{item.fila}-{item.columna}</Text>
            <Text style={styles.ubicacionDetalle}>
              Rack: {item.rack} | Fila: {item.fila} | Columna: {item.columna}
            </Text>
          </View>
          
          <View style={styles.ubicacionBadges}>
            {isOrigen && (
              <View style={styles.origenBadge}>
                <Text style={styles.badgeText}>ORIGEN</Text>
              </View>
            )}
            {isDestino && (
              <View style={styles.destinoBadge}>
                <Text style={styles.badgeText}>DESTINO</Text>
              </View>
            )}
            {!isOrigen && !isDestino && (
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Mover Items</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.instructionsContainer}>
          <Text style={styles.instruction}>
            1. Selecciona la ubicación de <Text style={styles.origenText}>ORIGEN</Text>
          </Text>
          <Text style={styles.instruction}>
            2. Selecciona la ubicación de <Text style={styles.destinoText}>DESTINO</Text>
          </Text>
        </View>

        <View style={styles.selectionStatus}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Origen:</Text>
            <Text style={[styles.statusValue, { color: '#FF9500' }]}>
              {ubicacionOrigen ? ubicacionOrigen.descripcion : 'No seleccionado'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Destino:</Text>
            <Text style={[styles.statusValue, { color: '#34C759' }]}>
              {ubicacionDestino ? ubicacionDestino.descripcion : 'No seleccionado'}
            </Text>
          </View>
        </View>

        <FlatList
          data={ubicaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUbicacion}
          refreshing={loading}
          onRefresh={loadUbicaciones}
          showsVerticalScrollIndicator={false}
          style={styles.ubicacionesList}
        />

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!ubicacionOrigen || !ubicacionDestino) && styles.continueButtonDisabled
          ]}
          onPress={continuar}
          disabled={!ubicacionOrigen || !ubicacionDestino}
        >
          <Text style={styles.continueButtonText}>
            Continuar con Movimiento
          </Text>
        </TouchableOpacity>
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
  instructionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  origenText: {
    color: '#FF9500',
    fontWeight: 'bold',
  },
  destinoText: {
    color: '#34C759',
    fontWeight: 'bold',
  },
  selectionStatus: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  ubicacionesList: {
    flex: 1,
  },
  ubicacionContainer: {
    marginBottom: 12,
  },
  ubicacionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ubicacionOrigen: {
    borderColor: '#FF9500',
    backgroundColor: '#fff8f0',
  },
  ubicacionDestino: {
    borderColor: '#34C759',
    backgroundColor: '#f0f9f0',
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
  ubicacionBadges: {
    alignItems: 'center',
  },
  origenBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  destinoBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
