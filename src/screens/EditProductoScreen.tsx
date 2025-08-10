import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Producto } from '../types';
import { productosAPI } from '../services/api';

interface EditProductoRouteParams {
  producto: Producto;
}

export const EditProductoScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { producto } = route.params as EditProductoRouteParams;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sku: producto.sku,
    descripcion: producto.descripcion,
    categoria: producto.categoria || '',
    material: producto.material || '',
    marca: producto.marca || '',
    proveedor: producto.proveedor || '',
    imagen_url: producto.imagen_url || '',
    moq: producto.moq?.toString() || '',
    um: producto.um || '',
    ue: producto.ue || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'Descripción es requerida';
    }

    if (formData.moq && isNaN(Number(formData.moq))) {
      newErrors.moq = 'MOQ debe ser un número';
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
      const updateData = {
        ...formData,
        moq: formData.moq ? parseInt(formData.moq) : undefined,
      };

      await productosAPI.update(producto.id, updateData);
      
      Alert.alert('Éxito', 'Producto actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al actualizar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de eliminar el producto ${producto.sku}?\n\nEsto también eliminará todos los items asociados. Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: confirmDelete }
      ]
    );
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await productosAPI.delete(producto.id);
      Alert.alert('Éxito', 'Producto eliminado correctamente', [
        { text: 'OK', onPress: () => navigation.navigate('MainTabs') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al eliminar producto');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
        
        <Text style={styles.title}>Editar Producto</Text>
        
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
        {/* Imagen del Producto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imagen del Producto</Text>
          
          <View style={styles.imageContainer}>
            {formData.imagen_url ? (
              <Image 
                source={{ uri: formData.imagen_url }} 
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={48} color="#ccc" />
                <Text style={styles.imagePlaceholderText}>Sin imagen</Text>
              </View>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>URL de Imagen</Text>
            <TextInput
              style={styles.input}
              value={formData.imagen_url}
              onChangeText={(value) => updateField('imagen_url', value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Información Básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>SKU *</Text>
            <TextInput
              style={[styles.input, errors.sku && styles.inputError]}
              value={formData.sku}
              onChangeText={(value) => updateField('sku', value)}
              placeholder="Ej: TALADRO001"
              autoCapitalize="characters"
            />
            {errors.sku && <Text style={styles.errorText}>{errors.sku}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.descripcion && styles.inputError]}
              value={formData.descripcion}
              onChangeText={(value) => updateField('descripcion', value)}
              placeholder="Descripción del producto"
              multiline
              numberOfLines={3}
            />
            {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}
          </View>
        </View>

        {/* Clasificación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clasificación</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Categoría</Text>
            <TextInput
              style={styles.input}
              value={formData.categoria}
              onChangeText={(value) => updateField('categoria', value)}
              placeholder="Ej: Herramientas eléctricas"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Material</Text>
            <TextInput
              style={styles.input}
              value={formData.material}
              onChangeText={(value) => updateField('material', value)}
              placeholder="Ej: Acero inoxidable"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Marca</Text>
            <TextInput
              style={styles.input}
              value={formData.marca}
              onChangeText={(value) => updateField('marca', value)}
              placeholder="Ej: DeWalt"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Proveedor</Text>
            <TextInput
              style={styles.input}
              value={formData.proveedor}
              onChangeText={(value) => updateField('proveedor', value)}
              placeholder="Ej: Ferretek"
            />
          </View>
        </View>

        {/* Especificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especificaciones</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>MOQ (Cantidad Mínima)</Text>
            <TextInput
              style={[styles.input, errors.moq && styles.inputError]}
              value={formData.moq}
              onChangeText={(value) => updateField('moq', value)}
              placeholder="Ej: 10"
              keyboardType="numeric"
            />
            {errors.moq && <Text style={styles.errorText}>{errors.moq}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Unidad de Medida (UM)</Text>
            <TextInput
              style={styles.input}
              value={formData.um}
              onChangeText={(value) => updateField('um', value)}
              placeholder="Ej: PZA, KG, M"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Unidad de Empaque (UE)</Text>
            <TextInput
              style={styles.input}
              value={formData.ue}
              onChangeText={(value) => updateField('ue', value)}
              placeholder="Ej: Caja, Paquete"
            />
          </View>
        </View>

        {/* Estadísticas del Producto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#34C759' }]}>
                {producto.cantidad_in_total}
              </Text>
              <Text style={styles.statLabel}>Total Entradas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#FF9500' }]}>
                {producto.cantidad_out_total}
              </Text>
              <Text style={styles.statLabel}>Total Salidas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#007AFF' }]}>
                {producto.cantidad_in_total + producto.cantidad_out_total}
              </Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>
          </View>
        </View>

        {/* Acciones Peligrosas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona Peligrosa</Text>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={loading}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>
              {loading ? 'Eliminando...' : 'Eliminar Producto'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.deleteWarning}>
            ⚠️ Eliminar este producto también eliminará todos los items asociados
          </Text>
        </View>
      </ScrollView>
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteWarning: {
    fontSize: 12,
    color: '#FF3B30',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
