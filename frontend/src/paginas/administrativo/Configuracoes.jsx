import { useEffect, useState } from "react";
import { Check, ExternalLink, Lock, Sparkles, ChevronUp, ChevronDown, Plus, Trash2, KeyRound } from "lucide-react";
import { useAutenticacao } from "../../contextos/ContextoAutenticacao.jsx";
import { mostrarMensagem } from "../../contextos/ContextoNotificacoes.jsx";
import { api } from "../../biblioteca/api.js";
import { MODELOS } from "../../biblioteca/modelos.js";
import { INFO_PLANO, recursosDoPlano } from "../../biblioteca/planos.js";
import { infoTipoSalao } from "../../biblioteca/tiposSalao.js";
import { ORDEM_BLOCOS } from "../../biblioteca/modelosPorCategoria.js";
import { FONTES_TITULO } from "../../biblioteca/fontes.js";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";
import Botao from "../../componentes/ui/Botao.jsx";

const CHAVES_REORDENAVEIS = ORDEM_BLOCOS.filter((k) => k !== "hero" && k !== "footer");
// Rótulos de exibição pras chaves de bloco — as chaves em si ficam em inglês
// de propósito (ver comentário em modelosPorCategoria.js).
const ROTULOS_BLOCO = {
  about: "Sobre",
  services: "Serviços",
  products: "Produtos",
  team: "Equipe",
  gallery: "Galeria",
  reviews: "Avaliações",
  stats: "Números",
  finishedWork: "Cortes feitos",
  instagram: "Instagram",
  faq: "Perguntas frequentes",
  contact: "Contato",
};

