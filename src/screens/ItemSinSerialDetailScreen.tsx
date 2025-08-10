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
import { ItemSinSerial } from '../types';
import { itemsSinSerialAPI } from '../services/api';

interface RouteParams {
  item: ItemSinSerial;
}

export const ItemSinSerialDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    navigation.navigate('EditItemSinSerial', { item });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar este item sin serial?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: confirmarEliminacion },
      ]
    );
  };

  const confirmarEliminacion = async () => {
    setLoading(true);
    try {
      await itemsSinSerialAPI.delete(item.id);
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
        <Text style={styles.title}>Item Sin Serial</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Información Principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Principal</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo:</Text>
              <Text style={styles.infoValue}>Sin Serial</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cantidad In:</Text>
              <View style={styles.quantityContainer}>
                <Ionicons name="arrow-down-circle" size={16} color="#34C759" />
                <Text style={[styles.quantityText, { color: '#34C759' }]}>
                  {item.cantidad_in}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cantidad Out:</Text>
              <View style={styles.quantityContainer}>
                <Ionicons name="arrow-up-circle" size={16} color="#FF9500" />
                <Text style={[styles.quantityText, { color: '#FF9500' }]}>
                  {item.cantidad_out}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total:</Text>
              <Text style={[styles.infoValue, { color: '#007AFF', fontWeight: 'bold' }]}>
                {item.cantidad_in + item.cantidad_out}
              </Text>
            </View>
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
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
