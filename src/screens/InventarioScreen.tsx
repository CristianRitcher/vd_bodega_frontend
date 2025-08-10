import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Inventario } from '../types';
import { inventariosAPI } from '../services/api';

export const InventarioScreen: React.FC = () => {
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadInventarios();
  }, []);

  const loadInventarios = async () => {
    setIsLoading(true);
    try {
      const data = await inventariosAPI.getInventarios();
      setInventarios(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los inventarios');
    } finally {
      setIsLoading(false);
    }
  };

  const inventoryOptions = [
    {
      id: 'nuevo',
      title: 'Nuevo Inventario',
      description: 'Realizar inventario de una ubicación específica',
      icon: 'add-circle',
      color: '#007AFF',
      onPress: () => navigation.navigate('NuevoInventario'),
    },
    {
      id: 'ubicaciones',
      title: 'Items por Ubicación',
      description: 'Ver qué items están en cada ubicación',
      icon: 'location',
      color: '#5856D6',
      onPress: () => navigation.navigate('ItemsPorUbicacion'),
    },
    {
      id: 'checkin',
      title: 'Check-In',
      description: 'Registrar entrada de herramientas',
      icon: 'arrow-down-circle',
      color: '#34C759',
      onPress: () => navigation.navigate('SeleccionarUbicacion', { 
        accion: 'NewCheckIn', 
        titulo: 'Seleccionar Ubicación - Check-In' 
      }),
    },
    {
      id: 'checkout',
      title: 'Check-Out',
      description: 'Registrar salida de herramientas',
      icon: 'arrow-up-circle',
      color: '#FF9500',
      onPress: () => navigation.navigate('SeleccionarUbicacion', { 
        accion: 'NewCheckOut', 
        titulo: 'Seleccionar Ubicación - Check-Out' 
      }),
    },
    {
      id: 'eliminar',
      title: 'Eliminar Items',
      description: 'Registrar eliminación de herramientas',
      icon: 'trash',
      color: '#FF3B30',
      onPress: () => navigation.navigate('SeleccionarUbicacion', { 
        accion: 'NewEliminarItems', 
        titulo: 'Seleccionar Ubicación - Eliminar' 
      }),
    },
    {
      id: 'mover',
      title: 'Mover Items',
      description: 'Cambiar items entre ubicaciones',
      icon: 'swap-horizontal',
      color: '#007AFF',
      onPress: () => navigation.navigate('SeleccionarUbicacionesMover'),
    },
  ];

  const renderOption = (option: typeof inventoryOptions[0]) => (
    <TouchableOpacity
      key={option.id}
      style={[styles.optionCard, { borderLeftColor: option.color }]}
      onPress={option.onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
        <Ionicons name={option.icon as any} size={30} color="white" />
      </View>
      
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{option.title}</Text>
        <Text style={styles.optionDescription}>{option.description}</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderInventario = ({ item }: { item: Inventario }) => (
    <TouchableOpacity
      style={styles.inventarioCard}
      onPress={() => navigation.navigate('InventarioDetail', { inventario: item })}
    >
      <View style={styles.inventarioHeader}>
        <Text style={styles.inventarioTitle}>
          {item.ubicacion?.rack}-{item.ubicacion?.fila}-{item.ubicacion?.columna}
        </Text>
        <Text style={styles.inventarioDate}>
          {new Date(item.hora).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.inventarioResponsable}>
        Responsable: {item.responsable}
      </Text>
      
      <Text style={styles.inventarioItems}>
        {item.lista.length} items inventariados
      </Text>
      
      <View style={styles.inventarioActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye" size={16} color="#007AFF" />
          <Text style={styles.actionButtonText}>Ver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="print" size={16} color="#007AFF" />
          <Text style={styles.actionButtonText}>Imprimir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventario</Text>
        <Text style={styles.subtitle}>Gestión de inventarios y movimientos</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          {inventoryOptions.map(renderOption)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventarios Recientes</Text>
          
          <FlatList
            data={inventarios.slice(0, 5)} // Mostrar solo los 5 más recientes
            renderItem={renderInventario}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={loadInventarios} />
            }
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay inventarios registrados</Text>
            }
          />
          
          {inventarios.length > 5 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('TodosInventarios')}
            >
              <Text style={styles.viewAllButtonText}>Ver todos los inventarios</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          )}
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
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  inventarioCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inventarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inventarioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  inventarioDate: {
    fontSize: 14,
    color: '#666',
  },
  inventarioResponsable: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  inventarioItems: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 10,
  },
  inventarioActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  actionButtonText: {
    color: '#007AFF',
    marginLeft: 5,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 10,
  },
  viewAllButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 5,
  },
});
