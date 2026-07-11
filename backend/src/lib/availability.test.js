import { test } from "node:test";
import assert from "node:assert/strict";
import { computeFreeSlots, isWithinWindows, minutesToLabel } from "./availability.js";

test("minutesToLabel formata HH:mm com zero à esquerda", () => {
  assert.equal(minutesToLabel(0), "00:00");
  assert.equal(minutesToLabel(9 * 60), "09:00");
  assert.equal(minutesToLabel(9 * 60 + 5), "09:05");
  assert.equal(minutesToLabel(23 * 60 + 45), "23:45");
});

test("computeFreeSlots gera slots alinhados ao início da janela", () => {
  const slots = computeFreeSlots({
    windows: [{ startMinute: 9 * 60, endMinute: 10 * 60 }],
    durationMinutes: 30,
  });
  assert.deepEqual(slots, ["09:00", "09:15", "09:30"]);
});

test("computeFreeSlots não sugere horário que estoura o fim da janela", () => {
  const slots = computeFreeSlots({
    windows: [{ startMinute: 9 * 60, endMinute: 9 * 60 + 40 }],
    durationMinutes: 30,
  });
  // 09:00 (termina 09:30, ok) e 09:15 estouraria (terminaria 09:45 > 09:40)
  assert.deepEqual(slots, ["09:00"]);
});

test("computeFreeSlots exclui horários que colidem com agendamentos existentes", () => {
  const slots = computeFreeSlots({
    windows: [{ startMinute: 9 * 60, endMinute: 11 * 60 }],
    busyRanges: [[9 * 60 + 30, 10 * 60]], // ocupado das 09:30 às 10:00
    durationMinutes: 30,
  });
  assert.ok(!slots.includes("09:15")); // terminaria 09:45, colide
  assert.ok(!slots.includes("09:30"));
  assert.ok(!slots.includes("09:45")); // começa antes das 10:00, colide
  assert.ok(slots.includes("09:00"));
  assert.ok(slots.includes("10:00"));
});

test("computeFreeSlots respeita turno dividido (duas janelas no mesmo dia)", () => {
  const slots = computeFreeSlots({
    windows: [
      { startMinute: 9 * 60, endMinute: 9 * 60 + 30 },
      { startMinute: 14 * 60, endMinute: 14 * 60 + 30 },
    ],
    durationMinutes: 30,
  });
  assert.deepEqual(slots, ["09:00", "14:00"]);
});

test("computeFreeSlots respeita minStartMinute (exclui horários passados hoje)", () => {
  const slots = computeFreeSlots({
    windows: [{ startMinute: 9 * 60, endMinute: 11 * 60 }],
    durationMinutes: 30,
    minStartMinute: 10 * 60,
  });
  assert.ok(!slots.includes("09:00"));
  assert.ok(!slots.includes("09:45"));
  assert.ok(slots.includes("10:00"));
});

test("computeFreeSlots sem janelas devolve lista vazia (dia sem expediente)", () => {
  const slots = computeFreeSlots({ windows: [], durationMinutes: 30 });
  assert.deepEqual(slots, []);
});

test("isWithinWindows aceita intervalo totalmente dentro de uma janela", () => {
  const windows = [{ startMinute: 9 * 60, endMinute: 12 * 60 }];
  assert.equal(isWithinWindows(9 * 60, 9 * 60 + 30, windows), true);
  assert.equal(isWithinWindows(11 * 60 + 30, 12 * 60, windows), true);
});

test("isWithinWindows rejeita intervalo que ultrapassa a janela", () => {
  const windows = [{ startMinute: 9 * 60, endMinute: 12 * 60 }];
  assert.equal(isWithinWindows(11 * 60 + 45, 12 * 60 + 15, windows), false);
  assert.equal(isWithinWindows(8 * 60, 9 * 60 + 30, windows), false);
});

test("isWithinWindows considera turno dividido", () => {
  const windows = [
    { startMinute: 9 * 60, endMinute: 12 * 60 },
    { startMinute: 14 * 60, endMinute: 18 * 60 },
  ];
  assert.equal(isWithinWindows(14 * 60, 14 * 60 + 30, windows), true);
  assert.equal(isWithinWindows(12 * 60 + 30, 13 * 60, windows), false); // no horário de almoço
});
