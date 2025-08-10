import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { UbicacionConItems } from '../types';
import { busquedaAPI } from '../services/api';
import { Scanner } from '../components/Scanner';

export const BusquedaSerialScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<UbicacionConItems[]>([]);
  const [serialBuscado, setSerialBuscado] = useState('');

  const handleScanResult = async (serial: string) => {
    setShowScanner(false);
    setSerialBuscado(serial);
    
    setLoading(true);
    try {
      const data = await busquedaAPI.buscarPorSerial(serial);
      setUbicaciones(data);
      
      if (data.length === 0) {
        Alert.alert('Sin resultados', `No se encontraron items con serial: ${serial}`);
      }
    } catch (error) {
      Alert.alert('Error', `Error al buscar serial: ${serial}`);
    } finally {
      setLoading(false);
    }
  };

  const openScanner = () => {
    setShowScanner(true);
  };

  const verItemsEnUbicacion = (ubicacion: UbicacionConItems) => {
    navigation.navigate('ItemsEnUbicacion', { 
      ubicacion,
      serial: serialBuscado,
    });
  };

  const renderUbicacion = ({ item }: { item: UbicacionConItems }) => (
    <TouchableOpacity
      style={styles.ubicacionCard}
      onPress={() => verItemsEnUbicacion(item)}
    >
      <View style={styles.ubicacionHeader}>
        <Text style={styles.ubicacionNombre}>{item.ubicacion_descripcion}</Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
      
      <View style={styles.ubicacionStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Items:</Text>
          <Text style={[styles.statValue, { color: '#007AFF' }]}>{item.total_items}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>In:</Text>
          <Text style={[styles.statValue, { color: '#34C759' }]}>{item.items_in}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Out:</Text>
          <Text style={[styles.statValue, { color: '#FF9500' }]}>{item.items_out}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (showScanner) {
    return (
      <Scanner
        onScan={handleScanResult}
        onClose={() => setShowScanner(false)}
        title="Buscar por Serial"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Buscar por Serial</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
          <Ionicons name="barcode" size={24} color="white" />
          <Text style={styles.scanButtonText}>Escanear Serial</Text>
        </TouchableOpacity>

        {serialBuscado ? (
          <Text style={styles.searchInfo}>
            Buscando: <Text style={styles.searchSerial}>{serialBuscado}</Text>
          </Text>
        ) : null}

        {ubicaciones.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              Ubicaciones con items ({ubicaciones.length})
            </Text>
            <FlatList
              data={ubicaciones}
              keyExtractor={(item) => item.ubicacion_id.toString()}
              renderItem={renderUbicacion}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {!serialBuscado && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Escanea un serial para comenzar</Text>
          </View>
        )}
      </View>
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
  scanButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  searchInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchSerial: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  ubicacionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ubicacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ubicacionNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ubicacionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});
