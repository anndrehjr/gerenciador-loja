// Vitrine dos trabalhos já realizados pelo salão. Diferente da Galeria (fotos
// gerais do espaço), essa seção é só fotos de cortes/serviços prontos — e só
// aparece se o dono do salão habilitou explicitamente nas configurações
// (personalizacao.showFinishedWork), além de ter pelo menos uma foto.
export default function CortesFeitos({ personalizacao }) {
  const habilitado = personalizacao?.showFinishedWork;
  const fotos = personalizacao?.finishedWork;

  if (!habilitado || !Array.isArray(fotos) || fotos.length === 0) return null;

  return (
    <section id="cortes-feitos" className="scroll-mt-20 border-t border-line py-16">
      <h2 className="text-xl font-semibold">Cortes feitos</h2>
      <p className="mt-1 text-sm text-muted">Uma amostra dos nossos trabalhos.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fotos.slice(0, 12).map((src, i) => (
          <div key={i} className="group aspect-square overflow-hidden rounded-xl border border-line">
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
