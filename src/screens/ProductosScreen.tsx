import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Producto } from '../types';
import { productosAPI, itemsAPI } from '../services/api';
import { Scanner } from '../components/Scanner';
import { useAuth } from '../context/AuthContext';

export const ProductosScreen: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerType, setScannerType] = useState<'sku' | 'serial'>('sku');
  const navigation = useNavigation();
  const { logout } = useAuth();

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    setIsLoading(true);
    try {
      const data = await productosAPI.getAll();
      setProductos(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProductos();
      return;
    }

    setIsLoading(true);
    try {
      const data = await productosAPI.getAll(searchQuery.trim());
      setProductos(data);
    } catch (error) {
      Alert.alert('Error', 'Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanResult = async (data: string) => {
    setShowScanner(false);
    
    try {
      if (scannerType === 'sku') {
        // Buscar por SKU
        const producto = await productosAPI.getBySku(data);
        navigation.navigate('ProductoDetail', { producto });
      } else {
        // Buscar por serial - usar nueva funcionalidad
        navigation.navigate('BusquedaSerial');
        // Simular el escaneo en la nueva pantalla
        setTimeout(() => {
          navigation.setParams({ serialToSearch: data });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', `No se encontró ${scannerType === 'sku' ? 'producto' : 'item'} con código: ${data}`);
    }
  };

  const openScanner = (type: 'sku' | 'serial') => {
    if (type === 'serial') {
      // Navegar directamente a la nueva pantalla de búsqueda
      navigation.navigate('BusquedaSerial');
      return;
    }
    
    setScannerType(type);
    setShowScanner(true);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const renderProducto = ({ item }: { item: Producto }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductoDetail', { producto: item })}
    >
      <View style={styles.productImageContainer}>
        {item.imagen_url ? (
          <Image source={{ uri: item.imagen_url }} style={styles.productImage} />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="cube" size={40} color="#ccc" />
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productSku}>{item.sku}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.descripcion}
        </Text>
        <View style={styles.productStats}>
          <Text style={[styles.productStat, { color: '#34C759' }]}>Entradas: {item.cantidad_in_total}</Text>
          <Text style={[styles.productStat, { color: '#FF9500' }]}>Salidas: {item.cantidad_out_total}</Text>
          <Text style={[styles.productStat, { color: '#007AFF' }]}>Total: {item.cantidad_in_total + item.cantidad_out_total}</Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (showScanner) {
    return (
      <Scanner
        onScan={handleScanResult}
        onClose={() => setShowScanner(false)}
        title={`Escanear ${scannerType === 'sku' ? 'SKU' : 'Serial'}`}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Productos</Text>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              loadProductos();
            }}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.scannerButtons}>
          <TouchableOpacity
            style={styles.scannerButton}
            onPress={() => openScanner('sku')}
          >
            <Ionicons name="barcode" size={20} color="white" />
            <Text style={styles.scannerButtonText}>SKU</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.scannerButton, styles.scannerButtonSecondary]}
            onPress={() => openScanner('serial')}
          >
            <Ionicons name="qr-code" size={20} color="white" />
            <Text style={styles.scannerButtonText}>Serial</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={productos}
        renderItem={renderProducto}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadProductos} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  signOutButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  scannerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scannerButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.48,
  },
  scannerButtonSecondary: {
    backgroundColor: '#34C759',
  },
  scannerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  listContainer: {
    padding: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    marginRight: 15,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productSku: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 5,
  },
  productStat: {
    fontSize: 11,
    fontWeight: '500',
  },
});
