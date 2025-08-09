import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { inventariosAPI, itemsAPI } from '../services/api';
import { ItemInventario } from '../types';
import { Scanner } from '../components/Scanner';
import { useAuth } from '../context/AuthContext';

export const CheckOutScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [items, setItems] = useState<ItemInventario[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [tempCantidad, setTempCantidad] = useState('');

  const handleScan = async (serial: string) => {
    setShowScanner(false);
    
    try {
      // Verificar si el item existe
      await itemsAPI.getBySerial(serial);
      
      // Verificar si ya está en la lista
      const existingIndex = items.findIndex(item => item.serial === serial);
      if (existingIndex >= 0) {
        // Si ya existe, incrementar cantidad
        const updatedItems = [...items];
        updatedItems[existingIndex].cantidad += 1;
        setItems(updatedItems);
        Alert.alert('Item actualizado', `Cantidad incrementada para ${serial}`);
      } else {
        // Si no existe, agregar nuevo
        const newItem: ItemInventario = {
          serial,
          cantidad: 1,
        };
        setItems(prev => [...prev, newItem]);
        Alert.alert('Item agregado', `${serial} agregado al check-out`);
      }
    } catch (error) {
      Alert.alert('Error', `No se encontró el item con serial: ${serial}`);
    }
  };

  const updateCantidad = (index: number, nuevaCantidad: string) => {
    const cantidad = parseInt(nuevaCantidad) || 0;
    if (cantidad < 0) return;
    
    const updatedItems = [...items];
    updatedItems[index].cantidad = cantidad;
    setItems(updatedItems);
    setEditingItem(null);
  };

  const removeItem = (index: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Deseas eliminar este item del check-out?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          const updatedItems = items.filter((_, i) => i !== index);
          setItems(updatedItems);
        }}
      ]
    );
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Agrega al menos un item al check-out');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    setLoading(true);
    try {
      await inventariosAPI.createCheckOut({
        responsable: user.nombre,
        lista: items,
      });
      
      Alert.alert('Éxito', 'Check-out registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al registrar check-out');
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.cantidad, 0);
  };

  const renderItem = ({ item, index }: { item: ItemInventario; index: number }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemSerial}>{item.serial}</Text>
        
        {editingItem === index ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={tempCantidad}
              onChangeText={setTempCantidad}
              keyboardType="numeric"
              autoFocus
              onBlur={() => {
                updateCantidad(index, tempCantidad);
                setEditingItem(null);
              }}
              onSubmitEditing={() => {
                updateCantidad(index, tempCantidad);
              }}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.cantidadContainer}
            onPress={() => {
              setEditingItem(index);
              setTempCantidad(item.cantidad.toString());
            }}
          >
            <Text style={styles.cantidadLabel}>Cantidad:</Text>
            <Text style={styles.cantidadValue}>{item.cantidad}</Text>
            <Ionicons name="pencil" size={16} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(index)}
      >
        <Ionicons name="trash" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  if (showScanner) {
    return (
      <Scanner
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
        title="Escanear Item para Check-out"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Check-out</Text>
        
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || items.length === 0}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Registrando...' : 'Registrar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="arrow-up-circle" size={32} color="#FF9500" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Registro de Salida</Text>
              <Text style={styles.infoText}>
                Registra la salida de herramientas de la bodega. 
                Esto reducirá las cantidades disponibles.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Items para Check-out ({items.length})
            </Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalText}>Total: {getTotalItems()}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setShowScanner(true)}
          >
            <Ionicons name="barcode" size={24} color="white" />
            <Text style={styles.scanButtonText}>Escanear Item</Text>
          </TouchableOpacity>

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="arrow-up-circle-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No hay items para check-out</Text>
              <Text style={styles.emptySubtext}>
                Escanea o agrega items para registrar su salida
              </Text>
            </View>
          ) : (
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.serial}-${index}`}
              scrollEnabled={false}
              style={styles.itemsList}
            />
          )}
        </View>

        <View style={styles.warningSection}>
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={24} color="#FF9500" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Importante</Text>
              <Text style={styles.warningText}>
                Asegúrate de que los items estén siendo prestados o utilizados. 
                Este registro afectará las cantidades disponibles en inventario.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Instrucciones:</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>
              • Escanea cada item que sale de la bodega
            </Text>
            <Text style={styles.instructionItem}>
              • Ajusta las cantidades si es necesario
            </Text>
            <Text style={styles.instructionItem}>
              • Verifica que todos los items estén incluidos
            </Text>
            <Text style={styles.instructionItem}>
              • Registra el check-out para actualizar inventario
            </Text>
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
  saveButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  totalText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  itemsList: {
    maxHeight: 300,
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
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cantidadLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  cantidadValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
    marginRight: 8,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    marginLeft: 10,
  },
  warningSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningContent: {
    flex: 1,
    marginLeft: 15,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  instructionsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
