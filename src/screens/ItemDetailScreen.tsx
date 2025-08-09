import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ItemProducto } from '../types';
import { itemsAPI } from '../services/api';

interface ItemDetailRouteParams {
  item: ItemProducto;
}

export const ItemDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params as ItemDetailRouteParams;
  const [loading, setLoading] = useState(false);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return '#34C759';
      case 'prestado': return '#FF9500';
      case 'mantenimiento': return '#007AFF';
      case 'dañado': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'checkmark-circle';
      case 'prestado': return 'arrow-up-circle';
      case 'mantenimiento': return 'construct';
      case 'dañado': return 'warning';
      default: return 'help-circle';
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditItem', { item });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de eliminar el item ${item.serial}?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: confirmDelete }
      ]
    );
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await itemsAPI.delete(item.id);
      Alert.alert('Éxito', 'Item eliminado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al eliminar item');
    } finally {
      setLoading(false);
    }
  };

  const navigateToProducto = () => {
    if (item.producto) {
      navigation.navigate('ProductoDetail', { producto: item.producto });
    }
  };

  const navigateToUbicacion = () => {
    if (item.ubicacion) {
      navigation.navigate('ItemsPorUbicacion');
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
        
        <Text style={styles.title}>Detalle del Item</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={20} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={loading}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información Principal */}
        <View style={styles.section}>
          <View style={styles.serialHeader}>
            <Text style={styles.serialText}>{item.serial}</Text>
            <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
              <Ionicons 
                name={getEstadoIcon(item.estado)} 
                size={16} 
                color="white" 
                style={styles.estadoIcon}
              />
              <Text style={styles.estadoText}>{item.estado}</Text>
            </View>
          </View>
          
          {item.descripcion && (
            <Text style={styles.descripcion}>{item.descripcion}</Text>
          )}
        </View>

        {/* Información del Producto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Producto Asociado</Text>
          
          <TouchableOpacity 
            style={styles.productoCard}
            onPress={navigateToProducto}
          >
            {item.producto?.imagen_url ? (
              <Image 
                source={{ uri: item.producto.imagen_url }} 
                style={styles.productoImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.productoImagePlaceholder}>
                <Ionicons name="image-outline" size={32} color="#ccc" />
              </View>
            )}
            
            <View style={styles.productoInfo}>
              <Text style={styles.productoSku}>SKU: {item.producto?.sku}</Text>
              <Text style={styles.productoDescripcion}>{item.producto?.descripcion}</Text>
              
              <View style={styles.productoMeta}>
                {item.producto?.marca && (
                  <Text style={styles.productoMetaText}>Marca: {item.producto.marca}</Text>
                )}
                {item.producto?.categoria && (
                  <Text style={styles.productoMetaText}>Categoría: {item.producto.categoria}</Text>
                )}
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          
          <TouchableOpacity 
            style={styles.ubicacionCard}
            onPress={navigateToUbicacion}
          >
            <View style={styles.ubicacionIcon}>
              <Ionicons name="location" size={24} color="#5856D6" />
            </View>
            
            <View style={styles.ubicacionInfo}>
              <Text style={styles.ubicacionText}>
                {item.ubicacion?.rack}-{item.ubicacion?.fila}-{item.ubicacion?.columna}
              </Text>
              <Text style={styles.ubicacionSubtext}>
                Rack {item.ubicacion?.rack}, Fila {item.ubicacion?.fila}, Columna {item.ubicacion?.columna}
              </Text>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Historial de Movimientos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Movimientos</Text>
          
          <View style={styles.movimientosCard}>
            <View style={styles.movimientoRow}>
              <View style={styles.movimientoInfo}>
                <Ionicons name="arrow-down-circle" size={20} color="#34C759" />
                <Text style={styles.movimientoLabel}>Entradas (Check-in)</Text>
              </View>
              <Text style={styles.movimientoValue}>{item.cantidad_in}</Text>
            </View>
            
            <View style={styles.movimientoRow}>
              <View style={styles.movimientoInfo}>
                <Ionicons name="arrow-up-circle" size={20} color="#FF9500" />
                <Text style={styles.movimientoLabel}>Salidas (Check-out)</Text>
              </View>
              <Text style={styles.movimientoValue}>{item.cantidad_out}</Text>
            </View>
            
            <View style={[styles.movimientoRow, styles.movimientoTotal]}>
              <View style={styles.movimientoInfo}>
                <Ionicons name="calculator" size={20} color="#007AFF" />
                <Text style={styles.movimientoLabelTotal}>Total Movimientos</Text>
              </View>
              <Text style={styles.movimientoValueTotal}>
                {item.cantidad_in + item.cantidad_out}
              </Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editActionButton]}
              onPress={handleEdit}
            >
              <Ionicons name="pencil" size={20} color="#007AFF" />
              <Text style={[styles.actionButtonText, styles.editActionText]}>
                Editar Item
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteActionButton]}
              onPress={handleDelete}
              disabled={loading}
            >
              <Ionicons name="trash" size={20} color="#FF3B30" />
              <Text style={[styles.actionButtonText, styles.deleteActionText]}>
                {loading ? 'Eliminando...' : 'Eliminar Item'}
              </Text>
            </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
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
  serialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serialText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  estadoIcon: {
    marginRight: 6,
  },
  estadoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  descripcion: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  productoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
  },
  productoImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  productoImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productoInfo: {
    flex: 1,
  },
  productoSku: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productoDescripcion: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  productoMeta: {
    gap: 4,
  },
  productoMetaText: {
    fontSize: 12,
    color: '#666',
  },
  ubicacionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
  },
  ubicacionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5856D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  ubicacionInfo: {
    flex: 1,
  },
  ubicacionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ubicacionSubtext: {
    fontSize: 14,
    color: '#666',
  },
  movimientosCard: {
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
  movimientoTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 10,
    paddingTop: 15,
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
  movimientoLabelTotal: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  movimientoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  movimientoValueTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actionsContainer: {
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  editActionButton: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
  },
  deleteActionButton: {
    backgroundColor: '#fff5f5',
    borderColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  editActionText: {
    color: '#007AFF',
  },
  deleteActionText: {
    color: '#FF3B30',
  },
});
