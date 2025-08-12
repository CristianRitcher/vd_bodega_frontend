import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Usuario,
  Producto,
  ItemProducto,
  ItemConSerial,
  ItemSinSerial,
  UbicacionConItems,
  Ubicacion,
  Inventario,
  CheckIn,
  CheckOut,
  Eliminado,
  Movimiento,
  LoginCredentials,
  AuthResponse,
  Record,
  ItemInventario,
} from '../types';

// Configurar la URL base de la API
const API_BASE_URL_FALLBACK = 'http://192.168.0.207:3000'; // Cambiar por la IP de tu servidor

const api = axios.create({
  baseURL: process.env.API_BASE_URL || API_BASE_URL_FALLBACK,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autorización
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Aquí podrías navegar al login
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

export const productosAPI = {
  getAll: async (search?: string): Promise<Producto[]> => {
    const response = await api.get('/productos', { params: { search } });
    return response.data;
  },
  
  getById: async (id: number): Promise<Producto> => {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  },
  
  getBySku: async (sku: string): Promise<Producto> => {
    const response = await api.get(`/productos/sku/${sku}`);
    return response.data;
  },
  
  create: async (producto: Omit<Producto, 'id' | 'cantidad_total' | 'cantidad_in_total' | 'cantidad_out_total' | 'items'>): Promise<Producto> => {
    const response = await api.post('/productos', producto);
    return response.data;
  },
  
  update: async (id: number, producto: Partial<Producto>): Promise<Producto> => {
    const response = await api.patch(`/productos/${id}`, producto);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/productos/${id}`);
  },
};

export const itemsAPI = {
  getAll: async (search?: string, productoId?: number): Promise<ItemProducto[]> => {
    const response = await api.get('/items-producto', { 
      params: { search, producto: productoId } 
    });
    return response.data;
  },
  
  getById: async (id: number): Promise<ItemProducto> => {
    const response = await api.get(`/items-producto/${id}`);
    return response.data;
  },
  
  getBySerial: async (serial: string): Promise<ItemProducto> => {
    const response = await api.get(`/items-producto/serial/${serial}`);
    return response.data;
  },
  
  getByUbicacion: async (ubicacionId: number): Promise<ItemProducto[]> => {
    const response = await api.get(`/items-producto/ubicacion/${ubicacionId}`);
    return response.data;
  },
  
  create: async (item: Omit<ItemProducto, 'id' | 'ubicacion' | 'producto'>): Promise<ItemProducto> => {
    const response = await api.post('/items-producto', item);
    return response.data;
  },
  
  update: async (id: number, item: Partial<ItemProducto>): Promise<ItemProducto> => {
    const response = await api.patch(`/items-producto/${id}`, item);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/items-producto/${id}`);
  },
};

export const itemsConSerialAPI = {
  getAll: async (): Promise<ItemConSerial[]> => {
    const response = await api.get('/items-con-serial');
    return response.data;
  },
  
  getById: async (id: number): Promise<ItemConSerial> => {
    const response = await api.get(`/items-con-serial/${id}`);
    return response.data;
  },
  
  getBySerial: async (serial: string): Promise<ItemConSerial[]> => {
    const response = await api.get(`/items-con-serial/serial/${serial}`);
    return response.data;
  },
  
  getByUbicacion: async (ubicacionId: number): Promise<ItemConSerial[]> => {
    const response = await api.get(`/items-con-serial/ubicacion/${ubicacionId}`);
    return response.data;
  },
  
  getByProducto: async (productoId: number): Promise<ItemConSerial[]> => {
    const response = await api.get(`/items-con-serial/producto/${productoId}`);
    return response.data;
  },
  
  create: async (item: Omit<ItemConSerial, 'id' | 'ubicacion' | 'producto'>): Promise<ItemConSerial> => {
    const response = await api.post('/items-con-serial', item);
    return response.data;
  },
  
  bulkCreate: async (data: {
    seriales: string[];
    ubicacion_id: number;
    producto_id: number;
    estado?: string;
    check?: 'in' | 'out';
  }): Promise<ItemConSerial[]> => {
    const response = await api.post('/items-con-serial/bulk', data);
    return response.data;
  },
  
  update: async (id: number, item: Partial<ItemConSerial>): Promise<ItemConSerial> => {
    const response = await api.patch(`/items-con-serial/${id}`, item);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/items-con-serial/${id}`);
  },
};

export const itemsSinSerialAPI = {
  getAll: async (): Promise<ItemSinSerial[]> => {
    const response = await api.get('/items-sin-serial');
    return response.data;
  },
  
  getById: async (id: number): Promise<ItemSinSerial> => {
    const response = await api.get(`/items-sin-serial/${id}`);
    return response.data;
  },
  
  getByUbicacion: async (ubicacionId: number): Promise<ItemSinSerial[]> => {
    const response = await api.get(`/items-sin-serial/ubicacion/${ubicacionId}`);
    return response.data;
  },
  
  getByProducto: async (productoId: number): Promise<ItemSinSerial[]> => {
    const response = await api.get(`/items-sin-serial/producto/${productoId}`);
    return response.data;
  },
  
  create: async (item: Omit<ItemSinSerial, 'id' | 'ubicacion' | 'producto'>): Promise<ItemSinSerial> => {
    const response = await api.post('/items-sin-serial', item);
    return response.data;
  },
  
  update: async (id: number, item: Partial<ItemSinSerial>): Promise<ItemSinSerial> => {
    const response = await api.patch(`/items-sin-serial/${id}`, item);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/items-sin-serial/${id}`);
  },
  
  checkIn: async (productoId: number, ubicacionId: number, cantidad: number): Promise<void> => {
    await api.post(`/items-sin-serial/check-in/${productoId}/${ubicacionId}/${cantidad}`);
  },
  
  checkOut: async (productoId: number, ubicacionId: number, cantidad: number): Promise<void> => {
    await api.post(`/items-sin-serial/check-out/${productoId}/${ubicacionId}/${cantidad}`);
  },
};

