import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ItemConSerial, UbicacionConItems } from '../types';

interface RouteParams {
  ubicacion: UbicacionConItems;
  serial: string;
}

export const ItemsEnUbicacionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ubicacion, serial } = route.params as RouteParams;

  const renderItem = ({ item }: { item: ItemConSerial }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => navigation.navigate('ItemConSerialDetail', { item })}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemSerial}>{item.serial}</Text>
        <View style={styles.checkBadge}>
          <Text style={[
            styles.checkText,
            { color: item.check === 'in' ? '#34C759' : '#FF9500' }
          ]}>
            {item.check.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.itemDescripcion}>
        {item.descripcion || 'Sin descripción'}
      </Text>
      
      <View style={styles.itemFooter}>
        <View style={styles.estadoBadge}>
          <Text style={styles.estadoText}>{item.estado}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{ubicacion.ubicacion_descripcion}</Text>
          <Text style={styles.subtitle}>Serial: {serial}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{ubicacion.total_items}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#34C759' }]}>{ubicacion.items_in}</Text>
          <Text style={styles.statLabel}>In</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#FF9500' }]}>{ubicacion.items_out}</Text>
          <Text style={styles.statLabel}>Out</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Items en esta ubicación</Text>
        <FlatList
          data={ubicacion.items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
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
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemSerial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  checkBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  checkText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e8f4fd',
  },
  estadoText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});
