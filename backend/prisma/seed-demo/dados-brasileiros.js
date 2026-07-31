// Pools de dados reais (nomes, sobrenomes, cidades) usados só pelo seed
// demonstrativo — nunca pelo runtime da API. Nomes de pessoa não são de
// ninguém real: são primeiros nomes e sobrenomes comuns no Brasil,
// recombinados, o que estatisticamente não corresponde a nenhuma pessoa em
// particular (o mesmo princípio de qualquer gerador de dados de teste).

export const NOMES_FEMININOS = [
  "Maria", "Ana", "Francisca", "Antonia", "Adriana", "Juliana", "Marcia",
  "Fernanda", "Patricia", "Aline", "Sandra", "Camila", "Amanda", "Bruna",
  "Jessica", "Leticia", "Julia", "Luciana", "Vanessa", "Mariana", "Gabriela",
  "Larissa", "Beatriz", "Renata", "Carla", "Cristina", "Tatiane", "Natalia",
  "Priscila", "Daniela", "Simone", "Rafaela", "Vitoria", "Isabela", "Yasmin",
  "Eduarda", "Livia", "Sabrina", "Raquel", "Cecilia",
];

export const NOMES_MASCULINOS = [
  "Jose", "Joao", "Antonio", "Francisco", "Carlos", "Paulo", "Pedro",
  "Lucas", "Luiz", "Marcos", "Gabriel", "Rafael", "Daniel", "Marcelo",
  "Bruno", "Eduardo", "Felipe", "Rodrigo", "Gustavo", "Leonardo", "Vinicius",
  "Thiago", "Andre", "Diego", "Fabio", "Fernando", "Ricardo", "Sergio",
  "Alexandre", "Roberto", "Renato", "Wesley", "Matheus", "Caio", "Igor",
  "Henrique", "Julio", "Mateus", "Otavio", "Cauã",
];

export const SOBRENOMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
  "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho",
  "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha",
  "Dias", "Monteiro", "Cardoso", "Reis", "Araujo", "Castro", "Andrade",
  "Nascimento", "Moreira", "Correia", "Cavalcanti", "Teixeira", "Pinto",
  "Nunes", "Freitas", "Machado", "Ramos", "Melo", "Batista",
];

// slug (usado no domínio fictício), nome, sigla — mesma origem usada nos
// campos cidade/estado do Salao.
export const CIDADES = [
  { cidade: "São Paulo", estado: "SP" },
  { cidade: "Rio de Janeiro", estado: "RJ" },
  { cidade: "Belo Horizonte", estado: "MG" },
  { cidade: "Curitiba", estado: "PR" },
  { cidade: "Porto Alegre", estado: "RS" },
  { cidade: "Salvador", estado: "BA" },
  { cidade: "Recife", estado: "PE" },
  { cidade: "Fortaleza", estado: "CE" },
  { cidade: "Brasília", estado: "DF" },
  { cidade: "Campinas", estado: "SP" },
  { cidade: "Florianópolis", estado: "SC" },
  { cidade: "Goiânia", estado: "GO" },
  { cidade: "Vitória", estado: "ES" },
  { cidade: "Manaus", estado: "AM" },
  { cidade: "Natal", estado: "RN" },
];

// Blocos de nome de negócio — combinados na hora (ver geradores.js) pra
// gerar dezenas de nomes plausíveis sem repetir e sem precisar de uma lista
// gigante escrita à mão.
export const PALAVRAS_NOME_NEGOCIO = {
  FEMININO: {
    prefixos: ["Bella", "Charme", "Espaço", "Studio", "Ateliê", "Flor de", "Essência", "Belle"],
    nucleos: ["Donna", "Mulher", "Beleza", "Elegance", "Encanto", "Glamour", "Vaidade", "Diva"],
  },
  BARBEARIA: {
    prefixos: ["Barbearia", "Barber", "Old School", "Império", "Clube"],
    nucleos: ["do Zé", "Real", "Tradição", "Navalha de Ouro", "Cavalheiros", "União"],
  },
  UNISSEX: {
    prefixos: ["Studio", "Espaço", "Estúdio", "Conceito"],
    nucleos: ["Hair", "Visual", "Estilo", "Unissex", "Beauty Center"],
  },
  ESTETICA: {
    prefixos: ["Clínica", "Espaço", "Instituto", "Studio"],
    nucleos: ["de Estética", "Renove", "Pele & Cia", "Bem Estar", "Rejuvenesce"],
  },
  OUTROS: {
    prefixos: ["Studio", "Espaço", "Casa"],
    nucleos: ["da Beleza", "do Bem Estar", "Prime Beauty", "Center"],
  },
};

export const NOMES_PRODUTO_POR_CATEGORIA = {
  Cabelo: ["Shampoo Hidratante", "Condicionador Reparador", "Máscara de Reconstrução", "Óleo Finalizador", "Leave-in", "Spray Protetor Térmico"],
  Barba: ["Óleo para Barba", "Balm Modelador", "Shampoo para Barba", "Pente de Madeira"],
  Unhas: ["Esmalte Gel", "Base Fortalecedora", "Removedor de Cutícula", "Óleo para Cutículas"],
  Skincare: ["Sérum Facial", "Protetor Solar FPS 50", "Água Micelar", "Creme Hidratante Facial"],
  Estética: ["Creme Redutor de Medidas", "Óleo de Massagem", "Argila Verde", "Manta Térmica Descartável"],
};