export const busquedaAPI = {
  buscarPorSerial: async (serial: string): Promise<UbicacionConItems[]> => {
    const response = await api.get(`/busqueda/serial/${serial}`);
    return response.data;
  },
};

export const ubicacionesAPI = {
  getAll: async (): Promise<Ubicacion[]> => {
    const response = await api.get('/ubicaciones');
    return response.data;
  },
  
  getById: async (id: number): Promise<Ubicacion> => {
    const response = await api.get(`/ubicaciones/${id}`);
    return response.data;
  },
  
  create: async (ubicacion: Omit<Ubicacion, 'id' | 'items'>): Promise<Ubicacion> => {
    const response = await api.post('/ubicaciones', ubicacion);
    return response.data;
  },
  
  update: async (id: number, ubicacion: Partial<Ubicacion>): Promise<Ubicacion> => {
    const response = await api.patch(`/ubicaciones/${id}`, ubicacion);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/ubicaciones/${id}`);
  },
};

export const inventariosAPI = {
  // Inventarios
  getInventarios: async (): Promise<Inventario[]> => {
    const response = await api.get('/inventarios');
    return response.data;
  },
  
  getInventario: async (id: number): Promise<Inventario> => {
    const response = await api.get(`/inventarios/${id}`);
    return response.data;
  },
  
  createInventario: async (inventario: {
    responsable: string;
    lista: ItemInventario[];
    ubicacion_id: number;
  }): Promise<Inventario> => {
    const response = await api.post('/inventarios', inventario);
    return response.data;
  },
  
  // Check-ins
  getCheckIns: async (): Promise<CheckIn[]> => {
    const response = await api.get('/inventarios/check-ins/all');
    return response.data;
  },
  
  createCheckIn: async (checkIn: {
    responsable: string;
    seriales: string[];
    ubicacion_id: number;
    producto_id?: number;
  }): Promise<CheckIn> => {
    const response = await api.post('/inventarios/check-in', checkIn);
    return response.data;
  },
  
  // Check-outs
  getCheckOuts: async (): Promise<CheckOut[]> => {
    const response = await api.get('/inventarios/check-outs/all');
    return response.data;
  },
  
  createCheckOut: async (checkOut: {
    responsable: string;
    seriales: string[];
    ubicacion_id: number;
    producto_id?: number;
  }): Promise<CheckOut> => {
    const response = await api.post('/inventarios/check-out', checkOut);
    return response.data;
  },
  
  // Eliminados
  getEliminados: async (): Promise<Eliminado[]> => {
    const response = await api.get('/inventarios/eliminados/all');
    return response.data;
  },
  
  createEliminado: async (eliminado: {
    responsable: string;
    razon: string;
    seriales: string[];
    ubicacion_id: number;
  }): Promise<Eliminado> => {
    const response = await api.post('/inventarios/eliminados', eliminado);
    return response.data;
  },
  
  // Movimientos
  getMovimientos: async (): Promise<Movimiento[]> => {
    const response = await api.get('/inventarios/movimientos/all');
    return response.data;
  },
  
  createMovimiento: async (movimiento: {
    responsable: string;
    seriales: string[];
    ubicacion_origen_id: number;
    ubicacion_destino_id: number;
  }): Promise<Movimiento> => {
    const response = await api.post('/inventarios/mover', movimiento);
    return response.data;
  },
  
  // Records
  getAllRecords: async (): Promise<Record[]> => {
    const response = await api.get('/inventarios/records/all');
    return response.data;
  },
};

export default api;
