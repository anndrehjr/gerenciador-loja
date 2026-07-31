import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePaginacao } from "./paginacao.js";

test("sem query params, usa página 1 e o limite padrão (100)", () => {
  const { pagina, limite, skip, take } = parsePaginacao({});
  assert.equal(pagina, 1);
  assert.equal(limite, 100);
  assert.equal(skip, 0);
  assert.equal(take, 100);
});

test("calcula skip corretamente a partir da página", () => {
  assert.equal(parsePaginacao({ pagina: "3", limite: "20" }).skip, 40);
  assert.equal(parsePaginacao({ pagina: "1", limite: "20" }).skip, 0);
});

test("nunca deixa o limite passar do teto (200)", () => {
  assert.equal(parsePaginacao({ limite: "9999" }).limite, 200);
});

test("valores inválidos ou negativos caem no mínimo seguro", () => {
  assert.equal(parsePaginacao({ pagina: "-5", limite: "0" }).pagina, 1);
  assert.equal(parsePaginacao({ pagina: "abc", limite: "abc" }).limite, 100);
});
