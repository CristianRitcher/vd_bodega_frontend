import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ScannerFallbackProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
}

export const ScannerFallback: React.FC<ScannerFallbackProps> = ({ 
  onScan, 
  onClose, 
  title = 'Escanear Código' 
}) => {
  const [manualInput, setManualInput] = useState('');

  const handleManualScan = () => {
    if (!manualInput.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código');
      return;
    }
    onScan(manualInput.trim());
  };

  const handleQuickScan = (code: string) => {
    onScan(code);
  };

  // Códigos de ejemplo para testing
  const exampleCodes = [
    'TALADRO001',
    'DESTORNILLADOR001',
    'TALADRO001-001',
    'DESTORNILLADOR001-001',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.fallbackMessage}>
          <Ionicons name="camera-outline" size={64} color="#666" />
          <Text style={styles.fallbackTitle}>Scanner no disponible</Text>
          <Text style={styles.fallbackText}>
            El scanner de cámara requiere un development build.{'\n'}
            Puedes ingresar códigos manualmente o usar los ejemplos.
          </Text>
        </View>

        <View style={styles.manualInput}>
          <Text style={styles.sectionTitle}>Ingreso Manual</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa SKU o Serial"
            value={manualInput}
            onChangeText={setManualInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.scanButton} onPress={handleManualScan}>
            <Text style={styles.scanButtonText}>Simular Escaneo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.examples}>
          <Text style={styles.sectionTitle}>Códigos de Ejemplo</Text>
          {exampleCodes.map((code, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exampleButton}
              onPress={() => handleQuickScan(code)}
            >
              <Text style={styles.exampleButtonText}>{code}</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buildInfo}>
          <Text style={styles.buildInfoText}>
            💡 Para usar el scanner real, ejecuta:{'\n'}
            <Text style={styles.buildCommand}>npx expo run:android</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  fallbackMessage: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    marginBottom: 20,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  fallbackText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  manualInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  examples: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  exampleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  exampleButtonText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  buildInfo: {
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  buildInfoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  buildCommand: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
