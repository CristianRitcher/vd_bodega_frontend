import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ItemConSerial, EstadoItem } from '../types';
import { itemsConSerialAPI } from '../services/api';

interface RouteParams {
  item: ItemConSerial;
}

export const ItemConSerialDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(false);

  const getStatusColor = (estado: EstadoItem) => {
    switch (estado) {
      case EstadoItem.ACTIVO: return '#34C759';
      case EstadoItem.PERDIDO: return '#FF3B30';
      case EstadoItem.EN_REPARACION: return '#FF9500';
      case EstadoItem.DISPONIBLE: return '#34C759';
      case EstadoItem.PRESTADO: return '#FF9500';
      case EstadoItem.MANTENIMIENTO: return '#007AFF';
      case EstadoItem.DAÑADO: return '#FF3B30';
      default: return '#666';
    }
  };

  const getStatusIcon = (estado: EstadoItem) => {
    switch (estado) {
      case EstadoItem.ACTIVO: return 'checkmark-circle';
      case EstadoItem.PERDIDO: return 'help-circle';
      case EstadoItem.EN_REPARACION: return 'construct';
      case EstadoItem.DISPONIBLE: return 'checkmark-circle';
      case EstadoItem.PRESTADO: return 'time';
      case EstadoItem.MANTENIMIENTO: return 'build';
      case EstadoItem.DAÑADO: return 'warning';
      default: return 'ellipse';
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditItemConSerial', { item });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar el item ${item.serial}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: confirmarEliminacion },
      ]
    );
  };

  const confirmarEliminacion = async () => {
    setLoading(true);
    try {
      await itemsConSerialAPI.delete(item.id);
      Alert.alert('Éxito', 'Item eliminado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalle del Item</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Información Principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Principal</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Serial:</Text>
              <Text style={styles.infoValue}>{item.serial}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <View style={styles.statusContainer}>
                <Ionicons 
                  name={getStatusIcon(item.estado)} 
                  size={16} 
                  color={getStatusColor(item.estado)} 
                />
                <Text style={[styles.statusText, { color: getStatusColor(item.estado) }]}>
                  {item.estado.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Check:</Text>
              <View style={styles.statusContainer}>
                <Ionicons 
                  name={item.check === 'in' ? 'arrow-down-circle' : 'arrow-up-circle'} 
                  size={16} 
                  color={item.check === 'in' ? '#34C759' : '#FF9500'} 
                />
                <Text style={[styles.statusText, { color: item.check === 'in' ? '#34C759' : '#FF9500' }]}>
                  {item.check === 'in' ? 'EN BODEGA' : 'FUERA DE BODEGA'}
                </Text>
              </View>
            </View>
            
            {item.descripcion && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Descripción:</Text>
                <Text style={styles.infoValue}>{item.descripcion}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Información del Producto */}
        {item.producto && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Producto</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>SKU:</Text>
                <Text style={styles.infoValue}>{item.producto.sku}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Descripción:</Text>
                <Text style={styles.infoValue}>{item.producto.descripcion}</Text>
              </View>
              
              {item.producto.marca && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Marca:</Text>
                  <Text style={styles.infoValue}>{item.producto.marca}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Información de Ubicación */}
        {item.ubicacion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ubicación:</Text>
                <Text style={styles.infoValue}>
                  {item.ubicacion.rack}-{item.ubicacion.fila}-{item.ubicacion.columna}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Acciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create" size={20} color="white" />
            <Text style={styles.editButtonText}>Editar Item</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.deleteButtonText}>Eliminar Item</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
