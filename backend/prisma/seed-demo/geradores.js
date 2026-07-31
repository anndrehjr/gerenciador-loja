// Funções puras de geração estatística — sem banco, sem I/O. É o que dá pra
// os dados do seed demonstrativo parecerem humanos em vez de aleatórios de
// verdade: pesos por dia da semana/mês, ruído gaussiano em vez de uniforme,
// platôs, sumiços e retornos.

let semente = 42;

// PRNG determinístico (mulberry32) — o mesmo SEED_ALEATORIO sempre gera o
// mesmo banco demonstrativo, o que ajuda a comparar/depurar execuções, mas
// dá pra reinicializar com Date.now() pra variar entre execuções (ver
// index.js). Não é criptográfico — não tem por que ser, é dado fictício.
export function definirSemente(valor) {
  semente = valor >>> 0;
}

export function aleatorio() {
  semente |= 0;
  semente = (semente + 0x6d2b79f5) | 0;
  let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function inteiroEntre(min, max) {
  return Math.floor(aleatorio() * (max - min + 1)) + min;
}

export function escolher(lista) {
  return lista[inteiroEntre(0, lista.length - 1)];
}

// Escolha ponderada: itens = [{ valor, peso }]. Pesos não precisam somar 1.
export function escolherPonderado(itens) {
  const total = itens.reduce((soma, i) => soma + i.peso, 0);
  let alvo = aleatorio() * total;
  for (const item of itens) {
    alvo -= item.peso;
    if (alvo <= 0) return item.valor;
  }
  return itens[itens.length - 1].valor;
}

export function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = inteiroEntre(0, i);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Ruído gaussiano (Box-Muller) — oscilação natural (ex.: peso, consumo de
// água) nunca deveria ser uniforme; gente real varia em torno de uma média
// com mais valores perto do centro do que nas pontas.
export function ruidoGaussiano(desvioPadrao = 1) {
  const u1 = Math.max(aleatorio(), 1e-9);
  const u2 = aleatorio();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z * desvioPadrao;
}

// Peso relativo de cada dia da semana pro volume de agendamentos — sexta e
// sábado bem mais cheios, domingo quase parado (0 = segunda no JS Date).
const PESO_DIA_SEMANA = [0.15, 0.75, 0.85, 0.9, 0.95, 1.3, 1.15];

export function pesoDiaSemana(data) {
  return PESO_DIA_SEMANA[data.getDay()];
}

// Sazonalidade por mês (0 = janeiro) — dezembro/novembro (festas) e maio
// (dia das mães) mais fortes; janeiro e fevereiro mais fracos.
const PESO_MES = [0.75, 0.8, 0.95, 1, 1.2, 1, 1, 0.95, 1, 1.05, 1.25, 1.35];

export function pesoMes(data) {
  return PESO_MES[data.getMonth()];
}

// Horários de pico: início de manhã fraco, meio da manhã e fim de tarde
// fortes — reflete a agenda real de um salão (grid de 30 em 30 min, 9h-19h).
const SLOTS_HORARIO = [
  { minuto: 9 * 60, peso: 0.6 }, { minuto: 9 * 60 + 30, peso: 0.7 },
  { minuto: 10 * 60, peso: 0.9 }, { minuto: 10 * 60 + 30, peso: 1 },
  { minuto: 11 * 60, peso: 1 }, { minuto: 11 * 60 + 30, peso: 0.9 },
  { minuto: 13 * 60, peso: 0.6 }, { minuto: 13 * 60 + 30, peso: 0.7 },
  { minuto: 14 * 60, peso: 0.9 }, { minuto: 14 * 60 + 30, peso: 1 },
  { minuto: 15 * 60, peso: 1.1 }, { minuto: 15 * 60 + 30, peso: 1.1 },
  { minuto: 16 * 60, peso: 1.2 }, { minuto: 16 * 60 + 30, peso: 1.2 },
  { minuto: 17 * 60, peso: 1.1 }, { minuto: 17 * 60 + 30, peso: 1 },
  { minuto: 18 * 60, peso: 0.8 }, { minuto: 18 * 60 + 30, peso: 0.6 },
];

export function minutoDoDia() {
  return escolherPonderado(SLOTS_HORARIO.map((s) => ({ valor: s.minuto, peso: s.peso })));
}

export function combinarData(diaBase, minutoDoDiaValor) {
  const d = new Date(diaBase);
  d.setHours(Math.floor(minutoDoDiaValor / 60), minutoDoDiaValor % 60, 0, 0);
  return d;
}

export function gerarCpfFalso() {
  const bloco = () => String(inteiroEntre(0, 999)).padStart(3, "0");
  return `${bloco()}.${bloco()}.${bloco()}-${String(inteiroEntre(0, 99)).padStart(2, "0")}`;
}

export function gerarCnpjFalso() {
  const bloco = (tam) => String(inteiroEntre(0, 10 ** tam - 1)).padStart(tam, "0");
  return `${bloco(2)}.${bloco(3)}.${bloco(3)}/0001-${bloco(2)}`;
}

export function gerarTelefoneFalso() {
  const ddd = escolher(["11", "21", "31", "41", "51", "61", "71", "81", "85"]);
  return `(${ddd}) 9${inteiroEntre(6000, 9999)}-${inteiroEntre(1000, 9999)}`;
}

export function normalizarParaSlug(valor) {
  const mapaAcentos = { á: "a", à: "a", â: "a", ã: "a", é: "e", ê: "e", í: "i", ó: "o", ô: "o", õ: "o", ú: "u", ç: "c" };
  return valor
    .toLowerCase()
    .replace(/[áàâãéêíóôõúç]/g, (ch) => mapaAcentos[ch] || ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
