import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularHorariosLivres, estaDentroJanelas, minutosParaRotulo } from "./disponibilidade.js";

test("minutosParaRotulo formata HH:mm com zero à esquerda", () => {
  assert.equal(minutosParaRotulo(0), "00:00");
  assert.equal(minutosParaRotulo(9 * 60), "09:00");
  assert.equal(minutosParaRotulo(9 * 60 + 5), "09:05");
  assert.equal(minutosParaRotulo(23 * 60 + 45), "23:45");
});

test("calcularHorariosLivres gera horários alinhados ao início da janela", () => {
  const horarios = calcularHorariosLivres({
    janelas: [{ minutoInicio: 9 * 60, minutoFim: 10 * 60 }],
    duracaoMinutos: 30,
  });
  assert.deepEqual(horarios, ["09:00", "09:15", "09:30"]);
});

test("calcularHorariosLivres não sugere horário que estoura o fim da janela", () => {
  const horarios = calcularHorariosLivres({
    janelas: [{ minutoInicio: 9 * 60, minutoFim: 9 * 60 + 40 }],
    duracaoMinutos: 30,
  });
  // 09:00 (termina 09:30, ok) e 09:15 estouraria (terminaria 09:45 > 09:40)
  assert.deepEqual(horarios, ["09:00"]);
});

test("calcularHorariosLivres exclui horários que colidem com agendamentos existentes", () => {
  const horarios = calcularHorariosLivres({
    janelas: [{ minutoInicio: 9 * 60, minutoFim: 11 * 60 }],
    intervalosOcupados: [[9 * 60 + 30, 10 * 60]], // ocupado das 09:30 às 10:00
    duracaoMinutos: 30,
  });
  assert.ok(!horarios.includes("09:15")); // terminaria 09:45, colide
  assert.ok(!horarios.includes("09:30"));
  assert.ok(!horarios.includes("09:45")); // começa antes das 10:00, colide
  assert.ok(horarios.includes("09:00"));
  assert.ok(horarios.includes("10:00"));
});

test("calcularHorariosLivres respeita turno dividido (duas janelas no mesmo dia)", () => {
  const horarios = calcularHorariosLivres({
    janelas: [
      { minutoInicio: 9 * 60, minutoFim: 9 * 60 + 30 },
      { minutoInicio: 14 * 60, minutoFim: 14 * 60 + 30 },
    ],
    duracaoMinutos: 30,
  });
  assert.deepEqual(horarios, ["09:00", "14:00"]);
});

test("calcularHorariosLivres respeita minutoInicioMinimo (exclui horários passados hoje)", () => {
  const horarios = calcularHorariosLivres({
    janelas: [{ minutoInicio: 9 * 60, minutoFim: 11 * 60 }],
    duracaoMinutos: 30,
    minutoInicioMinimo: 10 * 60,
  });
  assert.ok(!horarios.includes("09:00"));
  assert.ok(!horarios.includes("09:45"));
  assert.ok(horarios.includes("10:00"));
});

test("calcularHorariosLivres sem janelas devolve lista vazia (dia sem expediente)", () => {
  const horarios = calcularHorariosLivres({ janelas: [], duracaoMinutos: 30 });
  assert.deepEqual(horarios, []);
});

test("estaDentroJanelas aceita intervalo totalmente dentro de uma janela", () => {
  const janelas = [{ minutoInicio: 9 * 60, minutoFim: 12 * 60 }];
  assert.equal(estaDentroJanelas(9 * 60, 9 * 60 + 30, janelas), true);
  assert.equal(estaDentroJanelas(11 * 60 + 30, 12 * 60, janelas), true);
});

test("estaDentroJanelas rejeita intervalo que ultrapassa a janela", () => {
  const janelas = [{ minutoInicio: 9 * 60, minutoFim: 12 * 60 }];
  assert.equal(estaDentroJanelas(11 * 60 + 45, 12 * 60 + 15, janelas), false);
  assert.equal(estaDentroJanelas(8 * 60, 9 * 60 + 30, janelas), false);
});

test("estaDentroJanelas considera turno dividido", () => {
  const janelas = [
    { minutoInicio: 9 * 60, minutoFim: 12 * 60 },
    { minutoInicio: 14 * 60, minutoFim: 18 * 60 },
  ];
  assert.equal(estaDentroJanelas(14 * 60, 14 * 60 + 30, janelas), true);
  assert.equal(estaDentroJanelas(12 * 60 + 30, 13 * 60, janelas), false); // no horário de almoço
});
