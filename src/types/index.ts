export interface Usuario {
  id: number;
  nombre: string;
}

export interface Ubicacion {
  id: number;
  fila: string;
  columna: string;
  rack: string;
  descripcion?: string;
  items?: ItemProducto[];
}

export interface Producto {
  id: number;
  sku: string;
  cantidad_total: number;
  cantidad_in_total: number;
  cantidad_out_total: number;
  descripcion: string;
  categoria?: string;
  material?: string;
  marca?: string;
  proveedor?: string;
  imagen_url?: string;
  moq?: number;
  um?: string;
  ue?: string;
  items?: ItemProducto[];
}

export enum EstadoItem {
  DISPONIBLE = 'disponible',
  PRESTADO = 'prestado',
  MANTENIMIENTO = 'mantenimiento',
  DAÑADO = 'dañado'
}

export interface ItemProducto {
  id: number;
  serial: string;
  descripcion?: string;
  estado: EstadoItem;
  cantidad_in: number;
  cantidad_out: number;
  ubicacion_id: number;
  producto_id: number;
  ubicacion?: Ubicacion;
  producto?: Producto;
}

export interface ItemInventario {
  serial: string;
  cantidad: number;
}

export interface CheckIn {
  id: number;
  responsable: string;
  lista: ItemInventario[];
  hora: Date;
}

export interface CheckOut {
  id: number;
  responsable: string;
  lista: ItemInventario[];
  hora: Date;
}

export interface Eliminado {
  id: number;
  responsable: string;
  razon: string;
  lista: ItemInventario[];
  hora: Date;
}

export interface Inventario {
  id: number;
  responsable: string;
  lista: ItemInventario[];
  ubicacion_id: number;
  ubicacion?: Ubicacion;
  hora: Date;
}

export interface LoginCredentials {
  nombre: string;
  contraseña: string;
}

export interface AuthResponse {
  access_token: string;
  user: Usuario;
}

export interface Record {
  id: number;
  responsable: string;
  lista: ItemInventario[];
  hora: Date;
  tipo: 'check_in' | 'check_out' | 'eliminado' | 'inventario';
  razon?: string;
  ubicacion?: Ubicacion;
}
