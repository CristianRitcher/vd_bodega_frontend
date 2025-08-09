import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ItemProducto, Ubicacion, Producto, EstadoItem } from '../types';
import { itemsAPI, ubicacionesAPI, productosAPI } from '../services/api';

interface EditItemRouteParams {
  item: ItemProducto;
}

export const EditItemScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params as EditItemRouteParams;
  
  const [loading, setLoading] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showUbicacionPicker, setShowUbicacionPicker] = useState(false);
  const [showProductoPicker, setShowProductoPicker] = useState(false);
  const [showEstadoPicker, setShowEstadoPicker] = useState(false);
  
  const [formData, setFormData] = useState({
    serial: item.serial,
    descripcion: item.descripcion || '',
    estado: item.estado,
    ubicacion_id: item.ubicacion_id,
    producto_id: item.producto_id,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const estadosDisponibles = [
    { value: EstadoItem.DISPONIBLE, label: 'Disponible', icon: 'checkmark-circle', color: '#34C759' },
    { value: EstadoItem.PRESTADO, label: 'Prestado', icon: 'arrow-up-circle', color: '#FF9500' },
    { value: EstadoItem.MANTENIMIENTO, label: 'Mantenimiento', icon: 'construct', color: '#007AFF' },
    { value: EstadoItem.DAÑADO, label: 'Dañado', icon: 'warning', color: '#FF3B30' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ubicacionesData, productosData] = await Promise.all([
        ubicacionesAPI.getAll(),
        productosAPI.getAll(),
      ]);
      setUbicaciones(ubicacionesData);
      setProductos(productosData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.serial.trim()) {
      newErrors.serial = 'Serial es requerido';
    }

    if (!formData.ubicacion_id) {
      newErrors.ubicacion_id = 'Ubicación es requerida';
    }

    if (!formData.producto_id) {
      newErrors.producto_id = 'Producto es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      await itemsAPI.update(item.id, formData);
      
      Alert.alert('Éxito', 'Item actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al actualizar item');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario haga cambios
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getSelectedUbicacion = () => {
    return ubicaciones.find(u => u.id === formData.ubicacion_id);
  };

  const getSelectedProducto = () => {
    return productos.find(p => p.id === formData.producto_id);
  };

  const getSelectedEstado = () => {
    return estadosDisponibles.find(e => e.value === formData.estado);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Editar Item</Text>
        
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información del Item */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Item</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Serial *</Text>
            <TextInput
              style={[styles.input, errors.serial && styles.inputError]}
              value={formData.serial}
              onChangeText={(value) => updateField('serial', value)}
              placeholder="Ej: TALADRO001-001"
              autoCapitalize="characters"
            />
            {errors.serial && <Text style={styles.errorText}>{errors.serial}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descripción (Opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.descripcion}
              onChangeText={(value) => updateField('descripcion', value)}
              placeholder="Descripción específica del item..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Producto Asociado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Producto Asociado</Text>
          
          <TouchableOpacity
            style={[styles.picker, errors.producto_id && styles.pickerError]}
            onPress={() => setShowProductoPicker(true)}
          >
            <Text style={[styles.pickerText, !getSelectedProducto() && styles.pickerPlaceholder]}>
              {getSelectedProducto() 
                ? `${getSelectedProducto()?.sku} - ${getSelectedProducto()?.descripcion}` 
                : 'Seleccionar producto'
              }
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          {errors.producto_id && <Text style={styles.errorText}>{errors.producto_id}</Text>}
        </View>

        {/* Estado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado del Item</Text>
          
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowEstadoPicker(true)}
          >
            <View style={styles.estadoPreview}>
              {getSelectedEstado() && (
                <>
                  <View style={[styles.estadoBadge, { backgroundColor: getSelectedEstado()?.color }]}>
                    <Ionicons 
                      name={getSelectedEstado()?.icon as any} 
                      size={16} 
                      color="white" 
                    />
                  </View>
                  <Text style={styles.pickerText}>{getSelectedEstado()?.label}</Text>
                </>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          
          <TouchableOpacity
            style={[styles.picker, errors.ubicacion_id && styles.pickerError]}
            onPress={() => setShowUbicacionPicker(true)}
          >
            <Text style={[styles.pickerText, !getSelectedUbicacion() && styles.pickerPlaceholder]}>
              {getSelectedUbicacion() 
                ? `${getSelectedUbicacion()?.rack}-${getSelectedUbicacion()?.fila}-${getSelectedUbicacion()?.columna}` 
                : 'Seleccionar ubicación'
              }
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          {errors.ubicacion_id && <Text style={styles.errorText}>{errors.ubicacion_id}</Text>}
        </View>

        {/* Historial de Movimientos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Movimientos</Text>
          
          <View style={styles.movimientosContainer}>
            <View style={styles.movimientoRow}>
              <View style={styles.movimientoInfo}>
                <Ionicons name="arrow-down-circle" size={20} color="#34C759" />
                <Text style={styles.movimientoLabel}>Total Entradas</Text>
              </View>
              <Text style={styles.movimientoValue}>{item.cantidad_in}</Text>
            </View>
            
            <View style={styles.movimientoRow}>
              <View style={styles.movimientoInfo}>
                <Ionicons name="arrow-up-circle" size={20} color="#FF9500" />
                <Text style={styles.movimientoLabel}>Total Salidas</Text>
              </View>
              <Text style={styles.movimientoValue}>{item.cantidad_out}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal Selector de Producto */}
      <Modal visible={showProductoPicker} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Producto</Text>
            <TouchableOpacity onPress={() => setShowProductoPicker(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={productos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: producto }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  updateField('producto_id', producto.id);
                  setShowProductoPicker(false);
                }}
              >
                <Text style={styles.modalItemTitle}>{producto.sku}</Text>
                <Text style={styles.modalItemSubtitle}>{producto.descripcion}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Modal Selector de Estado */}
      <Modal visible={showEstadoPicker} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Estado</Text>
            <TouchableOpacity onPress={() => setShowEstadoPicker(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={estadosDisponibles}
            keyExtractor={(item) => item.value}
            renderItem={({ item: estado }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  updateField('estado', estado.value);
                  setShowEstadoPicker(false);
                }}
              >
                <View style={styles.estadoOption}>
                  <View style={[styles.estadoBadge, { backgroundColor: estado.color }]}>
                    <Ionicons name={estado.icon as any} size={16} color="white" />
                  </View>
                  <Text style={styles.modalItemTitle}>{estado.label}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

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
            renderItem={({ item: ubicacion }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  updateField('ubicacion_id', ubicacion.id);
                  setShowUbicacionPicker(false);
                }}
              >
                <Text style={styles.modalItemTitle}>
                  {ubicacion.rack}-{ubicacion.fila}-{ubicacion.columna}
                </Text>
                <Text style={styles.modalItemSubtitle}>
                  Rack {ubicacion.rack}, Fila {ubicacion.fila}, Columna {ubicacion.columna}
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
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 5,
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
  pickerError: {
    borderColor: '#FF3B30',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  pickerPlaceholder: {
    color: '#999',
  },
  estadoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  estadoBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  movimientosContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
  },
  movimientoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  movimientoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  movimientoLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  movimientoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
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
  modalItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  estadoOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
