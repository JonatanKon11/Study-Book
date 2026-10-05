const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getCurrentStreak,
  getBestStreak,
  getWeeklyMinutes,
  getStudiedDaysThisMonth,
  getHeatMapPeriod,
  buildHeatMapDays,
  getHeatMapIntensity,
  getLocalDateKey,
  isValidSession,
  loadSessions,
  saveSessions,
} = require("../app.js");

function localDate(year, month, day) {
  return new Date(year, month - 1, day);
}

function session(date, minutes = 25, extra = {}) {
  return { date, topic: "Estudio", minutes, ...extra };
}

test("la racha actual cuenta hoy y días locales consecutivos sin duplicados", () => {
  const today = localDate(2026, 10, 2);
  const sessions = [
    session("2026-09-30"),
    session("2026-10-01"),
    session("2026-10-02"),
    session("2026-10-02", 10),
    session("2026-10-03"),
  ];

  assert.equal(getCurrentStreak(sessions, today), 3);
});

test("la racha actual sigue viva hoy cuando la última sesión fue ayer", () => {
  const today = localDate(2026, 10, 2);
  const sessions = [session("2026-09-30"), session("2026-10-01")];

  assert.equal(getCurrentStreak(sessions, today), 2);
});

test("la mejor racha deduplica días e ignora fechas futuras, también al cambiar horario", () => {
  const today = localDate(2026, 3, 31);
  const sessions = [
    session("2026-03-28"),
    session("2026-03-29"),
    session("2026-03-29", 15),
    session("2026-03-30"),
    session("2026-04-01"),
  ];
  const original = structuredClone(sessions);

  assert.equal(getBestStreak(sessions, today), 3);
  assert.deepEqual(sessions, original);
});

test("los minutos semanales incluyen lunes y hoy, y excluyen fechas fuera de la semana", () => {
  const today = localDate(2024, 3, 6);
  const sessions = [
    session("2024-03-03", 100),
    session("2024-03-04", 10),
    session("2024-03-06", 30),
    session("2024-03-07", 900),
  ];

  assert.equal(getWeeklyMinutes(sessions, today), 40);
});

test("los días del mes son fechas únicas locales hasta hoy y excluyen futuros", () => {
  const today = localDate(2026, 10, 2);
  const sessions = [
    session("2026-09-30"),
    session("2026-10-01"),
    session("2026-10-01", 10),
    session("2026-10-02"),
    session("2026-10-03"),
  ];

  assert.equal(getStudiedDaysThisMonth(sessions, today), 2);
});

test("la fecha local y la validación rechazan fechas imposibles", () => {
  assert.equal(getLocalDateKey(localDate(2024, 2, 29)), "2024-02-29");
  assert.equal(isValidSession(session("2024-02-29")), true);
  assert.equal(isValidSession(session("2024-02-30")), false);
});

test("cargar sesiones conserva entradas y metadatos sin filtrar datos guardados", () => {
  const stored = [
    session("2026-10-01", 30, { id: "legacy-id", createdAt: 42, customField: "keep" }),
    { date: "2026-02-30", legacyValue: "keep even if not renderable" },
  ];
  let storedValue = JSON.stringify(stored);
  const storage = {
    getItem() {
      return storedValue;
    },
    setItem(key, value) {
      storedValue = value;
    },
  };

  const result = loadSessions(storage);
  const newSession = session("2026-10-02", 15, { id: "new-session" });

  assert.equal(result.canSave, true);
  assert.deepEqual(result.sessions, stored);
  assert.equal(isValidSession(result.sessions[1]), false);
  assert.equal(saveSessions(storage, [...result.sessions, newSession]), true);
  assert.deepEqual(JSON.parse(storedValue), [...stored, newSession]);
});

test("un almacenamiento ilegible bloquea guardados para no sobrescribirlo", () => {
  let writes = 0;
  const storage = {
    getItem() {
      return "{no es JSON";
    },
    setItem() {
      writes += 1;
    },
  };

  const result = loadSessions(storage);
  const saved = result.canSave && saveSessions(storage, result.sessions);

  assert.equal(result.canSave, false);
  assert.equal(saved, false);
  assert.equal(writes, 0);
});

test("el periodo del mapa empieza el lunes de hace once semanas y termina hoy local", () => {
  const today = localDate(2024, 3, 6);
  const period = getHeatMapPeriod(today);

  assert.equal(period[0], "2023-12-18");
  assert.equal(period.at(-1), "2024-03-06");
  assert.equal(period.length, 80);
  assert.equal(period.includes("2024-03-07"), false);
});

test("el mapa suma minutos y sesiones por fecha e ignora registros inválidos y fuera del periodo", () => {
  const today = localDate(2026, 10, 3);
  const sessions = [
    session("2026-10-02", 20, { topic: "" }),
    session("2026-10-02", 35),
    session("2026-10-03", 15),
    session("2026-10-04", 90),
    session("2026-10-01", 0),
    session("2026-09-31", 25),
  ];
  const original = structuredClone(sessions);
  const days = buildHeatMapDays(sessions, today);

  assert.deepEqual(days.find((day) => day.date === "2026-10-02"), {
    date: "2026-10-02",
    minutes: 55,
    sessionCount: 2,
    active: true,
    intensity: 4,
  });
  assert.deepEqual(days.find((day) => day.date === "2026-10-03"), {
    date: "2026-10-03",
    minutes: 15,
    sessionCount: 1,
    active: true,
    intensity: 1,
  });
  assert.equal(days.some((day) => day.date === "2026-10-04"), false);
  assert.deepEqual(sessions, original);
});

test("el mapa deja en nivel cero los días sin actividad", () => {
  const today = localDate(2026, 10, 3);
  const days = buildHeatMapDays([session("2026-10-03", 20)], today);
  const leveledDays = getHeatMapIntensity(days);

  assert.equal(leveledDays.find((day) => day.date === "2026-10-03").intensity, 2);
  assert.equal(leveledDays.find((day) => day.date === "2026-10-02").intensity, 0);
});

test("los niveles relativos usan cuatro bandas con límites inferiores inclusivos", () => {
  const days = [10, 20, 30, 40, 50].map((minutes, index) => ({
    date: `2026-10-0${index + 1}`,
    minutes,
    sessionCount: 1,
    active: true,
  }));

  assert.deepEqual(getHeatMapIntensity(days).map((day) => day.intensity), [1, 2, 3, 4, 4]);
});

test("si todos los días activos tienen los mismos minutos reciben intensidad neutral", () => {
  const days = ["2026-10-01", "2026-10-02"].map((date) => ({
    date,
    minutes: 30,
    sessionCount: 1,
    active: true,
  }));

  assert.deepEqual(getHeatMapIntensity(days).map((day) => day.intensity), [2, 2]);
});

test("un periodo sin actividad conserva todas las fechas con intensidad cero", () => {
  const today = localDate(2024, 3, 6);
  const days = buildHeatMapDays([], today);

  assert.equal(days.length, 80);
  assert.equal(days.every((day) => !day.active && day.intensity === 0), true);
});