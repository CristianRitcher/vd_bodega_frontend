import React, { useState, useEffect } from 'react';
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
import { Scanner } from '../components/Scanner';

interface RouteParams {
  producto: Producto;
}

export const CreateItemConSerialScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { producto } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<Ubicacion | null>(null);
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

  const handleScanResult = (serial: string) => {
    setShowScanner(false);
    
    if (!seriales.includes(serial)) {
      setSeriales(prev => [...prev, serial]);
    } else {
      Alert.alert('Serial duplicado', `El serial ${serial} ya está en la lista`);
    }
  };

  const removeSerial = (index: number) => {
    setSeriales(prev => prev.filter((_, i) => i !== index));
  };

  const guardarItems = async () => {
    if (!ubicacionSeleccionada) {
      Alert.alert('Error', 'Selecciona una ubicación');
      return;
    }

    if (seriales.length === 0) {
      Alert.alert('Error', 'Agrega al menos un serial');
      return;
    }

    setLoading(true);
    try {
      await itemsConSerialAPI.bulkCreate({
        seriales,
        ubicacion_id: ubicacionSeleccionada.id,
        producto_id: producto.id,
        estado: EstadoItem.ACTIVO,
        check: 'in',
      });

      Alert.alert('Éxito', `Se crearon ${seriales.length} items`, [
        {
          text: 'OK',
          onPress: () => {
            // Refrescar la pantalla anterior
            navigation.navigate('ProductoDetail', { 
              producto: { ...producto, _refresh: Date.now() } 
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron crear los items');
    } finally {
      setLoading(false);
    }
  };

  const renderSerial = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.serialItem}>
      <Text style={styles.serialText}>{item}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeSerial(index)}
      >
        <Ionicons name="close-circle" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const renderUbicacion = ({ item }: { item: Ubicacion }) => (
    <TouchableOpacity
      style={[
        styles.ubicacionItem,
        ubicacionSeleccionada?.id === item.id && styles.ubicacionSelected,
      ]}
      onPress={() => setUbicacionSeleccionada(item)}
    >
      <Text style={styles.ubicacionText}>{item.rack}-{item.fila}-{item.columna}</Text>
      {ubicacionSeleccionada?.id === item.id && (
        <Ionicons name="checkmark-circle" size={20} color="#34C759" />
      )}
    </TouchableOpacity>
  );

  if (showScanner) {
    return (
      <Scanner
        onScan={handleScanResult}
        onClose={() => setShowScanner(false)}
        title="Escanear Serial"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Crear Items con Serial</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.productoInfo}>
          <Text style={styles.productoSku}>{producto.sku}</Text>
          <Text style={styles.productoDescripcion}>{producto.descripcion}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Seleccionar Ubicación</Text>
          <FlatList
            data={ubicaciones}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderUbicacion}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.ubicacionesList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. Escanear Seriales ({seriales.length})</Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setShowScanner(true)}
              disabled={!ubicacionSeleccionada}
            >
              <Ionicons name="barcode" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {seriales.length > 0 && (
            <FlatList
              data={seriales}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderSerial}
              style={styles.serialesList}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, (!ubicacionSeleccionada || seriales.length === 0) && styles.saveButtonDisabled]}
          onPress={guardarItems}
          disabled={loading || !ubicacionSeleccionada || seriales.length === 0}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : `Crear ${seriales.length} Items`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  productoInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productoSku: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  productoDescripcion: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ubicacionesList: {
    maxHeight: 60,
  },
  ubicacionItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ubicacionSelected: {
    borderColor: '#34C759',
    backgroundColor: '#f0f9f0',
  },
  ubicacionText: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
  },
  serialesList: {
    maxHeight: 200,
  },
  serialItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  serialText: {
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
