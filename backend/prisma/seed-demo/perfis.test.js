import { test } from "node:test";
import assert from "node:assert/strict";
import { definirSemente } from "./geradores.js";
import {
  PERFIS_CLIENTE,
  sortearPerfilCliente,
  DISTRIBUICAO_STATUS_PASSADO,
  sortearStatusPassado,
  sortearStatusFuturo,
  sortearMetodoPagamento,
  PORTES_EMPRESA,
  sortearPorteEmpresa,
  sortearPopularidadeProfissional,
} from "./perfis.js";

test("sortearPerfilCliente sempre devolve um perfil válido da lista", () => {
  definirSemente(1);
  const chaves = new Set(PERFIS_CLIENTE.map((p) => p.chave));
  for (let i = 0; i < 100; i++) {
    const perfil = sortearPerfilCliente();
    assert.ok(chaves.has(perfil.chave));
  }
});

test("a maioria dos atendimentos passados sorteados é CONCLUIDO (é o maior peso)", () => {
  definirSemente(2);
  const contagem = { CONCLUIDO: 0, CANCELADO: 0, NAO_COMPARECEU: 0 };
  const total = 1000;
  for (let i = 0; i < total; i++) contagem[sortearStatusPassado()]++;
  assert.ok(contagem.CONCLUIDO / total > 0.7, `CONCLUIDO deveria dominar, veio ${contagem.CONCLUIDO}/${total}`);
});

test("sortearStatusFuturo só devolve AGENDADO ou CONFIRMADO", () => {
  definirSemente(3);
  for (let i = 0; i < 100; i++) {
    assert.ok(["AGENDADO", "CONFIRMADO"].includes(sortearStatusFuturo()));
  }
});

test("sortearMetodoPagamento só devolve um método válido", () => {
  definirSemente(4);
  for (let i = 0; i < 100; i++) {
    assert.ok(["PIX", "CARTAO", "DINHEIRO"].includes(sortearMetodoPagamento()));
  }
});

test("sortearPorteEmpresa devolve faixas de usuários/clientes coerentes com o porte", () => {
  definirSemente(5);
  for (let i = 0; i < 50; i++) {
    const porte = sortearPorteEmpresa();
    assert.ok(PORTES_EMPRESA.some((p) => p.chave === porte.chave));
    assert.ok(porte.usuarios[0] <= porte.usuarios[1]);
    assert.ok(porte.clientes[0] <= porte.clientes[1]);
  }
});

test("sortearPopularidadeProfissional devolve um multiplicador positivo", () => {
  definirSemente(6);
  for (let i = 0; i < 50; i++) {
    assert.ok(sortearPopularidadeProfissional() > 0);
  }
});

test("distribuição de status passado soma pesos coerentes (sanity check da tabela)", () => {
  const total = DISTRIBUICAO_STATUS_PASSADO.reduce((s, i) => s + i.peso, 0);
  assert.equal(total, 100);
});
