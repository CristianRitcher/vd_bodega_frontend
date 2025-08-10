import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Record } from '../types';
import { inventariosAPI } from '../services/api';

export const RecordsScreen: React.FC = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await inventariosAPI.getAllRecords();
      setRecords(data);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredRecords = () => {
    if (filter === 'all') return records;
    return records.filter(record => record.tipo === filter);
  };

  const getRecordIcon = (tipo: string) => {
    switch (tipo) {
      case 'check_in':
        return { name: 'arrow-down-circle', color: '#34C759' };
      case 'check_out':
        return { name: 'arrow-up-circle', color: '#FF9500' };
      case 'eliminado':
        return { name: 'trash', color: '#FF3B30' };
      case 'inventario':
        return { name: 'clipboard', color: '#007AFF' };
      case 'movimiento':
        return { name: 'swap-horizontal', color: '#007AFF' };
      default:
        return { name: 'document', color: '#666' };
    }
  };

  const getRecordTitle = (tipo: string) => {
    switch (tipo) {
      case 'check_in':
        return 'Check-in';
      case 'check_out':
        return 'Check-out';
      case 'eliminado':
        return 'Eliminación';
      case 'inventario':
        return 'Inventario';
      case 'movimiento':
        return 'Movimiento';
      default:
        return 'Registro';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRecord = ({ item }: { item: Record }) => {
    const icon = getRecordIcon(item.tipo);
    const title = getRecordTitle(item.tipo);

    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordIconContainer}>
            <Ionicons name={icon.name as any} size={24} color={icon.color} />
          </View>
          
          <View style={styles.recordInfo}>
            <Text style={styles.recordTitle}>{title}</Text>
            <Text style={styles.recordDate}>{formatDate(item.hora)}</Text>
          </View>
        </View>
        
        <Text style={styles.recordResponsable}>
          Responsable: {item.responsable}
        </Text>
        
        {item.razon && (
          <Text style={styles.recordRazon}>
            Razón: {item.razon}
          </Text>
        )}
        
        {item.ubicacion && (
          <Text style={styles.recordUbicacion}>
            Ubicación: {item.ubicacion.rack}-{item.ubicacion.fila}-{item.ubicacion.columna}
          </Text>
        )}
        
        {item.tipo === 'movimiento' && item.ubicacionOrigen && item.ubicacionDestino && (
          <View style={styles.movimientoInfo}>
            <Text style={styles.recordUbicacion}>
              De: {item.ubicacionOrigen.rack}-{item.ubicacionOrigen.fila}-{item.ubicacionOrigen.columna}
            </Text>
            <Text style={styles.recordUbicacion}>
              A: {item.ubicacionDestino.rack}-{item.ubicacionDestino.fila}-{item.ubicacionDestino.columna}
            </Text>
          </View>
        )}
        
        <Text style={styles.recordItems}>
          {item.lista.length} items procesados
        </Text>
        
        <View style={styles.recordItemsList}>
          {item.lista.slice(0, 3).map((listItem, index) => (
            <Text key={index} style={styles.recordItem}>
              • {listItem.serial} (Cant: {listItem.cantidad})
            </Text>
          ))}
          {item.lista.length > 3 && (
            <Text style={styles.recordItemsMore}>
              ... y {item.lista.length - 3} más
            </Text>
          )}
        </View>
      </View>
    );
  };

  const filterOptions = [
    { key: 'all', label: 'Todos', icon: 'list' },
    { key: 'check_in', label: 'Check-in', icon: 'arrow-down-circle' },
    { key: 'check_out', label: 'Check-out', icon: 'arrow-up-circle' },
    { key: 'inventario', label: 'Inventarios', icon: 'clipboard' },
    { key: 'eliminado', label: 'Eliminados', icon: 'trash' },
    { key: 'movimiento', label: 'Movimientos', icon: 'swap-horizontal' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Records</Text>
        <Text style={styles.subtitle}>Historial de movimientos y operaciones</Text>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={filterOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === item.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(item.key)}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={filter === item.key ? 'white' : '#007AFF'}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  filter === item.key && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <FlatList
        data={getFilteredRecords()}
        renderItem={renderRecord}
        keyExtractor={(item) => `${item.tipo}-${item.id}`}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadRecords} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay registros disponibles</Text>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
  },
  filterList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#007AFF',
    marginLeft: 5,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContainer: {
    padding: 20,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recordResponsable: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  recordRazon: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  recordUbicacion: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  movimientoInfo: {
    marginBottom: 5,
  },
  recordItems: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  recordItemsList: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
  },
  recordItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  recordItemsMore: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
});
