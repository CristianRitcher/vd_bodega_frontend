import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const CreateScreen: React.FC = () => {
  const navigation = useNavigation();

  const createOptions = [
    {
      id: 'producto',
      title: 'Crear Producto',
      description: 'Agregar un nuevo producto al inventario',
      icon: 'cube',
      color: '#007AFF',
      onPress: () => navigation.navigate('CreateProducto'),
    },
    {
      id: 'item',
      title: 'Crear Item',
      description: 'Agregar un nuevo item a un producto existente',
      icon: 'pricetag',
      color: '#34C759',
      onPress: () => navigation.navigate('CreateItem'),
    },
    {
      id: 'ubicacion',
      title: 'Crear Ubicación',
      description: 'Agregar una nueva ubicación en la bodega',
      icon: 'location',
      color: '#FF9500',
      onPress: () => navigation.navigate('CreateUbicacion'),
    },
  ];

  const renderOption = (option: typeof createOptions[0]) => (
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crear Nuevo</Text>
        <Text style={styles.subtitle}>Selecciona qué deseas crear</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {createOptions.map(renderOption)}
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
    padding: 20,
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
});
