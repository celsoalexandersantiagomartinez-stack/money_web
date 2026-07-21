const formatoMonto = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatoEntero = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatMonto(valor: number): string {
  return formatoMonto.format(valor);
}

export function formatEntero(valor: number): string {
  return formatoEntero.format(valor);
}
