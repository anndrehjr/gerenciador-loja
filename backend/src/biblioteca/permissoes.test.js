import { test } from "node:test";
import assert from "node:assert/strict";
import { papelEquipeTemAcesso, RECURSOS_POR_PAPEL } from "./permissoes.js";

test("DONO tem acesso a todos os recursos que existem na matriz", () => {
  const todosOsRecursos = new Set(Object.values(RECURSOS_POR_PAPEL).flat());
  for (const recurso of todosOsRecursos) {
    assert.equal(papelEquipeTemAcesso("DONO", recurso), true, `DONO deveria acessar "${recurso}"`);
  }
});

test("GERENTE acessa agenda/clientes/equipe, mas não financeiro nem configurações", () => {
  assert.equal(papelEquipeTemAcesso("GERENTE", "agenda"), true);
  assert.equal(papelEquipeTemAcesso("GERENTE", "clientes"), true);
  assert.equal(papelEquipeTemAcesso("GERENTE", "equipe"), true);
  assert.equal(papelEquipeTemAcesso("GERENTE", "financeiro"), false);
  assert.equal(papelEquipeTemAcesso("GERENTE", "configuracoes"), false);
});

test("PROFISSIONAL e RECEPCIONISTA não acessam equipe nem financeiro", () => {
  for (const papel of ["PROFISSIONAL", "RECEPCIONISTA"]) {
    assert.equal(papelEquipeTemAcesso(papel, "equipe"), false, `${papel} não deveria acessar equipe`);
    assert.equal(papelEquipeTemAcesso(papel, "financeiro"), false, `${papel} não deveria acessar financeiro`);
    assert.equal(papelEquipeTemAcesso(papel, "agenda"), true, `${papel} deveria acessar agenda`);
    assert.equal(papelEquipeTemAcesso(papel, "clientes"), true, `${papel} deveria acessar clientes`);
  }
});

test("papel desconhecido ou ausente nunca tem acesso a nada", () => {
  assert.equal(papelEquipeTemAcesso(undefined, "agenda"), false);
  assert.equal(papelEquipeTemAcesso(null, "painel"), false);
  assert.equal(papelEquipeTemAcesso("PAPEL_QUE_NAO_EXISTE", "agenda"), false);
});
