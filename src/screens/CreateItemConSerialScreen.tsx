import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Producto, Ubicacion, EstadoItem } from '../types';
import { itemsConSerialAPI, ubicacionesAPI } from '../services/api';
import { MultipleScanner } from '../components/MultipleScanner';

interface RouteParams {
  producto: Producto;
}

export const CreateItemConSerialScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { producto } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<Ubicacion | null>(null);
  const [seriales, setSeriales] = useState<string[]>([]);
  const [showUbicacionSelector, setShowUbicacionSelector] = useState(false);

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
    // Filtrar códigos vacíos para asegurar que solo se envíen códigos válidos
    const validCodes = codes.filter(code => code.trim() !== '');
    console.log('Códigos recibidos del scanner:', codes);
    console.log('Códigos válidos filtrados:', validCodes);
    setSeriales(validCodes);
  }, []);

  const handleSubmit = async () => {
    if (!ubicacionSeleccionada) {
      Alert.alert('Error', 'Debes seleccionar una ubicación');
      return;
    }

    if (seriales.length === 0) {
      Alert.alert('Error', 'Debes escanear al menos un serial');
      return;
    }

    const payload = {
      seriales: seriales,
      producto_id: producto.id,
      ubicacion_id: ubicacionSeleccionada.id,
      estado: EstadoItem.ACTIVO,
      check: 'in' as 'in' | 'out',
    };

    console.log('Payload a enviar:', payload);
    console.log('Seriales:', seriales);
    console.log('Producto ID:', producto.id);
    console.log('Ubicación ID:', ubicacionSeleccionada.id);

    setLoading(true);
    try {
      await itemsConSerialAPI.bulkCreate(payload);

      Alert.alert(
        'Items Creados',
        `Se crearon ${seriales.length} item(s) correctamente`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ProductoDetail', { 
              producto: { ...producto, _refresh: Date.now() } 
            }),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error completo al crear items:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      Alert.alert('Error', `No se pudieron crear los items: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderUbicacionItem = ({ item }: { item: Ubicacion }) => (
    <TouchableOpacity
      style={[
        styles.ubicacionItem,
        ubicacionSeleccionada?.id === item.id && styles.ubicacionItemSelected,
      ]}
      onPress={() => {
        setUbicacionSeleccionada(item);
        setShowUbicacionSelector(false);
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
      {ubicacionSeleccionada?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  if (showUbicacionSelector) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowUbicacionSelector(false)}
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
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>Crear Items con Serial</Text>
          <Text style={styles.productSku}>SKU: {producto.sku}</Text>
          <Text style={styles.productDescription}>{producto.descripcion}</Text>
        </View>

        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Ubicación *</Text>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={() => setShowUbicacionSelector(true)}
          >
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.locationText}>
                {ubicacionSeleccionada 
                  ? `${ubicacionSeleccionada.rack}-${ubicacionSeleccionada.fila}-${ubicacionSeleccionada.columna}`
                  : 'Seleccionar ubicación...'
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.scannerSection}>
          <MultipleScanner
            onCodesChange={handleCodesChange}
            placeholder="Escanear serial del item..."
            title="Seriales de Items"
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
            styles.createButton,
            (loading || !ubicacionSeleccionada || seriales.length === 0) && styles.createButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || !ubicacionSeleccionada || seriales.length === 0}
        >
          <Ionicons 
            name="add-circle" 
            size={20} 
            color={loading || !ubicacionSeleccionada || seriales.length === 0 ? "#ccc" : "#fff"} 
          />
          <Text style={[
            styles.createButtonText,
            (loading || !ubicacionSeleccionada || seriales.length === 0) && styles.createButtonTextDisabled,
          ]}>
            {loading ? 'Creando...' : `Crear (${seriales.length})`}
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
  productInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productSku: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#28a745',
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