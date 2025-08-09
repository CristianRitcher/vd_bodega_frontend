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
import { ubicacionesAPI } from '../services/api';

export const CreateUbicacionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    rack: '',
    fila: '',
    columna: '',
  });

  const handleSubmit = async () => {
    if (!formData.rack.trim() || !formData.fila.trim() || !formData.columna.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      await ubicacionesAPI.create(formData);
      Alert.alert('Éxito', 'Ubicación creada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al crear ubicación');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePreview = () => {
    const { rack, fila, columna } = formData;
    if (rack && fila && columna) {
      return `${rack}-${fila}-${columna}`;
    }
    return 'Ejemplo: R01-A-1';
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
        
        <Text style={styles.title}>Crear Ubicación</Text>
        
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
          <View style={styles.previewSection}>
            <Text style={styles.previewLabel}>Vista previa:</Text>
            <Text style={styles.previewText}>{generatePreview()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Ubicación</Text>
            <Text style={styles.sectionSubtitle}>
              Define la ubicación física en la bodega usando el formato Rack-Fila-Columna
            </Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Rack *</Text>
              <TextInput
                style={styles.input}
                value={formData.rack}
                onChangeText={(value) => updateField('rack', value.toUpperCase())}
                placeholder="Ej: R01, R02, RACK-A"
                autoCapitalize="characters"
              />
              <Text style={styles.fieldHelp}>
                Identificador del rack o estante principal
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Fila *</Text>
              <TextInput
                style={styles.input}
                value={formData.fila}
                onChangeText={(value) => updateField('fila', value.toUpperCase())}
                placeholder="Ej: A, B, C, 1, 2, 3"
                autoCapitalize="characters"
              />
              <Text style={styles.fieldHelp}>
                Fila dentro del rack (puede ser letra o número)
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Columna *</Text>
              <TextInput
                style={styles.input}
                value={formData.columna}
                onChangeText={(value) => updateField('columna', value)}
                placeholder="Ej: 1, 2, 3, A, B"
                autoCapitalize="characters"
              />
              <Text style={styles.fieldHelp}>
                Posición específica en la fila
              </Text>
            </View>
          </View>

          <View style={styles.examplesSection}>
            <Text style={styles.examplesTitle}>Ejemplos de ubicaciones:</Text>
            <View style={styles.examplesList}>
              <Text style={styles.exampleItem}>• R01-A-1 (Rack 01, Fila A, Columna 1)</Text>
              <Text style={styles.exampleItem}>• R02-B-3 (Rack 02, Fila B, Columna 3)</Text>
              <Text style={styles.exampleItem}>• EST-1-A (Estante 1, Fila 1, Columna A)</Text>
              <Text style={styles.exampleItem}>• ALM-TOP-1 (Almacén TOP, Fila 1)</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Consejos para ubicaciones</Text>
                <Text style={styles.infoText}>
                  • Usa códigos consistentes y fáciles de recordar{'\n'}
                  • Considera el flujo de trabajo de la bodega{'\n'}
                  • Mantén un sistema lógico y escalable
                </Text>
              </View>
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
  previewSection: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  previewText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    fontFamily: 'monospace',
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
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  field: {
    marginBottom: 20,
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
    marginBottom: 5,
  },
  fieldHelp: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  examplesSection: {
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
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  examplesList: {
    gap: 8,
  },
  exampleItem: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
