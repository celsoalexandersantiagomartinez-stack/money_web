export interface OpcionColor {
  key: string;
  label: string;
  dot: string;
  bar: string;
  hex: string;
}

export const OPCIONES_COLOR: OpcionColor[] = [
  { key: "blue", label: "Azul", dot: "bg-blue-500", bar: "bg-blue-500", hex: "#3b82f6" },
  { key: "violet", label: "Violeta", dot: "bg-violet-500", bar: "bg-violet-500", hex: "#8b5cf6" },
  { key: "red", label: "Rojo", dot: "bg-red-500", bar: "bg-red-500", hex: "#ef4444" },
  { key: "amber", label: "Ámbar", dot: "bg-amber-500", bar: "bg-amber-500", hex: "#f59e0b" },
  { key: "pink", label: "Rosa", dot: "bg-pink-500", bar: "bg-pink-500", hex: "#ec4899" },
];

const DEFAULT_COLOR = OPCIONES_COLOR[0];

export function colorDeCategoria(color: string | null | undefined): OpcionColor {
  return OPCIONES_COLOR.find((c) => c.key === color) ?? DEFAULT_COLOR;
}
