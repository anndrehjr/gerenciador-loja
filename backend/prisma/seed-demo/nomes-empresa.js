import { escolher, inteiroEntre } from "./geradores.js";
import { PALAVRAS_NOME_NEGOCIO } from "./dados-brasileiros.js";

// Combina prefixo + núcleo (ex.: "Bella" + "Donna" = "Bella Donna") pra
// gerar dezenas de nomes plausíveis por categoria sem precisar escrever uma
// lista gigante à mão nem repetir. `usados` evita duas empresas com o mesmo
// nome na mesma leva do seed.
export function gerarNomeEmpresa(categoria, usados = new Set()) {
  const banco = PALAVRAS_NOME_NEGOCIO[categoria] || PALAVRAS_NOME_NEGOCIO.OUTROS;
  for (let tentativa = 0; tentativa < 30; tentativa++) {
    const nome = `${escolher(banco.prefixos)} ${escolher(banco.nucleos)}`;
    if (!usados.has(nome)) {
      usados.add(nome);
      return nome;
    }
  }
  // Esgotou as combinações plausíveis (leva muito grande) — acrescenta um
  // número em vez de travar; ainda assim continua um nome de negócio legível.
  const nome = `${escolher(banco.prefixos)} ${escolher(banco.nucleos)} ${inteiroEntre(2, 99)}`;
  usados.add(nome);
  return nome;
}
