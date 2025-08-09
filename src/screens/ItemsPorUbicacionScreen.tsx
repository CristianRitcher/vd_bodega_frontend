import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ubicacionesAPI, itemsAPI } from '../services/api';
import { Ubicacion, ItemProducto } from '../types';

interface ItemConProducto extends ItemProducto {
  producto: {
    sku: string;
    descripcion: string;
    marca?: string;
    categoria?: string;
  };
}

interface UbicacionConItems extends Ubicacion {
  items: ItemConProducto[];
  totalItems: number;
}

export const ItemsPorUbicacionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<UbicacionConItems[]>([]);
  const [filteredUbicaciones, setFilteredUbicaciones] = useState<UbicacionConItems[]>([]);
  const [searchText, setSearchText] = useState('');
  const [expandedUbicacion, setExpandedUbicacion] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'with-items' | 'empty'>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUbicaciones();
  }, [searchText, ubicaciones, filterType]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar todas las ubicaciones
      const ubicacionesData = await ubicacionesAPI.getAll();
      
      // Para cada ubicación, cargar sus items
      const ubicacionesConItems: UbicacionConItems[] = await Promise.all(
        ubicacionesData.map(async (ubicacion) => {
          try {
            const items = await itemsAPI.getByUbicacion(ubicacion.id);
            return {
              ...ubicacion,
              items: items || [],
              totalItems: items?.length || 0,
            };
          } catch (error) {
            // Si no hay items o hay error, devolver ubicación vacía
            return {
              ...ubicacion,
              items: [],
              totalItems: 0,
            };
          }
        })
      );

      // Ordenar por rack, fila, columna
      ubicacionesConItems.sort((a, b) => {
        if (a.rack !== b.rack) return a.rack.localeCompare(b.rack);
        if (a.fila !== b.fila) return a.fila.localeCompare(b.fila);
        return a.columna.localeCompare(b.columna);
      });

      setUbicaciones(ubicacionesConItems);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterUbicaciones = () => {
    let filtered = ubicaciones;

    // Filtrar por tipo
    switch (filterType) {
      case 'with-items':
        filtered = filtered.filter(u => u.totalItems > 0);
        break;
      case 'empty':
        filtered = filtered.filter(u => u.totalItems === 0);
        break;
      default:
        // 'all' - no filtrar
        break;
    }

    // Filtrar por texto de búsqueda
    if (searchText.trim()) {
      const search = searchText.toLowerCase().trim();
      filtered = filtered.filter(ubicacion => {
        const ubicacionText = `${ubicacion.rack}-${ubicacion.fila}-${ubicacion.columna}`.toLowerCase();
        const hasUbicacionMatch = ubicacionText.includes(search);
        
        const hasItemMatch = ubicacion.items.some(item => 
          item.serial.toLowerCase().includes(search) ||
          item.producto.sku.toLowerCase().includes(search) ||
          item.producto.descripcion.toLowerCase().includes(search) ||
          item.producto.marca?.toLowerCase().includes(search) ||
          item.producto.categoria?.toLowerCase().includes(search)
        );

        return hasUbicacionMatch || hasItemMatch;
      });
    }

    setFilteredUbicaciones(filtered);
  };

  const toggleExpanded = (ubicacionId: number) => {
    setExpandedUbicacion(expandedUbicacion === ubicacionId ? null : ubicacionId);
  };

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

  const getTotalStats = () => {
    const totalUbicaciones = filteredUbicaciones.length;
    const ubicacionesConItems = filteredUbicaciones.filter(u => u.totalItems > 0).length;
    const totalItems = filteredUbicaciones.reduce((sum, u) => sum + u.totalItems, 0);
    
    return { totalUbicaciones, ubicacionesConItems, totalItems };
  };

  const renderItem = ({ item }: { item: ItemConProducto }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemSerial}>{item.serial}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
          <Ionicons 
            name={getEstadoIcon(item.estado)} 
            size={12} 
            color="white" 
            style={styles.estadoIcon}
          />
          <Text style={styles.estadoText}>{item.estado}</Text>
        </View>
      </View>
      
      <Text style={styles.itemSku}>SKU: {item.producto.sku}</Text>
      <Text style={styles.itemDescripcion}>{item.producto.descripcion}</Text>
      
      {item.descripcion && item.descripcion !== item.producto.descripcion && (
        <Text style={styles.itemDescripcionExtra}>Nota: {item.descripcion}</Text>
      )}
      
      {/* Mostrar entradas y salidas por separado */}
      <View style={styles.movimientosContainer}>
        <View style={styles.movimientoItem}>
          <Ionicons name="arrow-down-circle" size={14} color="#34C759" />
          <Text style={styles.movimientoText}>Entradas: {item.cantidad_in}</Text>
        </View>
        <View style={styles.movimientoItem}>
          <Ionicons name="arrow-up-circle" size={14} color="#FF9500" />
          <Text style={styles.movimientoText}>Salidas: {item.cantidad_out}</Text>
        </View>
      </View>
      
      {(item.producto.marca || item.producto.categoria) && (
        <View style={styles.itemMeta}>
          {item.producto.marca && (
            <Text style={styles.itemMetaText}>Marca: {item.producto.marca}</Text>
          )}
          {item.producto.categoria && (
            <Text style={styles.itemMetaText}>Categoría: {item.producto.categoria}</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderUbicacion = ({ item: ubicacion }: { item: UbicacionConItems }) => {
    const isExpanded = expandedUbicacion === ubicacion.id;
    const isEmpty = ubicacion.totalItems === 0;

    return (
      <View style={styles.ubicacionCard}>
        <TouchableOpacity
          style={styles.ubicacionHeader}
          onPress={() => toggleExpanded(ubicacion.id)}
        >
          <View style={styles.ubicacionInfo}>
            <Text style={styles.ubicacionTitle}>
              {ubicacion.rack}-{ubicacion.fila}-{ubicacion.columna}
            </Text>
            <View style={styles.ubicacionStats}>
              <View style={[styles.itemCountBadge, isEmpty && styles.emptyBadge]}>
                <Ionicons 
                  name={isEmpty ? "archive-outline" : "archive"} 
                  size={14} 
                  color={isEmpty ? "#999" : "white"} 
                />
                <Text style={[styles.itemCountText, isEmpty && styles.emptyText]}>
                  {ubicacion.totalItems} items
                </Text>
              </View>
            </View>
          </View>
          
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.ubicacionContent}>
            {isEmpty ? (
              <View style={styles.emptyState}>
                <Ionicons name="archive-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>Ubicación vacía</Text>
                <Text style={styles.emptyStateSubtext}>
                  No hay items almacenados en esta ubicación
                </Text>
              </View>
            ) : (
              <FlatList
                data={ubicacion.items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  const stats = getTotalStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Items por Ubicación</Text>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalUbicaciones}</Text>
          <Text style={styles.statLabel}>Ubicaciones</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.ubicacionesConItems}</Text>
          <Text style={styles.statLabel}>Con Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
      </View>

      {/* Búsqueda y Filtros */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ubicación, SKU, serial..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'with-items' && styles.filterButtonActive]}
            onPress={() => setFilterType('with-items')}
          >
            <Text style={[styles.filterText, filterType === 'with-items' && styles.filterTextActive]}>
              Con Items
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'empty' && styles.filterButtonActive]}
            onPress={() => setFilterType('empty')}
          >
            <Text style={[styles.filterText, filterType === 'empty' && styles.filterTextActive]}>
              Vacías
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Lista de Ubicaciones */}
      <FlatList
        data={filteredUbicaciones}
        renderItem={renderUbicacion}
        keyExtractor={(item) => item.id.toString()}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Ionicons name="location-outline" size={64} color="#ccc" />
            <Text style={styles.emptyListText}>
              {loading ? 'Cargando ubicaciones...' : 'No se encontraron ubicaciones'}
            </Text>
            {!loading && searchText && (
              <Text style={styles.emptyListSubtext}>
                Intenta con otro término de búsqueda
              </Text>
            )}
          </View>
        }
      />
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
  refreshButton: {
    padding: 5,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
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
  searchSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  ubicacionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ubicacionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  ubicacionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ubicacionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ubicacionStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCountBadge: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyBadge: {
    backgroundColor: '#f0f0f0',
  },
  itemCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyText: {
    color: '#999',
  },
  ubicacionContent: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 15,
  },
  itemCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemSerial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoIcon: {
    marginRight: 4,
  },
  estadoText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  itemSku: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDescripcion: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  itemDescripcionExtra: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  movimientosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  movimientoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  movimientoText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginLeft: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemMetaText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyListText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    fontWeight: '500',
  },
  emptyListSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
});
