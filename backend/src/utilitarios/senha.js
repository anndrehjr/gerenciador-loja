import bcrypt from "bcryptjs";

const RODADAS_SAL = 12;

export function gerarHashSenha(senhaPura) {
  return bcrypt.hash(senhaPura, RODADAS_SAL);
}

export function verificarSenha(senhaPura, hash) {
  return bcrypt.compare(senhaPura, hash);
}
