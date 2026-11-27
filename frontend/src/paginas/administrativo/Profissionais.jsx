import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save, CalendarOff } from "lucide-react";
import { api } from "../../biblioteca/api.js";
import Botao from "../../componentes/ui/Botao.jsx";
import CampoTexto from "../../componentes/ui/CampoTexto.jsx";

const FORM_VAZIO = { nome: "", especialidade: "", bio: "", urlFoto: "", ativo: true };
const FORM_AUSENCIA_VAZIO = { dataInicio: "", dataFim: "", motivo: "" };

const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

function minutosParaHora(minutos) {
  const h = String(Math.floor(minutos / 60)).padStart(2, "0");
  const m = String(minutos % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function horaParaMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function meiaNoiteLocalIso(dataStr) {
  return new Date(`${dataStr}T00:00:00`).toISOString();
}

function formatarDia(isoString) {
  return new Date(isoString).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function montarEstadoHorarios(horariosTrabalho) {
  const porDiaSemana = new Map();
  for (const h of horariosTrabalho || []) {
    const lista = porDiaSemana.get(h.diaSemana) || [];
    lista.push({ inicio: minutosParaHora(h.minutoInicio), fim: minutosParaHora(h.minutoFim) });
    porDiaSemana.set(h.diaSemana, lista);
  }
  return DIAS_SEMANA.map(({ value }) => ({
    diaSemana: value,
    janelas: (porDiaSemana.get(value) || []).sort((a, b) => a.inicio.localeCompare(b.inicio)),
  }));
}

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [horarios, setHorarios] = useState(montarEstadoHorarios([]));
  const [ausencias, setAusencias] = useState([]);
  const [formAusencia, setFormAusencia] = useState(FORM_AUSENCIA_VAZIO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");
  const [salvandoHorarios, setSalvandoHorarios] = useState(false);

  function carregar() {
    setCarregando(true);
    api
      .get("/professionals")
      .then(setProfissionais)
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  function iniciarCriacao() {
    setIdEmEdicao(null);
    setForm(FORM_VAZIO);
    setHorarios(montarEstadoHorarios([]));
    setAusencias([]);
    setErro("");
    setMostrarForm(true);
  }

  function iniciarEdicao(profissional) {
    setIdEmEdicao(profissional.id);
    setForm({
      nome: profissional.nome,
      especialidade: profissional.especialidade || "",
      bio: profissional.bio || "",
      urlFoto: profissional.urlFoto || "",
      ativo: profissional.ativo,
    });
    setHorarios(montarEstadoHorarios(profissional.horariosTrabalho));
    setAusencias(profissional.ausencias || []);
    setFormAusencia(FORM_AUSENCIA_VAZIO);
    setErro("");
    setMostrarForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      const payload = {
        nome: form.nome,
        especialidade: form.especialidade || null,
        bio: form.bio || null,
        urlFoto: form.urlFoto || null,
        ativo: form.ativo,
      };
      if (idEmEdicao) {
        await api.patch(`/professionals/${idEmEdicao}`, payload);
        carregar();
      } else {
        const criado = await api.post("/professionals", payload);
        setIdEmEdicao(criado.id);
        setHorarios(montarEstadoHorarios([]));
        setAusencias([]);
        carregar();
      }
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleSalvarHorarios() {
    setSalvandoHorarios(true);
    setErro("");
    try {
      const payload = horarios.flatMap((dia) =>
        dia.janelas.map((w) => ({
          diaSemana: dia.diaSemana,
          minutoInicio: horaParaMinutos(w.inicio),
          minutoFim: horaParaMinutos(w.fim),
        }))
      );
      await api.put(`/professionals/${idEmEdicao}/working-hours`, payload);
      carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvandoHorarios(false);
    }
  }

  async function handleAdicionarAusencia(e) {
    e.preventDefault();
    setErro("");
    if (!formAusencia.dataInicio || !formAusencia.dataFim) {
      setErro("Informe as datas de início e fim.");
      return;
    }
    try {
      const criada = await api.post(`/professionals/${idEmEdicao}/time-off`, {
        dataInicio: meiaNoiteLocalIso(formAusencia.dataInicio),
        dataFim: meiaNoiteLocalIso(formAusencia.dataFim),
        motivo: formAusencia.motivo || null,
      });
      setAusencias((prev) => [...prev, criada].sort((a, b) => a.dataInicio.localeCompare(b.dataInicio)));
      setFormAusencia(FORM_AUSENCIA_VAZIO);
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleRemoverAusencia(id) {
    await api.delete(`/professionals/${idEmEdicao}/time-off/${id}`);
    setAusencias((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleExcluir(id) {
    if (!window.confirm("Remover este profissional?")) return;
    await api.delete(`/professionals/${id}`);
    carregar();
  }

  function adicionarJanela(diaSemana) {
    setHorarios((prev) =>
      prev.map((dia) =>
        dia.diaSemana === diaSemana ? { ...dia, janelas: [...dia.janelas, { inicio: "09:00", fim: "18:00" }] } : dia
      )
    );
  }

  function removerJanela(diaSemana, indice) {
    setHorarios((prev) =>
      prev.map((dia) =>
        dia.diaSemana === diaSemana ? { ...dia, janelas: dia.janelas.filter((_, i) => i !== indice) } : dia
      )
    );
  }

  function atualizarJanela(diaSemana, indice, patch) {
    setHorarios((prev) =>
      prev.map((dia) =>
        dia.diaSemana === diaSemana
          ? { ...dia, janelas: dia.janelas.map((w, i) => (i === indice ? { ...w, ...patch } : w)) }
          : dia
      )
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Profissionais</h1>
        <Botao onClick={iniciarCriacao}>
          <Plus className="h-4 w-4" />
          Novo profissional
        </Botao>
      </div>

      {mostrarForm && (
        <div className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
            <CampoTexto
              id="nome"
              rotulo="Nome"
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            <CampoTexto
              id="especialidade"
              rotulo="Especialidade"
              value={form.especialidade}
              onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
            />
            <CampoTexto
              id="urlFoto"
              rotulo="URL da foto"
              value={form.urlFoto}
              onChange={(e) => setForm({ ...form, urlFoto: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              />
              Ativo
            </label>
            <div className="flex gap-2">
              <Botao type="submit">{idEmEdicao ? "Salvar" : "Adicionar"}</Botao>
              <Botao type="button" variante="ghost" onClick={() => setMostrarForm(false)}>
                <X className="h-4 w-4" />
                Fechar
              </Botao>
            </div>
          </form>

          {idEmEdicao && (
            <div className="flex flex-col gap-6 border-t border-line pt-6">
              <div>
                <h2 className="text-sm font-semibold text-muted">Horários de atendimento</h2>
                <p className="mt-1 text-xs text-muted">
                  Adicione mais de um turno no mesmo dia para intervalos (ex.: manhã e tarde).
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {horarios.map((dia) => (
                    <div key={dia.diaSemana} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                      <span className="w-24 shrink-0 pt-1.5 text-sm font-medium">
                        {DIAS_SEMANA[dia.diaSemana].label}
                      </span>
                      <div className="flex flex-1 flex-col gap-2">
                        {dia.janelas.length === 0 && (
                          <span className="pt-1.5 text-sm text-muted">Fechado</span>
                        )}
                        {dia.janelas.map((w, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <input
                              type="time"
                              value={w.inicio}
                              onChange={(e) => atualizarJanela(dia.diaSemana, i, { inicio: e.target.value })}
                              className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
                            />
                            <span className="text-muted">até</span>
                            <input
                              type="time"
                              value={w.fim}
                              onChange={(e) => atualizarJanela(dia.diaSemana, i, { fim: e.target.value })}
                              className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-accent focus:ring-2 focus:ring-accent/25"
                            />
                            <button
                              type="button"
                              onClick={() => removerJanela(dia.diaSemana, i)}
                              className="rounded-lg p-1.5 text-muted transition duration-200 hover:bg-hover hover:text-critical"
                              aria-label="Remover turno"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => adicionarJanela(dia.diaSemana)}
                          className="self-start text-xs font-medium text-accent-ink hover:underline"
                        >
                          + adicionar turno
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <Botao className="mt-4" disabled={salvandoHorarios} onClick={handleSalvarHorarios}>
                  <Save className="h-4 w-4" />
                  {salvandoHorarios ? "Salvando…" : "Salvar horários"}
                </Botao>
              </div>

              <div className="border-t border-line pt-6">
                <h2 className="text-sm font-semibold text-muted">Férias e folgas</h2>
                <p className="mt-1 text-xs text-muted">
                  Datas aqui ficam indisponíveis para agendamento, mesmo dentro do horário normal.
                </p>

                {ausencias.length > 0 && (
                  <ul className="mt-4 flex flex-col gap-2">
                    {ausencias.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <CalendarOff className="h-4 w-4 text-muted" />
                          <span>
                            {formatarDia(t.dataInicio)}
                            {t.dataInicio !== t.dataFim ? ` — ${formatarDia(t.dataFim)}` : ""}
                          </span>
                          {t.motivo && <span className="text-muted">· {t.motivo}</span>}
                        </div>
                        <button
                          onClick={() => handleRemoverAusencia(t.id)}
                          className="rounded-lg p-1.5 text-muted transition duration-200 hover:bg-hover hover:text-critical"
                          aria-label="Remover"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleAdicionarAusencia} className="mt-4 flex flex-wrap items-end gap-3">
                  <CampoTexto
                    id="ausenciaInicio"
                    rotulo="De"
                    type="date"
                    value={formAusencia.dataInicio}
                    onChange={(e) => setFormAusencia({ ...formAusencia, dataInicio: e.target.value })}
                  />
                  <CampoTexto
                    id="ausenciaFim"
                    rotulo="Até"
                    type="date"
                    value={formAusencia.dataFim}
                    onChange={(e) => setFormAusencia({ ...formAusencia, dataFim: e.target.value })}
                  />
                  <CampoTexto
                    id="ausenciaMotivo"
                    rotulo="Motivo (opcional)"
                    value={formAusencia.motivo}
                    onChange={(e) => setFormAusencia({ ...formAusencia, motivo: e.target.value })}
                  />
                  <Botao type="submit" variante="ghost">
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Botao>
                </form>
              </div>
            </div>
          )}

          {erro && <p className="text-sm text-critical" role="alert">{erro}</p>}
        </div>
      )}

      {carregando ? (
        <p className="text-sm text-muted">Carregando…</p>
      ) : profissionais.length === 0 ? (
        <p className="text-sm text-muted">Nenhum profissional cadastrado.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {profissionais.map((profissional) => (
            <li
              key={profissional.id}
              className="flex items-center justify-between gap-4 px-5 py-3.5 transition duration-200 hover:bg-hover"
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {profissional.nome}
                  {!profissional.ativo && (
                    <span className="rounded-full bg-hover px-2 py-0.5 text-xs text-muted">Inativo</span>
                  )}
                </div>
                {profissional.especialidade && (
                  <div className="text-sm text-muted">{profissional.especialidade}</div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => iniciarEdicao(profissional)}
                  className="rounded-lg p-2 text-muted transition duration-200 hover:bg-bg hover:text-ink"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleExcluir(profissional.id)}
                  className="rounded-lg p-2 text-muted transition duration-200 hover:bg-bg hover:text-critical"
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
