import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { inventariosAPI } from '../services/api';
import { Ubicacion } from '../types';
import { MultipleScanner } from '../components/MultipleScanner';
import { useAuth } from '../context/AuthContext';

export const EliminarItemsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { ubicacion } = route.params as { ubicacion: Ubicacion };
  
  const [loading, setLoading] = useState(false);
  const [seriales, setSeriales] = useState<string[]>([]);
  const [razon, setRazon] = useState('');

  const handleSubmit = async () => {
    if (seriales.length === 0) {
      Alert.alert('Error', 'Debes escanear al menos un serial');
      return;
    }

    if (!razon.trim()) {
      Alert.alert('Error', 'Debes especificar una razón para la eliminación');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    Alert.alert(
      'Confirmar Eliminación',
      `¿Confirmas la eliminación de ${seriales.length} item(s) desde ${ubicacion.rack}-${ubicacion.fila}-${ubicacion.columna}?\n\nRazón: ${razon}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await inventariosAPI.createEliminado({
                responsable: user.nombre,
                razon: razon.trim(),
                seriales: seriales,
                ubicacion_id: ubicacion.id,
              });

              Alert.alert(
                'Eliminación Exitosa',
                `Se eliminaron ${seriales.length} item(s) correctamente`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              console.error('Error al eliminar items:', error);
              Alert.alert('Error', 'No se pudieron eliminar los items');
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

  const razonesSugeridas = [
    'Pérdida',
    'Daño irreparable',
    'Venta',
    'Donación',
    'Obsolescencia',
    'Robo',
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={24} color="#FF3B30" />
            <View style={styles.locationDetails}>
              <Text style={styles.locationTitle}>Ubicación de Eliminación</Text>
              <Text style={styles.locationText}>
                {ubicacion.rack}-{ubicacion.fila}-{ubicacion.columna}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.reasonSection}>
          <Text style={styles.sectionTitle}>Razón de Eliminación *</Text>
          <TextInput
            style={styles.reasonInput}
            value={razon}
            onChangeText={setRazon}
            placeholder="Especifica la razón de eliminación..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          
          <Text style={styles.suggestionsTitle}>Razones sugeridas:</Text>
          <View style={styles.suggestionsContainer}>
            {razonesSugeridas.map((sugerencia, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionButton,
                  razon === sugerencia && styles.suggestionButtonActive,
                ]}
                onPress={() => setRazon(sugerencia)}
              >
                <Text style={[
                  styles.suggestionText,
                  razon === sugerencia && styles.suggestionTextActive,
                ]}>
                  {sugerencia}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.scannerSection}>
          <MultipleScanner
            onCodesChange={handleCodesChange}
            placeholder="Escanear serial para eliminar..."
            title="Seriales para Eliminar"
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
            (loading || seriales.length === 0 || !razon.trim()) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || seriales.length === 0 || !razon.trim()}
        >
          <Ionicons 
            name="trash" 
            size={20} 
            color={loading || seriales.length === 0 || !razon.trim() ? "#ccc" : "#fff"} 
          />
          <Text style={[
            styles.submitButtonText,
            (loading || seriales.length === 0 || !razon.trim()) && styles.submitButtonTextDisabled,
          ]}>
            {loading ? 'Eliminando...' : `Eliminar (${seriales.length})`}
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
  reasonSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
    minHeight: 80,
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestionButtonActive: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
  },
  suggestionTextActive: {
    color: '#fff',
    fontWeight: '500',
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
    backgroundColor: '#FF3B30',
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