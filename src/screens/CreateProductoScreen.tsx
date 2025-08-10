import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { productosAPI } from '../services/api';

export const CreateProductoScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    sku: '',
    descripcion: '',
    categoria: '',
    material: '',
    marca: '',
    proveedor: '',
    imagen_url: '',
    moq: '',
    um: '',
    ue: '',
    serial: true,
  });

  const handleSubmit = async () => {
    if (!formData.sku.trim() || !formData.descripcion.trim()) {
      Alert.alert('Error', 'SKU y Descripción son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        moq: formData.moq ? parseInt(formData.moq) : undefined,
        serial: formData.serial,
      };
      
      await productosAPI.create(productData);
      Alert.alert('Éxito', 'Producto creado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        
        <Text style={styles.title}>Crear Producto</Text>
        
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
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>SKU *</Text>
              <TextInput
                style={styles.input}
                value={formData.sku}
                onChangeText={(value) => updateField('sku', value)}
                placeholder="Código único del producto"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.descripcion}
                onChangeText={(value) => updateField('descripcion', value)}
                placeholder="Descripción detallada del producto"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Categoría</Text>
              <TextInput
                style={styles.input}
                value={formData.categoria}
                onChangeText={(value) => updateField('categoria', value)}
                placeholder="Ej: Herramientas Eléctricas"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles del Producto</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Marca</Text>
              <TextInput
                style={styles.input}
                value={formData.marca}
                onChangeText={(value) => updateField('marca', value)}
                placeholder="Ej: Bosch, Stanley"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Material</Text>
              <TextInput
                style={styles.input}
                value={formData.material}
                onChangeText={(value) => updateField('material', value)}
                placeholder="Ej: Acero, Plástico"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Proveedor</Text>
              <TextInput
                style={styles.input}
                value={formData.proveedor}
                onChangeText={(value) => updateField('proveedor', value)}
                placeholder="Nombre del proveedor"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Adicional</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>URL de Imagen</Text>
              <TextInput
                style={styles.input}
                value={formData.imagen_url}
                onChangeText={(value) => updateField('imagen_url', value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.fieldHalf]}>
                <Text style={styles.label}>MOQ</Text>
                <TextInput
                  style={styles.input}
                  value={formData.moq}
                  onChangeText={(value) => updateField('moq', value)}
                  placeholder="Cantidad mínima"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.field, styles.fieldHalf]}>
                <Text style={styles.label}>UM</Text>
                <TextInput
                  style={styles.input}
                  value={formData.um}
                  onChangeText={(value) => updateField('um', value)}
                  placeholder="Ej: PZA, KG"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>UE (Unidad de Empaque)</Text>
              <TextInput
                style={styles.input}
                value={formData.ue}
                onChangeText={(value) => updateField('ue', value)}
                placeholder="Ej: Caja, Paquete"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de Item</Text>
            
            <View style={styles.serialOptions}>
              <TouchableOpacity
                style={[styles.serialOption, formData.serial && styles.serialOptionSelected]}
                onPress={() => setFormData(prev => ({ ...prev, serial: true }))}
              >
                <Ionicons 
                  name={formData.serial ? "radio-button-on" : "radio-button-off"} 
                  size={20} 
                  color={formData.serial ? "#007AFF" : "#ccc"} 
                />
                <View style={styles.serialOptionText}>
                  <Text style={styles.serialOptionTitle}>Con Serial</Text>
                  <Text style={styles.serialOptionDesc}>Items únicos con código de barras</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.serialOption, !formData.serial && styles.serialOptionSelected]}
                onPress={() => setFormData(prev => ({ ...prev, serial: false }))}
              >
                <Ionicons 
                  name={!formData.serial ? "radio-button-on" : "radio-button-off"} 
                  size={20} 
                  color={!formData.serial ? "#007AFF" : "#ccc"} 
                />
                <View style={styles.serialOptionText}>
                  <Text style={styles.serialOptionTitle}>Sin Serial</Text>
                  <Text style={styles.serialOptionDesc}>Items por cantidad (ej: tornillos, cables)</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
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
    height: 80,
    textAlignVertical: 'top',
  },
  serialOptions: {
    gap: 12,
  },
  serialOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  serialOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  serialOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  serialOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  serialOptionDesc: {
    fontSize: 12,
    color: '#666',
  },
});
