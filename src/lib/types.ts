export interface Categoria {
  id: number;
  nombre: string;
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
