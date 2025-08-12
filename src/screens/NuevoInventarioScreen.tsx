import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ubicacionesAPI, inventariosAPI } from '../services/api';
import { Ubicacion } from '../types';
import { MultipleScanner } from '../components/MultipleScanner';
import { useAuth } from '../context/AuthContext';

export const NuevoInventarioScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [selectedUbicacion, setSelectedUbicacion] = useState<Ubicacion | null>(null);
  const [showUbicacionPicker, setShowUbicacionPicker] = useState(false);
  const [seriales, setSeriales] = useState<string[]>([]);

  useEffect(() => {
    loadUbicaciones();
  }, []);

  const loadUbicaciones = async () => {
    try {
      const data = await ubicacionesAPI.getAll();
      setUbicaciones(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las ubicaciones');
    }
  };

  const handleCodesChange = useCallback((codes: string[]) => {
    setSeriales(codes);
  }, []);

  const handleSubmit = async () => {
    if (!selectedUbicacion) {
      Alert.alert('Error', 'Selecciona una ubicación');
      return;
    }

    if (seriales.length === 0) {
      Alert.alert('Error', 'Escanea al menos un serial para el inventario');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    Alert.alert(
      'Confirmar Inventario',
      `¿Crear inventario con ${seriales.length} item(s) en ${selectedUbicacion.rack}-${selectedUbicacion.fila}-${selectedUbicacion.columna}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear',
          onPress: async () => {
            setLoading(true);
            try {
              await inventariosAPI.createInventario({
                responsable: user.nombre,
                seriales: seriales,
                ubicacion_id: selectedUbicacion.id,
              });

              Alert.alert(
                'Inventario Creado',
                `Se creó el inventario con ${seriales.length} item(s) correctamente`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              console.error('Error al crear inventario:', error);
              Alert.alert('Error', 'No se pudo crear el inventario');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderUbicacionItem = ({ item }: { item: Ubicacion }) => (
    <TouchableOpacity
      style={[
        styles.ubicacionItem,
        selectedUbicacion?.id === item.id && styles.ubicacionItemSelected,
      ]}
      onPress={() => {
        setSelectedUbicacion(item);
        setShowUbicacionPicker(false);
      }}
    >
      <View style={styles.ubicacionInfo}>
        <Text style={styles.ubicacionText}>
          {item.rack}-{item.fila}-{item.columna}
        </Text>
        <Text style={styles.ubicacionSubtext}>
          Rack: {item.rack} | Fila: {item.fila} | Columna: {item.columna}
        </Text>
      </View>
      {selectedUbicacion?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  if (showUbicacionPicker) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowUbicacionPicker(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seleccionar Ubicación</Text>
        </View>

        <FlatList
          data={ubicaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUbicacionItem}
          style={styles.list}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.title}>Nuevo Inventario</Text>
          <Text style={styles.subtitle}>
            Selecciona una ubicación y escanea los items para crear un inventario
          </Text>
        </View>

        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Ubicación *</Text>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={() => setShowUbicacionPicker(true)}
          >
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.locationText}>
                {selectedUbicacion 
                  ? `${selectedUbicacion.rack}-${selectedUbicacion.fila}-${selectedUbicacion.columna}`
                  : 'Seleccionar ubicación...'
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {selectedUbicacion && (
          <View style={styles.scannerSection}>
            <MultipleScanner
              onCodesChange={handleCodesChange}
              placeholder="Escanear serial para inventario..."
              title="Seriales Inventariados"
              delayMs={500}
            />
          </View>
        )}
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
            styles.createButton,
            (loading || !selectedUbicacion || seriales.length === 0) && styles.createButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || !selectedUbicacion || seriales.length === 0}
        >
          <Ionicons 
            name="clipboard" 
            size={20} 
            color={loading || !selectedUbicacion || seriales.length === 0 ? "#ccc" : "#fff"} 
          />
          <Text style={[
            styles.createButtonText,
            (loading || !selectedUbicacion || seriales.length === 0) && styles.createButtonTextDisabled,
          ]}>
            {loading ? 'Creando...' : `Crear Inventario (${seriales.length})`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  locationSection: {
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
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  scannerSection: {
    flex: 1,
    marginTop: 20,
  },
  list: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  ubicacionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ubicacionItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  ubicacionInfo: {
    flex: 1,
  },
  ubicacionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  ubicacionSubtext: {
    fontSize: 14,
    color: '#666',
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
  createButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#6f42c1',
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  createButtonTextDisabled: {
    color: '#ccc',
  },
});