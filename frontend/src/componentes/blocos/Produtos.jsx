import { Package } from "lucide-react";

// Vitrine das marcas/produtos trabalhados pelo salão — só aparece com
// produtos reais cadastrados em personalizacao.products (mesmo padrão de
// Galeria/CortesFeitos: sem conteúdo real, o bloco simplesmente some).
export default function Produtos({ personalizacao }) {
  const produtos = personalizacao?.products;
  if (!Array.isArray(produtos) || produtos.length === 0) return null;

  return (
    <section id="produtos" className="scroll-mt-20 border-t border-line py-16">
      <h2 className="text-xl font-semibold">Produtos</h2>
      <p className="mt-1 text-sm text-muted">As marcas que usamos e recomendamos.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {produtos.map((produto, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex aspect-square items-center justify-center overflow-hidden bg-hover">
              {produto.urlImagem ? (
                <img src={produto.urlImagem} alt={produto.nome} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-8 w-8 text-muted" />
              )}
            </div>
            <div className="p-3 text-center">
              <div className="text-sm font-medium">{produto.nome}</div>
              {produto.marca && <div className="text-xs text-muted">{produto.marca}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
