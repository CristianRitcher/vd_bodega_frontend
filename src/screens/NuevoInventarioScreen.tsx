import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ubicacionesAPI, inventariosAPI, itemsAPI } from '../services/api';
import { Ubicacion, ItemInventario } from '../types';
import { Scanner } from '../components/Scanner';
import { useAuth } from '../context/AuthContext';

export const NuevoInventarioScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [selectedUbicacion, setSelectedUbicacion] = useState<Ubicacion | null>(null);
  const [showUbicacionPicker, setShowUbicacionPicker] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [items, setItems] = useState<ItemInventario[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [tempCantidad, setTempCantidad] = useState('');

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

  const handleScan = async (serial: string) => {
    setShowScanner(false);
    
    try {
      // Verificar si el item existe
      await itemsAPI.getBySerial(serial);
      
      // Verificar si ya está en la lista
      const existingIndex = items.findIndex(item => item.serial === serial);
      if (existingIndex >= 0) {
        // Si ya existe, incrementar cantidad
        const updatedItems = [...items];
        updatedItems[existingIndex].cantidad += 1;
        setItems(updatedItems);
        Alert.alert('Item actualizado', `Cantidad incrementada para ${serial}`);
      } else {
        // Si no existe, agregar nuevo
        const newItem: ItemInventario = {
          serial,
          cantidad: 1,
        };
        setItems(prev => [...prev, newItem]);
        Alert.alert('Item agregado', `${serial} agregado al inventario`);
      }
    } catch (error) {
      Alert.alert('Error', `No se encontró el item con serial: ${serial}`);
    }
  };

  const updateCantidad = (index: number, nuevaCantidad: string) => {
    const cantidad = parseInt(nuevaCantidad) || 0;
    if (cantidad < 0) return;
    
    const updatedItems = [...items];
    updatedItems[index].cantidad = cantidad;
    setItems(updatedItems);
    setEditingItem(null);
  };

  const removeItem = (index: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Deseas eliminar este item del inventario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          const updatedItems = items.filter((_, i) => i !== index);
          setItems(updatedItems);
        }}
      ]
    );
  };

  const handleSubmit = async () => {
    if (!selectedUbicacion) {
      Alert.alert('Error', 'Selecciona una ubicación');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Agrega al menos un item al inventario');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    setLoading(true);
    try {
      await inventariosAPI.createInventario({
        responsable: user.nombre,
        lista: items,
        ubicacion_id: selectedUbicacion.id,
      });
      
      Alert.alert('Éxito', 'Inventario creado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al crear inventario');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: ItemInventario; index: number }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemSerial}>{item.serial}</Text>
        
        {editingItem === index ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={tempCantidad}
              onChangeText={setTempCantidad}
              keyboardType="numeric"
              autoFocus
              onBlur={() => {
                updateCantidad(index, tempCantidad);
                setEditingItem(null);
              }}
              onSubmitEditing={() => {
                updateCantidad(index, tempCantidad);
              }}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.cantidadContainer}
            onPress={() => {
              setEditingItem(index);
              setTempCantidad(item.cantidad.toString());
            }}
          >
            <Text style={styles.cantidadLabel}>Cantidad:</Text>
            <Text style={styles.cantidadValue}>{item.cantidad}</Text>
            <Ionicons name="pencil" size={16} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(index)}
      >
        <Ionicons name="trash" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  if (showScanner) {
    return (
      <Scanner
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
        title="Escanear Item para Inventario"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Nuevo Inventario</Text>
        
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || !selectedUbicacion || items.length === 0}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación a Inventariar</Text>
          
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowUbicacionPicker(true)}
          >
            <Text style={[styles.pickerText, !selectedUbicacion && styles.pickerPlaceholder]}>
              {selectedUbicacion 
                ? `${selectedUbicacion.rack}-${selectedUbicacion.fila}-${selectedUbicacion.columna}` 
                : 'Seleccionar ubicación'
              }
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items Inventariados ({items.length})</Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setShowScanner(true)}
            >
              <Ionicons name="barcode" size={20} color="white" />
              <Text style={styles.scanButtonText}>Escanear</Text>
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No hay items inventariados</Text>
              <Text style={styles.emptySubtext}>
                Usa el scanner para agregar items al inventario
              </Text>
            </View>
          ) : (
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.serial}-${index}`}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Modal Selector de Ubicación */}
      <Modal visible={showUbicacionPicker} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Ubicación</Text>
            <TouchableOpacity onPress={() => setShowUbicacionPicker(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={ubicaciones}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedUbicacion(item);
                  setShowUbicacionPicker(false);
                }}
              >
                <Text style={styles.modalItemTitle}>
                  {item.rack}-{item.fila}-{item.columna}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  pickerPlaceholder: {
    color: '#999',
  },
  scanButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemSerial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cantidadLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  cantidadValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalItem: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
