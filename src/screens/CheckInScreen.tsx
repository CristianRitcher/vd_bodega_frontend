import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { inventariosAPI } from '../services/api';
import { Ubicacion } from '../types';
import { MultipleScanner } from '../components/MultipleScanner';
import { useAuth } from '../context/AuthContext';

export const CheckInScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { ubicacion } = route.params as { ubicacion: Ubicacion };
  
  const [loading, setLoading] = useState(false);
  const [seriales, setSeriales] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (seriales.length === 0) {
      Alert.alert('Error', 'Debes escanear al menos un serial');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    Alert.alert(
      'Confirmar Check-In',
      `¿Confirmas el check-in de ${seriales.length} item(s) en ${ubicacion.rack}-${ubicacion.fila}-${ubicacion.columna}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setLoading(true);
            try {
              await inventariosAPI.createCheckIn({
                responsable: user.nombre,
                seriales: seriales,
                ubicacion_id: ubicacion.id,
              });

              Alert.alert(
                'Check-In Exitoso',
                `Se procesaron ${seriales.length} item(s) correctamente`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              console.error('Error en check-in:', error);
              Alert.alert('Error', 'No se pudo procesar el check-in');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCodesChange = (codes: string[]) => {
    setSeriales(codes);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={24} color="#007AFF" />
            <View style={styles.locationDetails}>
              <Text style={styles.locationTitle}>Ubicación de Check-In</Text>
              <Text style={styles.locationText}>
                {ubicacion.rack}-{ubicacion.fila}-{ubicacion.columna}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.scannerSection}>
          <MultipleScanner
            onCodesChange={handleCodesChange}
            placeholder="Escanear serial para check-in..."
            title="Seriales para Check-In"
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
            name="checkmark-circle" 
            size={20} 
            color={loading || seriales.length === 0 ? "#ccc" : "#fff"} 
          />
          <Text style={[
            styles.submitButtonText,
            (loading || seriales.length === 0) && styles.submitButtonTextDisabled,
          ]}>
            {loading ? 'Procesando...' : `Check-In (${seriales.length})`}
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
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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