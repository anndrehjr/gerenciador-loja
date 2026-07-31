import { test } from "node:test";
import assert from "node:assert/strict";
import {
  definirSemente,
  aleatorio,
  inteiroEntre,
  escolher,
  escolherPonderado,
  embaralhar,
  ruidoGaussiano,
  pesoDiaSemana,
  pesoMes,
  minutoDoDia,
  gerarCpfFalso,
  gerarCnpjFalso,
  gerarTelefoneFalso,
  normalizarParaSlug,
} from "./geradores.js";

test("mesma semente sempre gera a mesma sequência (determinístico)", () => {
  definirSemente(123);
  const a = [aleatorio(), aleatorio(), aleatorio()];
  definirSemente(123);
  const b = [aleatorio(), aleatorio(), aleatorio()];
  assert.deepEqual(a, b);
});

test("aleatorio() sempre fica entre 0 e 1", () => {
  definirSemente(1);
  for (let i = 0; i < 200; i++) {
    const v = aleatorio();
    assert.ok(v >= 0 && v < 1, `valor fora do intervalo: ${v}`);
  }
});

test("inteiroEntre nunca sai da faixa pedida", () => {
  definirSemente(7);
  for (let i = 0; i < 200; i++) {
    const v = inteiroEntre(5, 10);
    assert.ok(v >= 5 && v <= 10);
  }
});

test("escolher sempre devolve um item da lista", () => {
  definirSemente(9);
  const lista = ["a", "b", "c"];
  for (let i = 0; i < 50; i++) {
    assert.ok(lista.includes(escolher(lista)));
  }
});

test("escolherPonderado nunca escolhe um item com peso zero, dado peso suficiente nos outros", () => {
  definirSemente(3);
  const itens = [{ valor: "nunca", peso: 0 }, { valor: "sempre", peso: 100 }];
  for (let i = 0; i < 100; i++) {
    assert.equal(escolherPonderado(itens), "sempre");
  }
});

test("embaralhar preserva todos os elementos, só muda a ordem", () => {
  definirSemente(11);
  const original = [1, 2, 3, 4, 5];
  const embaralhado = embaralhar(original);
  assert.deepEqual([...embaralhado].sort(), original);
});

test("ruidoGaussiano fica concentrado perto de zero (maioria dentro de 3 desvios)", () => {
  definirSemente(21);
  let dentro = 0;
  const total = 500;
  for (let i = 0; i < total; i++) {
    if (Math.abs(ruidoGaussiano(1)) <= 3) dentro++;
  }
  assert.ok(dentro / total > 0.99);
});

test("pesoDiaSemana dá mais peso pra sexta/sábado que pra domingo", () => {
  const domingo = new Date("2026-01-04T12:00:00"); // domingo
  const sexta = new Date("2026-01-09T12:00:00"); // sexta
  assert.ok(pesoDiaSemana(sexta) > pesoDiaSemana(domingo));
});

test("pesoMes dá mais peso pra dezembro que pra janeiro", () => {
  const janeiro = new Date("2026-01-15T12:00:00");
  const dezembro = new Date("2026-12-15T12:00:00");
  assert.ok(pesoMes(dezembro) > pesoMes(janeiro));
});

test("minutoDoDia sempre fica dentro do expediente (9h-19h)", () => {
  definirSemente(5);
  for (let i = 0; i < 100; i++) {
    const m = minutoDoDia();
    assert.ok(m >= 9 * 60 && m <= 19 * 60);
  }
});

test("gerarCpfFalso e gerarCnpjFalso têm o formato esperado", () => {
  assert.match(gerarCpfFalso(), /^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  assert.match(gerarCnpjFalso(), /^\d{2}\.\d{3}\.\d{3}\/0001-\d{2}$/);
});

test("gerarTelefoneFalso tem o formato de celular brasileiro", () => {
  assert.match(gerarTelefoneFalso(), /^\(\d{2}\) 9\d{4}-\d{4}$/);
});

test("normalizarParaSlug remove acento e espaço", () => {
  assert.equal(normalizarParaSlug("Bella Donna Salão & Spa"), "bella-donna-salao-spa");
});
