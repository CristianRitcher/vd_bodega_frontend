import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Producto, ItemProducto } from '../types';
import { itemsAPI, productosAPI } from '../services/api';


export const ProductoDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { producto: initialProducto } = route.params as { producto: Producto };
  
  const [producto, setProducto] = useState<Producto>(initialProducto);
  const [items, setItems] = useState<ItemProducto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await itemsAPI.getAll(undefined, producto.id);
      setItems(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProducto = () => {
    navigation.navigate('EditProducto', { producto });
  };

  const handleDeleteProducto = () => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: deleteProducto },
      ]
    );
  };

  const deleteProducto = async () => {
    try {
      await productosAPI.delete(producto.id);
      Alert.alert('Éxito', 'Producto eliminado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el producto');
    }
  };

  const renderItem = ({ item }: { item: ItemProducto }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => navigation.navigate('ItemDetail', { item })} 
    >
      <View style={styles.itemInfo}>
        <Text style={styles.itemSerial}>{item.serial}</Text>
        {item.descripcion && (
          <Text style={styles.itemDescription}>{item.descripcion}</Text>
        )}
        <View style={styles.itemDetails}>
          <Text style={[styles.itemStatus, { color: getStatusColor(item.estado) }]}>
            {item.estado.toUpperCase()}
          </Text>
          <Text style={styles.itemLocation}>
            {item.ubicacion?.rack}-{item.ubicacion?.fila}-{item.ubicacion?.columna}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return '#34C759';
      case 'prestado': return '#FF9500';
      case 'mantenimiento': return '#007AFF';
      case 'dañado': return '#FF3B30';
      default: return '#666';
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
        
        <Text style={styles.title}>Detalle Producto</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProducto}>
            <Ionicons name="pencil" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDeleteProducto}>
            <Ionicons name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.productCard}>
          <View style={styles.productHeader}>
            {producto.imagen_url ? (
              <Image source={{ uri: producto.imagen_url }} style={styles.productImage} />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Ionicons name="cube" size={60} color="#ccc" />
              </View>
            )}
            
            <View style={styles.productInfo}>
              <Text style={styles.productSku}>{producto.sku}</Text>
              <Text style={styles.productDescription}>{producto.descripcion}</Text>
            </View>
          </View>

          <View style={styles.productStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#34C759' }]}>{producto.cantidad_in_total}</Text>
              <Text style={styles.statLabel}>Entradas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF9500' }]}>{producto.cantidad_out_total}</Text>
              <Text style={styles.statLabel}>Salidas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#007AFF' }]}>{producto.cantidad_in_total + producto.cantidad_out_total}</Text>
              <Text style={styles.statLabel}>Total Movimientos</Text>
            </View>
          </View>

          <View style={styles.productDetails}>
            {producto.categoria && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Categoría:</Text>
                <Text style={styles.detailValue}>{producto.categoria}</Text>
              </View>
            )}
            {producto.marca && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Marca:</Text>
                <Text style={styles.detailValue}>{producto.marca}</Text>
              </View>
            )}
            {producto.proveedor && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Proveedor:</Text>
                <Text style={styles.detailValue}>{producto.proveedor}</Text>
              </View>
            )}
            {producto.material && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Material:</Text>
                <Text style={styles.detailValue}>{producto.material}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsTitle}>Items ({items.length})</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('CreateItem', { producto })}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay items registrados</Text>
            }
          />
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
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  productCard: {
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
  productHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  productImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productSku: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  productDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  itemsSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 5,
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemLocation: {
    fontSize: 12,
    color: '#007AFF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
  },
});