function EditorOrdemBlocos({ ordem, onChange }) {
  function mover(indice, delta) {
    const proxima = [...ordem];
    const alvo = indice + delta;
    if (alvo < 0 || alvo >= proxima.length) return;
    [proxima[indice], proxima[alvo]] = [proxima[alvo], proxima[indice]];
    onChange(proxima);
  }

  return (
    <div className="flex flex-col gap-2">
      {ordem.map((chave, i) => (
        <div key={chave} className="flex items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm">
          {ROTULOS_BLOCO[chave] || chave}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => mover(i, -1)}
              disabled={i === 0}
              className="rounded-lg p-1 text-muted transition duration-200 hover:bg-hover hover:text-ink disabled:opacity-30"
              aria-label="Mover pra cima"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => mover(i, 1)}
              disabled={i === ordem.length - 1}
              className="rounded-lg p-1 text-muted transition duration-200 hover:bg-hover hover:text-ink disabled:opacity-30"
              aria-label="Mover pra baixo"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SeletorModelo({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Object.entries(MODELOS).map(([chave, modelo]) => (
        <button
          key={chave}
          type="button"
          onClick={() => onChange(chave)}
          className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition duration-200 ${
            value === chave ? "border-accent ring-1 ring-accent" : "border-line hover:bg-hover"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <span
              className="h-6 w-6 rounded-full border border-line"
              style={{ backgroundColor: modelo.swatch }}
            />
            {value === chave && <Check className="h-4 w-4 text-accent-ink" />}
          </div>
          <div className="text-xs font-medium">{modelo.rotulo}</div>
          <div className="text-[11px] text-muted">{modelo.descricao}</div>
        </button>
      ))}
    </div>
  );
}

function SeletorFonte({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {FONTES_TITULO.map((f) => (
        <button
          key={f.valor}
          type="button"
          onClick={() => onChange(f.valor)}
          className={`rounded-xl border p-3 text-left transition duration-200 ${
            value === f.valor ? "border-accent ring-1 ring-accent" : "border-line hover:bg-hover"
          }`}
          style={{ fontFamily: f.valor }}
        >
          <div className="text-lg">Aa</div>
          <div className="mt-1 text-[11px] text-muted">{f.rotulo}</div>
        </button>
      ))}
    </div>
  );
}

function EditorAvaliacoes({ avaliacoes, onChange }) {
  function atualizar(indice, campo, valor) {
    onChange(avaliacoes.map((a, i) => (i === indice ? { ...a, [campo]: valor } : a)));
  }

  function remover(indice) {
    onChange(avaliacoes.filter((_, i) => i !== indice));
  }

  return (
    <div className="flex flex-col gap-3">
      {avaliacoes.map((a, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl border border-line p-3">
          <div className="flex gap-2">
            <input
              placeholder="Nome do cliente"
              value={a.name}
              onChange={(e) => atualizar(i, "name", e.target.value)}
              className="flex-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
            <select
              value={a.rating}
              onChange={(e) => atualizar(i, "rating", Number(e.target.value))}
              className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm outline-none transition duration-200 focus:border-accent"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => remover(i)}
              className="rounded-lg p-1.5 text-muted transition duration-200 hover:bg-hover hover:text-critical"
              aria-label="Remover avaliação"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <textarea
            placeholder="O que o cliente disse"
            rows={2}
            value={a.text}
            onChange={(e) => atualizar(i, "text", e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </div>
      ))}
      <Botao
        type="button"
        variante="ghost"
        onClick={() => onChange([...avaliacoes, { name: "", rating: 5, text: "" }])}
        className="self-start"
      >
        <Plus className="h-4 w-4" />
        Adicionar avaliação
      </Botao>
    </div>
  );
}

function EditorNumeros({ itens, onChange }) {
  function atualizar(indice, campo, valor) {
    onChange(itens.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)));
  }

  function remover(indice) {
    onChange(itens.filter((_, i) => i !== indice));
  }

  return (
    <div className="flex flex-col gap-3">
      {itens.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            placeholder="Valor — ex.: 3000+, 21, 4,8/5"
            value={item.valor}
            onChange={(e) => atualizar(i, "valor", e.target.value)}
            className="w-36 shrink-0 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
          <input
            placeholder="Rótulo — ex.: Clientes atendidos"
            value={item.label}
            onChange={(e) => atualizar(i, "label", e.target.value)}
            className="flex-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
          <button
            type="button"
            onClick={() => remover(i)}
            className="rounded-lg p-1.5 text-muted transition duration-200 hover:bg-hover hover:text-critical"
            aria-label="Remover número"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {itens.length < 4 && (
        <Botao
          type="button"
          variante="ghost"
          onClick={() => onChange([...itens, { valor: "", label: "" }])}
          className="self-start"
        >
          <Plus className="h-4 w-4" />
          Adicionar número
        </Botao>
      )}
    </div>
  );
}

function EditorProdutos({ produtos, onChange }) {
  function atualizar(indice, campo, valor) {
    onChange(produtos.map((p, i) => (i === indice ? { ...p, [campo]: valor } : p)));
  }

  function remover(indice) {
    onChange(produtos.filter((_, i) => i !== indice));
  }

  return (
    <div className="flex flex-col gap-3">
      {produtos.map((produto, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl border border-line p-3">
          <div className="flex gap-2">
            <input
              placeholder="Nome do produto"
              value={produto.nome}
              onChange={(e) => atualizar(i, "nome", e.target.value)}
              className="flex-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
            <input
              placeholder="Marca"
              value={produto.marca}
              onChange={(e) => atualizar(i, "marca", e.target.value)}
              className="w-32 shrink-0 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
            <button
              type="button"
              onClick={() => remover(i)}
              className="rounded-lg p-1.5 text-muted transition duration-200 hover:bg-hover hover:text-critical"
              aria-label="Remover produto"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <input
            placeholder="URL da foto (opcional)"
            value={produto.urlImagem}
            onChange={(e) => atualizar(i, "urlImagem", e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </div>
      ))}
      <Botao
        type="button"
        variante="ghost"
        onClick={() => onChange([...produtos, { nome: "", marca: "", urlImagem: "" }])}
        className="self-start"
      >
        <Plus className="h-4 w-4" />
        Adicionar produto
      </Botao>
    </div>
  );
}

function SeloPlano({ plano }) {
  const info = INFO_PLANO[plano];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-ink">
      <Sparkles className="h-3.5 w-3.5" />
      Plano {info?.rotulo || plano}
    </span>
  );
}

function PersonalizacaoBloqueada() {
  return (
    <div className="flex max-w-lg items-start gap-4 rounded-2xl border border-dashed border-line bg-surface/60 p-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hover text-muted">
        <Lock className="h-4.5 w-4.5" />
      </div>
      <div>
        <h2 className="text-sm font-semibold">Personalização completa</h2>
        <p className="mt-1 text-xs text-muted">
          Editar os textos do site, Instagram e galeria direto pelo painel é exclusivo do plano Premium. Fale com a
          equipe da plataforma pra fazer upgrade.
        </p>
      </div>
    </div>
  );
}

function CartaoTrocarSenha() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await api.patch("/auth/minha-senha", { senhaAtual, novaSenha });
      setSenhaAtual("");
      setNovaSenha("");
      mostrarMensagem({ tipo: "sucesso", texto: "Senha alterada com sucesso." });
    } catch (err) {
      setErro(err.message);
      mostrarMensagem({ tipo: "erro", texto: err.message });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-md flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-soft"
    >
      <h2 className="text-sm font-semibold text-muted">Senha de acesso</h2>
      <CampoTexto
        id="senhaAtual"
        rotulo="Senha atual"
        type="password"
        autoComplete="current-password"
        required
        value={senhaAtual}
        onChange={(e) => setSenhaAtual(e.target.value)}
      />
      <CampoTexto
        id="novaSenha"
        rotulo="Nova senha"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
      />
      {erro && <p className="text-sm text-critical">{erro}</p>}
      <Botao type="submit" disabled={salvando} className="self-start">
        <KeyRound className="h-4 w-4" />
        {salvando ? "Salvando…" : "Trocar senha"}
      </Botao>
    </form>
  );
}

export default function Configuracoes() {
  const { usuario } = useAutenticacao();
  const [salao, setSalao] = useState(null);
  const [form, setForm] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);

  const [personalizado, setPersonalizado] = useState(null);
  const [salvandoPersonalizado, setSalvandoPersonalizado] = useState(false);
  const [erroPersonalizado, setErroPersonalizado] = useState("");
  const [salvoPersonalizado, setSalvoPersonalizado] = useState(false);

  useEffect(() => {
    api.get("/salon").then((dados) => {
      setSalao(dados);
      setForm({
        nome: dados.nome,
        template: dados.template,
        urlLogo: dados.urlLogo || "",
        urlBanner: dados.urlBanner || "",
        corPrimaria: dados.corPrimaria || "",
      });
      const c = dados.personalizacao || {};
      setPersonalizado({
        heroHeadline: c.heroHeadline || "",
        heroSubheadline: c.heroSubheadline || "",
        aboutTitle: c.aboutTitle || "",
        aboutText: c.aboutText || "",
        instagramHandle: c.instagramHandle || "",
        gallery: Array.isArray(c.gallery) ? c.gallery.join("\n") : "",
        showFinishedWork: Boolean(c.showFinishedWork),
        finishedWork: Array.isArray(c.finishedWork) ? c.finishedWork.join("\n") : "",
        reviews: Array.isArray(c.reviews) ? c.reviews : [],
        stats: Array.isArray(c.stats) ? c.stats : [],
        products: Array.isArray(c.products) ? c.products : [],
        accentColor: c.accentColor || "",
        fontDisplay: c.fontDisplay || "",
        blockOrder:
          Array.isArray(c.blockOrder) && c.blockOrder.length
            ? c.blockOrder.filter((k) => CHAVES_REORDENAVEIS.includes(k))
            : CHAVES_REORDENAVEIS,
      });
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSalvo(false);
    setSalvando(true);
    try {
      const payload = {
        nome: form.nome,
        urlLogo: form.urlLogo || null,
        ...(exclusivo
          ? { urlBanner: form.urlBanner || null }
          : { template: form.template, corPrimaria: form.corPrimaria || null }),
      };
      const atualizado = await api.patch("/salon", payload);
      setSalao(atualizado);
      setSalvo(true);
      mostrarMensagem({ tipo: "sucesso", texto: "Aparência do site salva com sucesso." });
    } catch (err) {
      setErro(err.message);
      mostrarMensagem({ tipo: "erro", texto: err.message });
    } finally {
      setSalvando(false);
    }
  }

  async function handleSubmitPersonalizacao(e) {
    e.preventDefault();
    setErroPersonalizado("");
    setSalvoPersonalizado(false);
    setSalvandoPersonalizado(true);
    try {
      const payload = {
        personalizacao: {
          heroHeadline: personalizado.heroHeadline || undefined,
          heroSubheadline: personalizado.heroSubheadline || undefined,
          aboutTitle: personalizado.aboutTitle || undefined,
          aboutText: personalizado.aboutText || undefined,
          instagramHandle: personalizado.instagramHandle || undefined,
          gallery: personalizado.gallery
            ? personalizado.gallery.split("\n").map((s) => s.trim()).filter(Boolean)
            : undefined,
          showFinishedWork: personalizado.showFinishedWork,
          finishedWork: personalizado.finishedWork
            ? personalizado.finishedWork.split("\n").map((s) => s.trim()).filter(Boolean)
            : undefined,
          reviews: personalizado.reviews.length
            ? personalizado.reviews.filter((a) => a.name && a.text)
            : undefined,
          stats: personalizado.stats.length
            ? personalizado.stats.filter((s) => s.valor && s.label)
            : undefined,
          products: personalizado.products.length
            ? personalizado.products.filter((p) => p.nome)
            : undefined,
          accentColor: personalizado.accentColor || undefined,
          fontDisplay: personalizado.fontDisplay || undefined,
          blockOrder: personalizado.blockOrder,
        },
      };
      const atualizado = await api.patch("/salon", payload);
      setSalao(atualizado);
      setSalvoPersonalizado(true);
      mostrarMensagem({ tipo: "sucesso", texto: "Personalização salva com sucesso." });
    } catch (err) {
      setErroPersonalizado(err.message);
      mostrarMensagem({ tipo: "erro", texto: err.message });
    } finally {
      setSalvandoPersonalizado(false);
    }
  }

  const urlPublica = salao?.dominio
    ? `https://${salao.dominio}`
    : salao
      ? `${window.location.origin}/${salao.id}`
      : null;

  const exclusivo = salao ? recursosDoPlano(salao.plano).templateExclusivo : false;
  const premium = salao ? recursosDoPlano(salao.plano).personalizacaoCompleta : false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">Configurações</h1>
        {salao && <SeloPlano plano={salao.plano} />}
      </div>

      <div className="max-w-md rounded-2xl border border-line bg-surface p-6 shadow-soft">
        <h2 className="text-sm font-semibold text-muted">Conta</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Nome</dt>
            <dd>{usuario?.nome}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Email</dt>
            <dd>{usuario?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Perfil</dt>
            <dd>{usuario?.papel}</dd>
          </div>
        </dl>
      </div>

      <CartaoTrocarSenha />

      {form && (
        <form
          onSubmit={handleSubmit}
          className="flex max-w-lg flex-col gap-5 rounded-2xl border border-line bg-surface p-6 shadow-soft"
        >
          <div>
            <h2 className="text-sm font-semibold text-muted">Aparência do site público</h2>
            <p className="mt-1 text-xs text-muted">
              {exclusivo
                ? `Seu site usa a landing exclusiva de ${infoTipoSalao(salao.categoria).rotulo}, definida no cadastro.`
                : "Vale pro site e pra tela de login do seu salão — ninguém mais é afetado."}
            </p>
          </div>

          {urlPublica && (
            <a
              href={urlPublica}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-accent-ink hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {urlPublica}
            </a>
          )}

          <CampoTexto
            id="nomeSalao"
            rotulo="Nome do salão"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />

          <CampoTexto
            id="urlLogo"
            rotulo="URL da logo (opcional)"
            placeholder="https://…"
            value={form.urlLogo}
            onChange={(e) => setForm({ ...form, urlLogo: e.target.value })}
          />

          {exclusivo && (
            <CampoTexto
              id="urlBanner"
              rotulo="URL do banner (imagem de destaque do hero)"
              placeholder="https://…"
              value={form.urlBanner}
              onChange={(e) => setForm({ ...form, urlBanner: e.target.value })}
            />
          )}

          {!exclusivo && (
            <>
              <div>
                <span className="text-sm font-medium text-ink">Modelo visual</span>
                <div className="mt-2">
                  <SeletorModelo value={form.template} onChange={(template) => setForm({ ...form, template })} />
                </div>
              </div>

              <CampoTexto
                id="corPrimaria"
                rotulo="Cor personalizada (opcional, substitui o modelo)"
                placeholder="#8B5CF6"
                value={form.corPrimaria}
                onChange={(e) => setForm({ ...form, corPrimaria: e.target.value })}
              />
            </>
          )}

          {erro && <p className="text-sm text-critical">{erro}</p>}
          {salvo && <p className="text-sm text-accent-ink">Salvo.</p>}

          <Botao type="submit" disabled={salvando} className="self-start">
            {salvando ? "Salvando…" : "Salvar aparência"}
          </Botao>
        </form>
      )}

      {exclusivo && !premium && <PersonalizacaoBloqueada />}

      {exclusivo && premium && personalizado && (
        <form
          onSubmit={handleSubmitPersonalizacao}
          className="flex max-w-lg flex-col gap-5 rounded-2xl border border-line bg-surface p-6 shadow-soft"
        >
          <div>
            <h2 className="text-sm font-semibold text-muted">Personalização avançada</h2>
            <p className="mt-1 text-xs text-muted">Sobrescreve os textos padrão da sua landing exclusiva.</p>
          </div>

          <CampoTexto
            id="heroHeadline"
            rotulo="Frase principal (hero)"
            value={personalizado.heroHeadline}
            onChange={(e) => setPersonalizado({ ...personalizado, heroHeadline: e.target.value })}
          />
          <div>
            <label htmlFor="heroSubheadline" className="mb-1.5 block text-sm font-medium text-ink">
              Subtítulo (hero)
            </label>
            <textarea
              id="heroSubheadline"
              rows={2}
              value={personalizado.heroSubheadline}
              onChange={(e) => setPersonalizado({ ...personalizado, heroSubheadline: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </div>
          <CampoTexto
            id="aboutTitle"
            rotulo="Título da seção Sobre"
            value={personalizado.aboutTitle}
            onChange={(e) => setPersonalizado({ ...personalizado, aboutTitle: e.target.value })}
          />
          <div>
            <label htmlFor="aboutText" className="mb-1.5 block text-sm font-medium text-ink">
              Texto da seção Sobre
            </label>
            <textarea
              id="aboutText"
              rows={3}
              value={personalizado.aboutText}
              onChange={(e) => setPersonalizado({ ...personalizado, aboutText: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </div>
          <CampoTexto
            id="instagramHandle"
            rotulo="Instagram (opcional)"
            placeholder="@seusalao"
            value={personalizado.instagramHandle}
            onChange={(e) => setPersonalizado({ ...personalizado, instagramHandle: e.target.value })}
          />
          <div>
            <label htmlFor="gallery" className="mb-1.5 block text-sm font-medium text-ink">
              Galeria — uma URL de imagem por linha
            </label>
            <textarea
              id="gallery"
              rows={3}
              value={personalizado.gallery}
              onChange={(e) => setPersonalizado({ ...personalizado, gallery: e.target.value })}
              placeholder={"https://…\nhttps://…"}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={personalizado.showFinishedWork}
                onChange={(e) => setPersonalizado({ ...personalizado, showFinishedWork: e.target.checked })}
              />
              Mostrar seção de cortes feitos no site
            </label>
            <label htmlFor="finishedWork" className="mb-1.5 mt-3 block text-sm font-medium text-ink">
              Cortes feitos — uma URL de foto por linha
            </label>
            <textarea
              id="finishedWork"
              rows={3}
              value={personalizado.finishedWork}
              onChange={(e) => setPersonalizado({ ...personalizado, finishedWork: e.target.value })}
              placeholder={"https://…\nhttps://…"}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </div>

          <div>
            <label htmlFor="reviewsEditor" className="mb-1.5 block text-sm font-medium text-ink">
              Avaliações
            </label>
            <EditorAvaliacoes
              avaliacoes={personalizado.reviews}
              onChange={(reviews) => setPersonalizado({ ...personalizado, reviews })}
            />
          </div>

          <div>
            <label htmlFor="statsEditor" className="mb-1.5 block text-sm font-medium text-ink">
              Números em destaque (até 4)
            </label>
            <p className="mb-2 text-xs text-muted">
              Só valores reais — ex.: "3000+" clientes, "21" anos. Valores numéricos puros ganham animação de contagem.
            </p>
            <EditorNumeros
              itens={personalizado.stats}
              onChange={(stats) => setPersonalizado({ ...personalizado, stats })}
            />
          </div>

          <div>
            <label htmlFor="productsEditor" className="mb-1.5 block text-sm font-medium text-ink">
              Produtos / marcas trabalhadas
            </label>
            <EditorProdutos
              produtos={personalizado.products}
              onChange={(products) => setPersonalizado({ ...personalizado, products })}
            />
          </div>

          <CampoTexto
            id="accentColor"
            rotulo="Cor de destaque (opcional, substitui o preset do segmento)"
            placeholder="#8B5CF6"
            value={personalizado.accentColor}
            onChange={(e) => setPersonalizado({ ...personalizado, accentColor: e.target.value })}
          />

          <div>
            <span className="text-sm font-medium text-ink">Fonte do título (opcional, substitui a do segmento)</span>
            <div className="mt-2">
              <SeletorFonte
                value={personalizado.fontDisplay}
                onChange={(fontDisplay) => setPersonalizado({ ...personalizado, fontDisplay })}
              />
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-ink">Ordem das seções</span>
            <p className="mt-1 text-xs text-muted">Início e rodapé ficam sempre fixos nas pontas.</p>
            <div className="mt-2">
              <EditorOrdemBlocos
                ordem={personalizado.blockOrder}
                onChange={(blockOrder) => setPersonalizado({ ...personalizado, blockOrder })}
              />
            </div>
          </div>

          {erroPersonalizado && <p className="text-sm text-critical">{erroPersonalizado}</p>}
          {salvoPersonalizado && <p className="text-sm text-accent-ink">Salvo.</p>}

          <Botao type="submit" disabled={salvandoPersonalizado} className="self-start">
            {salvandoPersonalizado ? "Salvando…" : "Salvar personalização"}
          </Botao>
        </form>
      )}

      <p className="text-xs text-muted">Gerenciador de Salão — v1.0.0</p>
    </div>
  );
}
