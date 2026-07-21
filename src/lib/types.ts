export interface Categoria {
  id: number;
  usuarioId: number;
  nombre: string;
  color: string | null;
}

export interface Gasto {
  id: number;
  usuarioId: number;
  categoriaId: number;
  monto: string;
  fecha: string;
  nota: string | null;
  creadoEn: string;
  categoria: Categoria;
}
