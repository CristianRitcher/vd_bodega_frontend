import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { ProductosScreen } from '../screens/ProductosScreen';
import { CreateScreen } from '../screens/CreateScreen';
import { InventarioScreen } from '../screens/InventarioScreen';
import { RecordsScreen } from '../screens/RecordsScreen';
import { CreateProductoScreen } from '../screens/CreateProductoScreen';
import { CreateItemScreen } from '../screens/CreateItemScreen';
import { CreateUbicacionScreen } from '../screens/CreateUbicacionScreen';
import { ProductoDetailScreen } from '../screens/ProductoDetailScreen';
import { NuevoInventarioScreen } from '../screens/NuevoInventarioScreen';
import { CheckInScreen } from '../screens/CheckInScreen';
import { CheckOutScreen } from '../screens/CheckOutScreen';
import { EliminarItemsScreen } from '../screens/EliminarItemsScreen';
import { ItemsPorUbicacionScreen } from '../screens/ItemsPorUbicacionScreen';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';
import { EditProductoScreen } from '../screens/EditProductoScreen';
import { EditItemScreen } from '../screens/EditItemScreen';
import { BusquedaSerialScreen } from '../screens/BusquedaSerialScreen';
import { ItemsEnUbicacionScreen } from '../screens/ItemsEnUbicacionScreen';
import { CreateItemConSerialScreen } from '../screens/CreateItemConSerialScreen';
import { CreateItemSinSerialScreen } from '../screens/CreateItemSinSerialScreen';
import { SeleccionarUbicacionesMoverScreen } from '../screens/SeleccionarUbicacionesMoverScreen';
import { MoverItemsScreen } from '../screens/MoverItemsScreen';
import { ItemConSerialDetailScreen } from '../screens/ItemConSerialDetailScreen';
import { ItemSinSerialDetailScreen } from '../screens/ItemSinSerialDetailScreen';
import { SeleccionarUbicacionScreen } from '../screens/SeleccionarUbicacionScreen';
import { NewCheckInScreen } from '../screens/NewCheckInScreen';
import { NewCheckOutScreen } from '../screens/NewCheckOutScreen';
import { NewEliminarItemsScreen } from '../screens/NewEliminarItemsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="CreateProducto" component={CreateProductoScreen} />
      <Stack.Screen name="CreateItem" component={CreateItemScreen} />
      <Stack.Screen name="CreateUbicacion" component={CreateUbicacionScreen} />
      <Stack.Screen name="ProductoDetail" component={ProductoDetailScreen} />
      <Stack.Screen name="NuevoInventario" component={NuevoInventarioScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="CheckOut" component={CheckOutScreen} />
      <Stack.Screen name="EliminarItems" component={EliminarItemsScreen} />
      <Stack.Screen name="ItemsPorUbicacion" component={ItemsPorUbicacionScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="EditProducto" component={EditProductoScreen} />
      <Stack.Screen name="EditItem" component={EditItemScreen} />
      <Stack.Screen name="BusquedaSerial" component={BusquedaSerialScreen} />
      <Stack.Screen name="ItemsEnUbicacion" component={ItemsEnUbicacionScreen} />
      <Stack.Screen name="CreateItemConSerial" component={CreateItemConSerialScreen} />
      <Stack.Screen name="CreateItemSinSerial" component={CreateItemSinSerialScreen} />
      <Stack.Screen name="SeleccionarUbicacion" component={SeleccionarUbicacionScreen} />
      <Stack.Screen name="NewCheckIn" component={NewCheckInScreen} />
      <Stack.Screen name="NewCheckOut" component={NewCheckOutScreen} />
      <Stack.Screen name="NewEliminarItems" component={NewEliminarItemsScreen} />
      <Stack.Screen name="SeleccionarUbicacionesMover" component={SeleccionarUbicacionesMoverScreen} />
      <Stack.Screen name="MoverItems" component={MoverItemsScreen} />
      <Stack.Screen name="ItemConSerialDetail" component={ItemConSerialDetailScreen} />
      <Stack.Screen name="ItemSinSerialDetail" component={ItemSinSerialDetailScreen} />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Productos') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Crear') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Inventario') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Records') {
            iconName = focused ? 'list' : 'list-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Productos" component={ProductosScreen} />
      <Tab.Screen name="Crear" component={CreateScreen} />
      <Tab.Screen name="Inventario" component={InventarioScreen} />
      <Tab.Screen name="Records" component={RecordsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Podrías mostrar un splash screen aquí
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
