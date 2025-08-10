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
  itemsConSerial?: ItemConSerial[];
  itemsSinSerial?: ItemSinSerial[];
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
  serial?: boolean;
  items?: ItemProducto[];
  itemsConSerial?: ItemConSerial[];
  itemsSinSerial?: ItemSinSerial[];
  _refresh?: number; // Para forzar refresh en navegación
}

export enum EstadoItem {
  ACTIVO = 'activo',
  PERDIDO = 'perdido',
  EN_REPARACION = 'en_reparacion',
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

export interface ItemConSerial {
  id: number;
  serial: string;
  descripcion?: string;
  estado: EstadoItem;
  check: 'in' | 'out';
  ubicacion_id: number;
  producto_id: number;
  ubicacion?: Ubicacion;
  producto?: Producto;
  _refresh?: number;
}

export interface ItemSinSerial {
  id: number;
  cantidad_in: number;
  cantidad_out: number;
  ubicacion_id: number;
  producto_id: number;
  ubicacion?: Ubicacion;
  producto?: Producto;
  _refresh?: number;
}

export interface UbicacionConItems {
  ubicacion_id: number;
  ubicacion_descripcion: string;
  total_items: number;
  items_in: number;
  items_out: number;
  items: ItemConSerial[];
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

export interface Movimiento {
  id: number;
  responsable: string;
  lista: ItemInventario[];
  ubicacion_origen_id: number;
  ubicacion_destino_id: number;
  ubicacionOrigen?: Ubicacion;
  ubicacionDestino?: Ubicacion;
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
  tipo: 'check_in' | 'check_out' | 'eliminado' | 'inventario' | 'movimiento';
  razon?: string;
  ubicacion?: Ubicacion;
  ubicacionOrigen?: Ubicacion;
  ubicacionDestino?: Ubicacion;
  ubicacion_origen_id?: number;
  ubicacion_destino_id?: number;
}
