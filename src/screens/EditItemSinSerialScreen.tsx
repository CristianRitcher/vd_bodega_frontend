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
import { ItemSinSerial, Ubicacion } from '../types';
import { itemsSinSerialAPI, ubicacionesAPI } from '../services/api';

interface RouteParams {
  item: ItemSinSerial;
}

export const EditItemSinSerialScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(false);
  const [cantidadIn, setCantidadIn] = useState(item.cantidad_in.toString());
  const [cantidadOut, setCantidadOut] = useState(item.cantidad_out.toString());
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
    const cantIn = parseInt(cantidadIn) || 0;
    const cantOut = parseInt(cantidadOut) || 0;
    
    if (cantIn < 0 || cantOut < 0) {
      Alert.alert('Error', 'Las cantidades no pueden ser negativas');
      return;
    }
    
    if (!ubicacionSeleccionada) {
      Alert.alert('Error', 'Selecciona una ubicación');
      return;
    }

    setLoading(true);
    try {
      await itemsSinSerialAPI.update(item.id, {
        cantidad_in: cantIn,
        cantidad_out: cantOut,
        ubicacion_id: ubicacionSeleccionada.id,
        producto_id: item.producto_id,
      });

      Alert.alert('Éxito', 'Item actualizado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            // Navegar de vuelta y forzar refresh
            navigation.navigate('ItemSinSerialDetail', { 
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
        <Text style={styles.title}>Editar Item sin Serial</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Información del Producto */}
        {item.producto && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Producto</Text>
            <View style={styles.infoCard}>
              <Text style={styles.productInfo}>SKU: {item.producto.sku}</Text>
              <Text style={styles.productInfo}>{item.producto.descripcion}</Text>
            </View>
          </View>
        )}

        {/* Cantidad In */}
        <View style={styles.section}>
          <Text style={styles.label}>Cantidad In (Entradas) *</Text>
          <TextInput
            style={styles.input}
            value={cantidadIn}
            onChangeText={setCantidadIn}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>

        {/* Cantidad Out */}
        <View style={styles.section}>
          <Text style={styles.label}>Cantidad Out (Salidas) *</Text>
          <TextInput
            style={styles.input}
            value={cantidadOut}
            onChangeText={setCantidadOut}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>

        {/* Total */}
        <View style={styles.section}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Items:</Text>
            <Text style={styles.totalValue}>
              {(parseInt(cantidadIn) || 0) + (parseInt(cantidadOut) || 0)}
            </Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
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
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  totalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
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
