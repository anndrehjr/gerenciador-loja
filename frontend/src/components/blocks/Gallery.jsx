// Sem sistema de upload de imagens ainda — o bloco só aparece quando o dono
// do salão (PREMIUM) já cadastrou fotos reais via customization.gallery.
// Nada de placeholder fingindo ser foto: sem conteúdo real, o bloco some.
export default function Gallery({ customization }) {
  const images = customization?.gallery;
  if (!Array.isArray(images) || images.length === 0) return null;

  return (
    <section id="galeria" className="border-t border-line py-16">
      <h2 className="text-xl font-semibold">Galeria</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.slice(0, 9).map((src, i) => (
          <div key={i} className="aspect-square overflow-hidden rounded-xl border border-line">
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
