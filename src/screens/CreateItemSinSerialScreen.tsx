import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Producto, Ubicacion } from '../types';
import { itemsSinSerialAPI, ubicacionesAPI } from '../services/api';

interface RouteParams {
  producto: Producto;
}

interface ItemData {
  ubicacion: Ubicacion;
  cantidad_in: number;
  cantidad_out: number;
}

export const CreateItemSinSerialScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { producto } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [itemsData, setItemsData] = useState<ItemData[]>([]);

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

  const agregarUbicacion = () => {
    const ubicacionesDisponibles = ubicaciones.filter(
      ub => !itemsData.some(item => item.ubicacion.id === ub.id)
    );

    if (ubicacionesDisponibles.length === 0) {
      Alert.alert('Info', 'Todas las ubicaciones ya están agregadas');
      return;
    }

    Alert.alert(
      'Seleccionar Ubicación',
      'Elige una ubicación para agregar',
      ubicacionesDisponibles.map(ubicacion => ({
        text: ubicacion.descripcion,
        onPress: () => {
          setItemsData(prev => [...prev, {
            ubicacion,
            cantidad_in: 0,
            cantidad_out: 0,
          }]);
        },
      })).concat([{ text: 'Cancelar', style: 'cancel' }])
    );
  };

  const updateCantidad = (index: number, field: 'cantidad_in' | 'cantidad_out', value: string) => {
    const numValue = parseInt(value) || 0;
    setItemsData(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: numValue } : item
    ));
  };

  const removeItem = (index: number) => {
    setItemsData(prev => prev.filter((_, i) => i !== index));
  };

  const guardarItems = async () => {
    const itemsValidos = itemsData.filter(item => 
      item.cantidad_in > 0 || item.cantidad_out > 0
    );

    if (itemsValidos.length === 0) {
      Alert.alert('Error', 'Agrega al menos un item con cantidad mayor a 0');
      return;
    }

    setLoading(true);
    try {
      for (const itemData of itemsValidos) {
        await itemsSinSerialAPI.create({
          cantidad_in: itemData.cantidad_in,
          cantidad_out: itemData.cantidad_out,
          ubicacion_id: itemData.ubicacion.id,
          producto_id: producto.id,
        });
      }

      Alert.alert('Éxito', `Se crearon ${itemsValidos.length} items sin serial`, [
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

  const renderItemData = ({ item, index }: { item: ItemData; index: number }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.ubicacionText}>{item.ubicacion.rack}-{item.ubicacion.fila}-{item.ubicacion.columna}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(index)}
        >
          <Ionicons name="close-circle" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cantidadesContainer}>
        <View style={styles.cantidadInput}>
          <Text style={styles.cantidadLabel}>Cantidad In:</Text>
          <TextInput
            style={styles.textInput}
            value={item.cantidad_in.toString()}
            onChangeText={(value) => updateCantidad(index, 'cantidad_in', value)}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        
        <View style={styles.cantidadInput}>
          <Text style={styles.cantidadLabel}>Cantidad Out:</Text>
          <TextInput
            style={styles.textInput}
            value={item.cantidad_out.toString()}
            onChangeText={(value) => updateCantidad(index, 'cantidad_out', value)}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>
    </View>
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
        <Text style={styles.title}>Crear Items Sin Serial</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.productoInfo}>
          <Text style={styles.productoSku}>{producto.sku}</Text>
          <Text style={styles.productoDescripcion}>{producto.descripcion}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items por Ubicación ({itemsData.length})</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={agregarUbicacion}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {itemsData.length > 0 ? (
            <FlatList
              data={itemsData}
              keyExtractor={(item, index) => `${item.ubicacion.id}-${index}`}
              renderItem={renderItemData}
              style={styles.itemsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Agrega ubicaciones para comenzar</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, itemsData.length === 0 && styles.saveButtonDisabled]}
          onPress={guardarItems}
          disabled={loading || itemsData.length === 0}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : 'Crear Items'}
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
  addButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 8,
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
  itemsList: {
    maxHeight: 400,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cantidadesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cantidadInput: {
    flex: 1,
  },
  cantidadLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
  removeButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
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