export const MOTIVOS_AUSENCIA = ["Férias", "Consulta médica", "Compromisso pessoal", "Capacitação/curso"];

// Catálogo de serviço por categoria — mesmos nomes/preços de referência já
// usados em prisma/seed.js, só reorganizados por segmento e ampliados.
export const SERVICOS_POR_CATEGORIA = {
  FEMININO: [
    { nome: "Corte feminino", precoCentavos: 8000, duracaoMinutos: 45 },
    { nome: "Escova", precoCentavos: 6000, duracaoMinutos: 40 },
    { nome: "Coloração", precoCentavos: 15000, duracaoMinutos: 120 },
    { nome: "Mechas / Luzes", precoCentavos: 18000, duracaoMinutos: 150 },
    { nome: "Hidratação", precoCentavos: 7000, duracaoMinutos: 45 },
    { nome: "Penteado para festa", precoCentavos: 12000, duracaoMinutos: 60 },
    { nome: "Manicure", precoCentavos: 4000, duracaoMinutos: 40 },
    { nome: "Pedicure", precoCentavos: 4500, duracaoMinutos: 40 },
    { nome: "Design de sobrancelha", precoCentavos: 2500, duracaoMinutos: 15 },
    { nome: "Maquiagem", precoCentavos: 15000, duracaoMinutos: 60 },
  ],
  BARBEARIA: [
    { nome: "Corte masculino", precoCentavos: 5000, duracaoMinutos: 30 },
    { nome: "Barba", precoCentavos: 3500, duracaoMinutos: 20 },
    { nome: "Corte + Barba", precoCentavos: 8000, duracaoMinutos: 50 },
    { nome: "Sobrancelha na navalha", precoCentavos: 1500, duracaoMinutos: 10 },
    { nome: "Corte infantil", precoCentavos: 4000, duracaoMinutos: 30 },
    { nome: "Pézinho", precoCentavos: 1500, duracaoMinutos: 10 },
    { nome: "Relaxamento capilar", precoCentavos: 9000, duracaoMinutos: 60 },
  ],
  UNISSEX: [
    { nome: "Corte", precoCentavos: 6000, duracaoMinutos: 40 },
    { nome: "Escova", precoCentavos: 5500, duracaoMinutos: 35 },
    { nome: "Hidratação", precoCentavos: 7000, duracaoMinutos: 45 },
    { nome: "Coloração", precoCentavos: 14000, duracaoMinutos: 110 },
    { nome: "Manicure", precoCentavos: 4000, duracaoMinutos: 40 },
    { nome: "Barba", precoCentavos: 3500, duracaoMinutos: 20 },
    { nome: "Design de sobrancelha", precoCentavos: 2500, duracaoMinutos: 15 },
  ],
  ESTETICA: [
    { nome: "Limpeza de pele", precoCentavos: 12000, duracaoMinutos: 60 },
    { nome: "Massagem relaxante", precoCentavos: 15000, duracaoMinutos: 60 },
    { nome: "Drenagem linfática", precoCentavos: 13000, duracaoMinutos: 50 },
    { nome: "Peeling facial", precoCentavos: 18000, duracaoMinutos: 45 },
    { nome: "Radiofrequência", precoCentavos: 20000, duracaoMinutos: 45 },
    { nome: "Depilação a laser", precoCentavos: 25000, duracaoMinutos: 30 },
    { nome: "Microagulhamento", precoCentavos: 22000, duracaoMinutos: 60 },
    { nome: "Massagem modeladora", precoCentavos: 16000, duracaoMinutos: 50 },
  ],
  OUTROS: [
    { nome: "Corte", precoCentavos: 6000, duracaoMinutos: 40 },
    { nome: "Manicure", precoCentavos: 4000, duracaoMinutos: 40 },
    { nome: "Pedicure", precoCentavos: 4500, duracaoMinutos: 40 },
    { nome: "Massagem relaxante", precoCentavos: 15000, duracaoMinutos: 60 },
    { nome: "Design de sobrancelha", precoCentavos: 2500, duracaoMinutos: 15 },
  ],
};

export const ESPECIALIDADES_POR_CATEGORIA = {
  FEMININO: ["Coloração e mechas", "Cortes femininos", "Penteados e finalização", "Manicure e pedicure"],
  BARBEARIA: ["Cortes masculinos e barba", "Navalha e acabamento", "Coloração masculina"],
  UNISSEX: ["Cortes e coloração", "Barba e cabelo", "Tratamentos capilares"],
  ESTETICA: ["Limpeza de pele e peeling", "Massoterapia", "Procedimentos faciais", "Depilação"],
  OUTROS: ["Atendimento geral"],
};

export const CATEGORIAS_PRODUTO = ["Cabelo", "Barba", "Unhas", "Skincare", "Estética"];
