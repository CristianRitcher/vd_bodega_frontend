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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ubicacion } from '../types';
import { inventariosAPI } from '../services/api';
import { Scanner } from '../components/Scanner';
import { useAuth } from '../context/AuthContext';

interface RouteParams {
  ubicacion: Ubicacion;
}

export const NewCheckInScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { ubicacion } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [seriales, setSeriales] = useState<string[]>([]);

  const handleScan = (serial: string) => {
    setShowScanner(false);
    
    // Agregar serial a la lista (permite duplicados)
    setSeriales(prev => [...prev, serial]);
  };

  const removeSerial = (index: number) => {
    setSeriales(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (seriales.length === 0) {
      Alert.alert('Error', 'Escanea al menos un serial');
      return;
    }

    setLoading(true);
    try {
      await inventariosAPI.createCheckIn({
        responsable: user?.nombre || 'Usuario',
        seriales,
        ubicacion_id: ubicacion.id,
      });

      Alert.alert('Éxito', `Check-in completado para ${seriales.length} items`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar el check-in');
    } finally {
      setLoading(false);
    }
  };

  const renderSerial = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.serialItem}>
      <Text style={styles.serialText}>{item}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeSerial(index)}
      >
        <Ionicons name="close-circle" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  if (showScanner) {
    return (
      <Scanner
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
        title="Escanear para Check-In"
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
        <Text style={styles.title}>Check-In</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.ubicacionInfo}>
          <Text style={styles.ubicacionLabel}>Ubicación:</Text>
          <Text style={styles.ubicacionNombre}>{ubicacion.descripcion}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seriales Escaneados ({seriales.length})</Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setShowScanner(true)}
            >
              <Ionicons name="barcode" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {seriales.length > 0 ? (
            <FlatList
              data={seriales}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderSerial}
              style={styles.serialesList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="barcode-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Escanea seriales para comenzar</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, seriales.length === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || seriales.length === 0}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Procesando...' : `Hacer Check-In (${seriales.length})`}
          </Text>
        </TouchableOpacity>
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
  ubicacionInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ubicacionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ubicacionNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  section: {
    flex: 1,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
  },
  serialesList: {
    flex: 1,
  },
  serialItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serialText: {
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
