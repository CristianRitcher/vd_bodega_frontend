import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ubicacion } from '../types';
import { inventariosAPI } from '../services/api';
import { MultipleScanner } from '../components/MultipleScanner';
import { useAuth } from '../context/AuthContext';

interface RouteParams {
  ubicacionOrigen: Ubicacion;
  ubicacionDestino: Ubicacion;
}

export const MoverItemsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { ubicacionOrigen, ubicacionDestino } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(false);
  const [seriales, setSeriales] = useState<string[]>([]);

  const handleCodesChange = useCallback((codes: string[]) => {
    setSeriales(codes);
  }, []);

  const handleSubmit = async () => {
    if (seriales.length === 0) {
      Alert.alert('Error', 'Escanea al menos un serial para mover');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    Alert.alert(
      'Confirmar Movimiento',
      `¿Mover ${seriales.length} item(s)?\n\nDe: ${ubicacionOrigen.rack}-${ubicacionOrigen.fila}-${ubicacionOrigen.columna}\nA: ${ubicacionDestino.rack}-${ubicacionDestino.fila}-${ubicacionDestino.columna}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Mover', onPress: confirmarMovimiento },
      ]
    );
  };

  const confirmarMovimiento = async () => {
    setLoading(true);
    try {
      await inventariosAPI.createMovimiento({
        responsable: user.nombre,
        seriales,
        ubicacion_origen_id: ubicacionOrigen.id,
        ubicacion_destino_id: ubicacionDestino.id,
      });

      Alert.alert(
        'Movimiento Exitoso',
        `Se movieron ${seriales.length} item(s) correctamente`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Inventario'),
          },
        ]
      );
    } catch (error) {
      console.error('Error al mover items:', error);
      Alert.alert('Error', 'No se pudieron mover los items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.movementInfo}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <View style={styles.locationDetails}>
                <Text style={styles.locationLabel}>Desde:</Text>
                <Text style={styles.locationText}>
                  {ubicacionOrigen.rack}-{ubicacionOrigen.fila}-{ubicacionOrigen.columna}
                </Text>
              </View>
            </View>
            
            <View style={styles.arrow}>
              <Ionicons name="arrow-down" size={24} color="#666" />
            </View>
            
            <View style={styles.locationRow}>
              <Ionicons name="location" size={20} color="#28a745" />
              <View style={styles.locationDetails}>
                <Text style={styles.locationLabel}>Hacia:</Text>
                <Text style={styles.locationText}>
                  {ubicacionDestino.rack}-{ubicacionDestino.fila}-{ubicacionDestino.columna}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.scannerSection}>
          <MultipleScanner
            onCodesChange={handleCodesChange}
            placeholder="Escanear serial para mover..."
            title="Seriales para Mover"
            delayMs={500}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || seriales.length === 0) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || seriales.length === 0}
        >
          <Ionicons 
            name="swap-horizontal" 
            size={20} 
            color={loading || seriales.length === 0 ? "#ccc" : "#fff"} 
          />
          <Text style={[
            styles.submitButtonText,
            (loading || seriales.length === 0) && styles.submitButtonTextDisabled,
          ]}>
            {loading ? 'Moviendo...' : `Mover (${seriales.length})`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  movementInfo: {
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  locationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  arrow: {
    paddingVertical: 8,
  },
  scannerSection: {
    flex: 1,
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#ccc',
  },
});