// Tabela genérica orientada a config: colunas = [{ chave, titulo, renderizar?, classeCabecalho?, classeCelula? }].
// `renderizar(linha)` é opcional — sem ele, mostra `linha[coluna.chave]` cru.
export default function Tabela({ colunas, dados, chave = "id", vazio = null, className = "" }) {
  if (!dados?.length) return vazio;

  return (
    <div className={`overflow-x-auto rounded-2xl border border-line ${className}`}>
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-hover/40 text-left text-xs uppercase tracking-wide text-muted">
            {colunas.map((coluna) => (
              <th key={coluna.chave} className={`px-5 py-3 font-medium ${coluna.classeCabecalho || ""}`}>
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {dados.map((linha) => (
            <tr key={linha[chave]} className="bg-surface transition duration-200 hover:bg-hover">
              {colunas.map((coluna) => (
                <td key={coluna.chave} className={`px-5 py-3.5 ${coluna.classeCelula || ""}`}>
                  {coluna.renderizar ? coluna.renderizar(linha) : linha[coluna.chave]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
