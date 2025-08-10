import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ItemConSerial, EstadoItem, Ubicacion } from '../types';
import { itemsConSerialAPI, ubicacionesAPI } from '../services/api';

interface RouteParams {
  item: ItemConSerial;
}

export const EditItemConSerialScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(false);
  const [serial, setSerial] = useState(item.serial);
  const [descripcion, setDescripcion] = useState(item.descripcion || '');
  const [estado, setEstado] = useState(item.estado);
  const [check, setCheck] = useState(item.check);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<Ubicacion | null>(item.ubicacion || null);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [showUbicaciones, setShowUbicaciones] = useState(false);

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

  const handleSave = async () => {
    if (!serial.trim()) {
      Alert.alert('Error', 'El serial es requerido');
      return;
    }
    
    if (!ubicacionSeleccionada) {
      Alert.alert('Error', 'Selecciona una ubicación');
      return;
    }

    setLoading(true);
    try {
      await itemsConSerialAPI.update(item.id, {
        serial: serial.trim(),
        descripcion: descripcion.trim(),
        estado,
        check,
        ubicacion_id: ubicacionSeleccionada.id,
        producto_id: item.producto_id,
      });

      Alert.alert('Éxito', 'Item actualizado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            // Navegar de vuelta y forzar refresh
            navigation.navigate('ItemConSerialDetail', { 
              item: { ...item, _refresh: Date.now() } 
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el item');
    } finally {
      setLoading(false);
    }
  };

  const estadosDisponibles = [
    EstadoItem.ACTIVO,
    EstadoItem.PERDIDO,
    EstadoItem.EN_REPARACION,
    EstadoItem.DISPONIBLE,
    EstadoItem.PRESTADO,
    EstadoItem.MANTENIMIENTO,
    EstadoItem.DAÑADO,
  ];

  const renderUbicacion = ({ item }: { item: Ubicacion }) => (
    <TouchableOpacity
      style={[
        styles.ubicacionItem,
        ubicacionSeleccionada?.id === item.id && styles.ubicacionSelected,
      ]}
      onPress={() => {
        setUbicacionSeleccionada(item);
        setShowUbicaciones(false);
      }}
    >
      <Text style={styles.ubicacionText}>{item.rack}-{item.fila}-{item.columna}</Text>
      {ubicacionSeleccionada?.id === item.id && (
        <Ionicons name="checkmark-circle" size={20} color="#34C759" />
      )}
    </TouchableOpacity>
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
        <Text style={styles.title}>Editar Item con Serial</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Serial */}
        <View style={styles.section}>
          <Text style={styles.label}>Serial *</Text>
          <TextInput
            style={styles.input}
            value={serial}
            onChangeText={setSerial}
            placeholder="Ingresa el serial"
            autoCapitalize="characters"
          />
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Descripción adicional (opcional)"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Estado */}
        <View style={styles.section}>
          <Text style={styles.label}>Estado *</Text>
          <View style={styles.estadosContainer}>
            {estadosDisponibles.map((estadoItem) => (
              <TouchableOpacity
                key={estadoItem}
                style={[
                  styles.estadoButton,
                  estado === estadoItem && styles.estadoButtonSelected,
                ]}
                onPress={() => setEstado(estadoItem)}
              >
                <Text style={[
                  styles.estadoButtonText,
                  estado === estadoItem && styles.estadoButtonTextSelected,
                ]}>
                  {estadoItem.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Check */}
        <View style={styles.section}>
          <Text style={styles.label}>Estado en Bodega *</Text>
          <View style={styles.checkContainer}>
            <TouchableOpacity
              style={[
                styles.checkButton,
                { 
                  borderColor: '#34C759',
                  backgroundColor: check === 'in' ? '#34C759' : 'white'
                }
              ]}
              onPress={() => setCheck('in')}
            >
              <Ionicons 
                name="arrow-down-circle" 
                size={20} 
                color={check === 'in' ? 'white' : '#34C759'} 
              />
              <Text style={[
                styles.checkButtonText,
                { color: check === 'in' ? 'white' : '#34C759' }
              ]}>
                EN BODEGA
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.checkButton,
                { 
                  borderColor: '#FF9500',
                  backgroundColor: check === 'out' ? '#FF9500' : 'white'
                }
              ]}
              onPress={() => setCheck('out')}
            >
              <Ionicons 
                name="arrow-up-circle" 
                size={20} 
                color={check === 'out' ? 'white' : '#FF9500'} 
              />
              <Text style={[
                styles.checkButtonText,
                { color: check === 'out' ? 'white' : '#FF9500' }
              ]}>
                FUERA DE BODEGA
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <Text style={styles.label}>Ubicación *</Text>
          <TouchableOpacity
            style={styles.ubicacionSelector}
            onPress={() => setShowUbicaciones(!showUbicaciones)}
          >
            <Text style={styles.ubicacionSelectorText}>
              {ubicacionSeleccionada 
                ? `${ubicacionSeleccionada.rack}-${ubicacionSeleccionada.fila}-${ubicacionSeleccionada.columna}`
                : 'Seleccionar ubicación'
              }
            </Text>
            <Ionicons 
              name={showUbicaciones ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>

          {showUbicaciones && (
            <View style={styles.ubicacionesList}>
              <FlatList
                data={ubicaciones}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUbicacion}
                style={styles.ubicacionesContainer}
                nestedScrollEnabled
              />
            </View>
          )}
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
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
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  estadosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  estadoButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  estadoButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  estadoButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  estadoButtonTextSelected: {
    color: 'white',
  },
  checkContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  checkButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  checkButtonSelected: {
    backgroundColor: 'transparent',
  },
  checkButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  checkButtonTextSelected: {
    color: 'white',
  },
  ubicacionSelector: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ubicacionSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  ubicacionesList: {
    marginTop: 8,
  },
  ubicacionesContainer: {
    maxHeight: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ubicacionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ubicacionSelected: {
    backgroundColor: '#e8f5e8',
  },
  ubicacionText: {
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
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
