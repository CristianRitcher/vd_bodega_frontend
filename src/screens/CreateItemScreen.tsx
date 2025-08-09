import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { itemsAPI, productosAPI, ubicacionesAPI } from '../services/api';
import { Producto, Ubicacion, EstadoItem } from '../types';

export const CreateItemScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { producto: routeProducto } = route.params as { producto?: Producto } || {};
  
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showUbicacionPicker, setShowUbicacionPicker] = useState(false);
  
  const [formData, setFormData] = useState({
    serial: '',
    descripcion: '',
    estado: EstadoItem.DISPONIBLE,
    ubicacion_id: 0,
    producto_id: routeProducto?.id || 0,
    cantidad_in: '1',
    cantidad_out: '0',
  });

  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(routeProducto || null);
  const [selectedUbicacion, setSelectedUbicacion] = useState<Ubicacion | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productosData, ubicacionesData] = await Promise.all([
        productosAPI.getAll(),
        ubicacionesAPI.getAll(),
      ]);
      setProductos(productosData);
      setUbicaciones(ubicacionesData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  };

  const handleSubmit = async () => {
    if (!formData.serial.trim()) {
      Alert.alert('Error', 'Serial es obligatorio');
      return;
    }

    if (!formData.producto_id || !formData.ubicacion_id) {
      Alert.alert('Error', 'Producto y Ubicación son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        ...formData,
        cantidad_in: parseInt(formData.cantidad_in) || 0,
        cantidad_out: parseInt(formData.cantidad_out) || 0,
      };
      
      await itemsAPI.create(itemData);
      Alert.alert('Éxito', 'Item creado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al crear item');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectProducto = (producto: Producto) => {
    setSelectedProducto(producto);
    updateField('producto_id', producto.id);
    setShowProductPicker(false);
  };

  const selectUbicacion = (ubicacion: Ubicacion) => {
    setSelectedUbicacion(ubicacion);
    updateField('ubicacion_id', ubicacion.id);
    setShowUbicacionPicker(false);
  };

  const estados = [
    { key: EstadoItem.DISPONIBLE, label: 'Disponible' },
    { key: EstadoItem.PRESTADO, label: 'Prestado' },
    { key: EstadoItem.MANTENIMIENTO, label: 'Mantenimiento' },
    { key: EstadoItem.DAÑADO, label: 'Dañado' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Crear Item</Text>
        
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Item</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Serial *</Text>
              <TextInput
                style={styles.input}
                value={formData.serial}
                onChangeText={(value) => updateField('serial', value)}
                placeholder="Código único del item"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.descripcion}
                onChangeText={(value) => updateField('descripcion', value)}
                placeholder="Descripción específica del item"
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Estado</Text>
              <View style={styles.estadoContainer}>
                {estados.map((estado) => (
                  <TouchableOpacity
                    key={estado.key}
                    style={[
                      styles.estadoButton,
                      formData.estado === estado.key && styles.estadoButtonActive
                    ]}
                    onPress={() => updateField('estado', estado.key)}
                  >
                    <Text style={[
                      styles.estadoButtonText,
                      formData.estado === estado.key && styles.estadoButtonTextActive
                    ]}>
                      {estado.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Asignación</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Producto *</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowProductPicker(true)}
              >
                <Text style={[styles.pickerText, !selectedProducto && styles.pickerPlaceholder]}>
                  {selectedProducto ? `${selectedProducto.sku} - ${selectedProducto.descripcion}` : 'Seleccionar producto'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Ubicación *</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowUbicacionPicker(true)}
              >
                <Text style={[styles.pickerText, !selectedUbicacion && styles.pickerPlaceholder]}>
                  {selectedUbicacion ? `${selectedUbicacion.rack}-${selectedUbicacion.fila}-${selectedUbicacion.columna}` : 'Seleccionar ubicación'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cantidades</Text>
            
            <View style={styles.row}>
              <View style={[styles.field, styles.fieldHalf]}>
                <Text style={styles.label}>Cantidad Entrada</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cantidad_in}
                  onChangeText={(value) => updateField('cantidad_in', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.field, styles.fieldHalf]}>
                <Text style={styles.label}>Cantidad Salida</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cantidad_out}
                  onChangeText={(value) => updateField('cantidad_out', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal Selector de Producto */}
      <Modal visible={showProductPicker} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Producto</Text>
            <TouchableOpacity onPress={() => setShowProductPicker(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={productos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => selectProducto(item)}
              >
                <Text style={styles.modalItemTitle}>{item.sku}</Text>
                <Text style={styles.modalItemSubtitle}>{item.descripcion}</Text>
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
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => selectUbicacion(item)}
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
  form: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  field: {
    marginBottom: 15,
  },
  fieldHalf: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
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
    height: 60,
    textAlignVertical: 'top',
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
  estadoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  estadoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  estadoButtonActive: {
    backgroundColor: '#007AFF',
  },
  estadoButtonText: {
    fontSize: 12,
    color: '#007AFF',
  },
  estadoButtonTextActive: {
    color: 'white',
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
    marginTop: 2,
  },
});
