import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MultipleScannerProps {
  onCodesChange: (codes: string[]) => void;
  placeholder?: string;
  title?: string;
  initialCodes?: string[];
  autoFocus?: boolean;
  delayMs?: number; // Delay en milisegundos para agregar nueva línea automáticamente
}

export const MultipleScanner: React.FC<MultipleScannerProps> = ({
  onCodesChange,
  placeholder = "Escanear código...",
  title = "Códigos Escaneados",
  initialCodes = [],
  autoFocus = true,
  delayMs = 500, // 0.5 segundos por defecto
}) => {
  const [codes, setCodes] = useState<string[]>(initialCodes.length > 0 ? initialCodes : ['']);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Usar useCallback para evitar re-renders innecesarios del useEffect
  const stableOnCodesChange = useCallback((validCodes: string[]) => {
    onCodesChange(validCodes);
  }, [onCodesChange]);

  useEffect(() => {
    // Notificar cambios al componente padre solo cuando los códigos válidos cambien
    const validCodes = codes.filter(code => code.trim() !== '');
    stableOnCodesChange(validCodes);
  }, [codes, stableOnCodesChange]);

  const addNewLine = useCallback(() => {
    setCodes(prevCodes => {
      const newCodes = [...prevCodes, ''];
      
      // Enfocar en el nuevo input después de un pequeño delay
      setTimeout(() => {
        const newIndex = newCodes.length - 1;
        if (inputRefs.current[newIndex]) {
          inputRefs.current[newIndex]?.focus();
          setFocusedIndex(newIndex);
        }
      }, 100);
      
      return newCodes;
    });
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const newCodes = [...codes];
    newCodes[index] = text;
    setCodes(newCodes);

    // Limpiar timeout anterior siempre
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Si hay texto y es el último input, preparar para agregar nueva línea automáticamente
    if (text.trim() !== '' && index === codes.length - 1) {
      timeoutRef.current = setTimeout(() => {
        addNewLine();
      }, delayMs);
    }
  };

  const removeLine = (index: number) => {
    if (codes.length === 1) {
      // Si solo hay una línea, limpiarla en lugar de eliminarla
      setCodes(['']);
      return;
    }

    const newCodes = codes.filter((_, i) => i !== index);
    setCodes(newCodes);

    // Ajustar el foco si es necesario
    if (focusedIndex >= newCodes.length) {
      const newFocusIndex = Math.max(0, newCodes.length - 1);
      setFocusedIndex(newFocusIndex);
      setTimeout(() => {
        inputRefs.current[newFocusIndex]?.focus();
      }, 100);
    }
  };

  const clearAll = () => {
    Alert.alert(
      'Limpiar Todo',
      '¿Estás seguro de que quieres limpiar todos los códigos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            setCodes(['']);
            setFocusedIndex(0);
            setTimeout(() => {
              inputRefs.current[0]?.focus();
            }, 100);
          },
        },
      ]
    );
  };

  const getValidCodesCount = () => {
    return codes.filter(code => code.trim() !== '').length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {title} ({getValidCodesCount()})
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={addNewLine}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
          {getValidCodesCount() > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAll}
            >
              <Ionicons name="trash" size={16} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {codes.map((code, index) => (
          <View key={index} style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.lineNumber}>{index + 1}.</Text>
              <TextInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.input,
                  focusedIndex === index && styles.inputFocused,
                  code.trim() !== '' && styles.inputWithValue,
                ]}
                value={code}
                onChangeText={(text) => handleCodeChange(text, index)}
                placeholder={placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={autoFocus && index === 0}
                onFocus={() => setFocusedIndex(index)}
                returnKeyType="next"
                onSubmitEditing={() => {
                  // Cancelar timeout automático si el usuario presiona Enter manualmente
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                  }
                  
                  if (index === codes.length - 1) {
                    addNewLine();
                  } else {
                    inputRefs.current[index + 1]?.focus();
                  }
                }}
              />
              {codes.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeLine(index)}
                >
                  <Ionicons name="close" size={18} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {getValidCodesCount() > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Tip: Escanea códigos consecutivamente. Se agregará una nueva línea automáticamente después de {delayMs}ms
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginVertical: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  lineNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginRight: 8,
    minWidth: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  inputFocused: {
    borderColor: '#007AFF',
  },
  inputWithValue: {
    color: '#007AFF',
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});
