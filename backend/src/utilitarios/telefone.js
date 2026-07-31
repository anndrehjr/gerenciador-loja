export function normalizarTelefone(bruto) {
  return bruto.replace(/\D/g, "");
}
