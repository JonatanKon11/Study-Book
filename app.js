const STORAGE_KEY = "diario-estudio-sesiones";

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getHeatMapPeriod(today) {
  const firstWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysSinceMonday = (firstWeek.getDay() + 6) % 7;
  firstWeek.setDate(firstWeek.getDate() - daysSinceMonday - 77);

  const dates = [];
  const cursor = new Date(firstWeek.getFullYear(), firstWeek.getMonth(), firstWeek.getDate());
  const todayKey = getLocalDateKey(today);

  while (getLocalDateKey(cursor) <= todayKey) {
    dates.push(getLocalDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function buildHeatMapDays(sessions, today) {
  const days = getHeatMapPeriod(today).map((date) => ({
    date,
    minutes: 0,
    sessionCount: 0,
    active: false,
  }));
  const daysByDate = new Map(days.map((day) => [day.date, day]));

  sessions.forEach((session) => {
    if (!session || typeof session.date !== "string" || !isValidDateKey(session.date)) return;

    const minutes = Number(session.minutes);
    if (!Number.isFinite(minutes) || minutes <= 0) return;

    const day = daysByDate.get(session.date);
    if (!day) return;

    day.minutes += minutes;
    day.sessionCount += 1;
    day.active = true;
  });

  return getHeatMapIntensity(days);
}

function getHeatMapIntensity(days) {
  const activeDays = days.filter((day) => day.active);
  if (activeDays.length === 0) {
    return days.map((day) => ({ ...day, intensity: 0 }));
  }

  const minimum = Math.min(...activeDays.map((day) => day.minutes));
  const maximum = Math.max(...activeDays.map((day) => day.minutes));

  if (minimum === maximum) {
    return days.map((day) => ({ ...day, intensity: day.active ? 2 : 0 }));
  }

  const interval = (maximum - minimum) / 4;
  return days.map((day) => {
    if (!day.active) return { ...day, intensity: 0 };

    const level = Math.min(3, Math.floor((day.minutes - minimum) / interval)) + 1;
    return { ...day, intensity: level };
  });
}

function isValidDateKey(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
}

function isValidSession(session) {
  return Boolean(session)
    && typeof session.topic === "string"
    && Boolean(session.topic.trim())
    && typeof session.date === "string"
    && isValidDateKey(session.date)
    && Number.isFinite(Number(session.minutes))
    && Number(session.minutes) > 0;
}

function loadSessions(storage) {
  try {
    const storedValue = storage.getItem(STORAGE_KEY);
    if (storedValue === null) return { sessions: [], canSave: true };

    const storedSessions = JSON.parse(storedValue);
    if (!Array.isArray(storedSessions)) return { sessions: [], canSave: false };

    return { sessions: storedSessions, canSave: true };
  } catch {
    return { sessions: [], canSave: false };
  }
}

function saveSessions(storage, sessions) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return true;
  } catch {
    return false;
  }
}

function getCurrentStreak(sessions, today) {
  const todayKey = getLocalDateKey(today);
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);
  const studiedDays = new Set(sessions.filter(isValidSession).map((session) => session.date));

  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!studiedDays.has(todayKey)) {
    if (!studiedDays.has(yesterdayKey)) return 0;
    cursor = yesterday;
  }

  let streak = 0;
  while (studiedDays.has(getLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function getBestStreak(sessions, today) {
  const todayKey = getLocalDateKey(today);
  const studiedDays = [...new Set(sessions
    .filter(isValidSession)
    .map((session) => session.date)
    .filter((date) => date <= todayKey))].sort();

  let currentStreak = 0;
  let bestStreak = 0;
  let previousDate = null;

  studiedDays.forEach((date) => {
    if (previousDate && getNextLocalDateKey(previousDate) === date) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    bestStreak = Math.max(bestStreak, currentStreak);
    previousDate = date;
  });

  return bestStreak;
}

function getWeeklyMinutes(sessions, today) {
  const todayKey = getLocalDateKey(today);
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysSinceMonday = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);
  const weekStartKey = getLocalDateKey(weekStart);

  return sessions
    .filter((session) => isValidSession(session)
      && session.date >= weekStartKey
      && session.date <= todayKey)
    .reduce((total, session) => total + Number(session.minutes), 0);
}

function getStudiedDaysThisMonth(sessions, today) {
  const currentMonth = getLocalDateKey(today).slice(0, 7);
  const todayKey = getLocalDateKey(today);

  return new Set(sessions
    .filter(isValidSession)
    .map((session) => session.date)
    .filter((date) => date.startsWith(`${currentMonth}-`) && date <= todayKey)).size;
}

function getNextLocalDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return getLocalDateKey(new Date(year, month - 1, day + 1));
}

function formatDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(localDate);
}

function formatMinutes(minutes) {
  const formatted = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(minutes);
  return `${formatted} min`;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function render() {
  const orderedSessions = [...sessions].sort((first, second) => {
    const byDate = second.date.localeCompare(first.date);
    return byDate || Number(second.createdAt || 0) - Number(first.createdAt || 0);
  });

  sessionList.replaceChildren();
  orderedSessions.forEach((session) => {
    const item = document.createElement("li");
    item.className = "session-item";

    const date = document.createElement("time");
    date.className = "session-date";
    date.dateTime = session.date;
    date.textContent = formatDate(session.date);

    const topic = document.createElement("span");
    topic.className = "session-topic";
    topic.textContent = session.topic;

    const minutes = document.createElement("span");
    minutes.className = "session-minutes";
    minutes.textContent = formatMinutes(Number(session.minutes));

    item.append(date, topic, minutes);
    sessionList.append(item);
  });

  emptyState.hidden = orderedSessions.length > 0;
  sessionCount.textContent = `${orderedSessions.length} ${orderedSessions.length === 1 ? "sesión" : "sesiones"}`;
  updateStreak();
}

function updateStreak() {
  const streak = getCurrentStreak();
  streakCount.textContent = String(streak);
  bestStreakCount.textContent = String(getBestStreak());
  weeklyMinutes.textContent = formatMinutes(getWeeklyMinutes());
  const studiedDaysThisMonth = getStudiedDaysThisMonth();
  monthlyStudyDays.textContent = `${studiedDaysThisMonth} ${studiedDaysThisMonth === 1 ? "día" : "días"}`;

  const today = getLocalDateKey(new Date());
  const studiedToday = sessions.some((session) => session.date === today);

  if (streak === 0) {
    streakMessage.textContent = "Empieza hoy para encender tu racha.";
  } else if (studiedToday) {
    streakMessage.textContent = "¡Hoy ya sumaste a tu racha!";
  } else {
    streakMessage.textContent = "Tu racha sigue activa; hoy aún puedes continuarla.";
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getLocalDateKey,
    getHeatMapPeriod,
    buildHeatMapDays,
    getHeatMapIntensity,
    isValidSession,
    loadSessions,
    saveSessions,
    getCurrentStreak,
    getBestStreak,
    getWeeklyMinutes,
    getStudiedDaysThisMonth,
  };
}

if (typeof document !== "undefined") {
  startApp();
}

function startApp() {
  const form = document.querySelector("#session-form");
  const dateInput = document.querySelector("#session-date");
  const topicInput = document.querySelector("#session-topic");
  const minutesInput = document.querySelector("#session-minutes");
  const formStatus = document.querySelector("#form-status");
  const sessionList = document.querySelector("#session-list");
  const emptyState = document.querySelector("#empty-state");
  const sessionCount = document.querySelector("#session-count");
  const streakCount = document.querySelector("#streak-count");
  const bestStreakCount = document.querySelector("#best-streak-count");
  const weeklyMinutes = document.querySelector("#weekly-minutes");
  const monthlyStudyDays = document.querySelector("#monthly-study-days");
  const streakMessage = document.querySelector("#streak-message");
  const heatMapMonths = document.querySelector("#heatmap-months");
  const heatMapWeeks = document.querySelector("#heatmap-weeks");
  const heatMapEmpty = document.querySelector("#heatmap-empty");
  const heatMapDetail = document.querySelector("#heatmap-detail");
  const loadedData = loadSessions(window.localStorage);
  const sessions = loadedData.sessions;
  const canSaveSessions = loadedData.canSave;

  dateInput.value = getLocalDateKey(new Date());
  render();
  if (!canSaveSessions) {
    formStatus.textContent = "No se pudieron leer tus sesiones; no se han modificado.";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!canSaveSessions) {
      formStatus.textContent = "No se pudieron leer tus sesiones; no se han modificado.";
      return;
    }

    const topic = topicInput.value.trim();
    const minutes = Number(minutesInput.value);

    if (!topic) {
      topicInput.setCustomValidity("Escribe el tema que has estudiado.");
      topicInput.reportValidity();
      return;
    }

    if (!Number.isFinite(minutes) || minutes <= 0) {
      minutesInput.setCustomValidity("Introduce un número de minutos mayor que cero.");
      minutesInput.reportValidity();
      return;
    }

    topicInput.setCustomValidity("");
    minutesInput.setCustomValidity("");

    sessions.push({
      id: createId(),
      date: dateInput.value,
      topic,
      minutes,
      createdAt: Date.now(),
    });

    if (!saveSessions(window.localStorage, sessions)) {
      sessions.pop();
      formStatus.textContent = "No se pudo guardar en este navegador.";
      render();
      return;
    }

    form.reset();
    dateInput.value = getLocalDateKey(new Date());
    formStatus.textContent = "Sesión guardada.";
    render();
  });

  topicInput.addEventListener("input", () => topicInput.setCustomValidity(""));
  minutesInput.addEventListener("input", () => minutesInput.setCustomValidity(""));

  function formatDate(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(localDate);
  }

  function formatMinutes(minutes) {
    const formatted = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(minutes);
    return `${formatted} min`;
  }

  function createId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function render() {
    const today = new Date();
    const visibleSessions = sessions.filter(isValidSession);
    const orderedSessions = [...visibleSessions].sort((first, second) => {
      const byDate = second.date.localeCompare(first.date);
      return byDate || Number(second.createdAt || 0) - Number(first.createdAt || 0);
    });

    sessionList.replaceChildren();
    orderedSessions.forEach((session) => {
      const item = document.createElement("li");
      item.className = "session-item";

      const date = document.createElement("time");
      date.className = "session-date";
      date.dateTime = session.date;
      date.textContent = formatDate(session.date);

      const topic = document.createElement("span");
      topic.className = "session-topic";
      topic.textContent = session.topic;

      const minutes = document.createElement("span");
      minutes.className = "session-minutes";
      minutes.textContent = formatMinutes(Number(session.minutes));

      item.append(date, topic, minutes);
      sessionList.append(item);
    });

    emptyState.hidden = orderedSessions.length > 0;
    sessionCount.textContent = `${orderedSessions.length} ${orderedSessions.length === 1 ? "sesión" : "sesiones"}`;
    updateSummary(today);
    renderHeatMap(today);
  }

  function updateSummary(today) {
    const streak = getCurrentStreak(sessions, today);
    streakCount.textContent = String(streak);
    bestStreakCount.textContent = String(getBestStreak(sessions, today));
    weeklyMinutes.textContent = formatMinutes(getWeeklyMinutes(sessions, today));

    const studiedDaysThisMonth = getStudiedDaysThisMonth(sessions, today);
    monthlyStudyDays.textContent = `${studiedDaysThisMonth} ${studiedDaysThisMonth === 1 ? "día" : "días"}`;

    const studiedToday = sessions.some((session) => isValidSession(session)
      && session.date === getLocalDateKey(today));

    if (streak === 0) {
      streakMessage.textContent = "Empieza hoy para encender tu racha.";
    } else if (studiedToday) {
      streakMessage.textContent = "¡Hoy ya sumaste a tu racha!";
    } else {
      streakMessage.textContent = "Tu racha sigue activa; hoy aún puedes continuarla.";
    }
  }

  function renderHeatMap(today) {
    const heatMapDays = buildHeatMapDays(sessions, today);
    const weekCount = Math.ceil(heatMapDays.length / 7);
    const weeks = Array.from({ length: weekCount }, () => []);
    const monthLabels = new Map();

    heatMapDays.forEach((day, index) => {
      const weekIndex = Math.floor(index / 7);
      weeks[weekIndex].push(day);
      if (index === 0 || day.date.slice(-2) === "01") {
        monthLabels.set(weekIndex, formatMonth(day.date));
      }
    });

    heatMapMonths.replaceChildren();
    const monthSpacer = document.createElement("span");
    monthSpacer.className = "heatmap-axis-spacer";
    heatMapMonths.append(monthSpacer);

    monthLabels.forEach((month, weekIndex) => {
      const label = document.createElement("span");
      label.className = "heatmap-month-label";
      label.style.gridColumnStart = String(weekIndex + 2);
      label.textContent = month;
      heatMapMonths.append(label);
    });

    heatMapWeeks.replaceChildren();
    weeks.forEach((weekDays) => {
      const week = document.createElement("div");
      week.className = "heatmap-week";
      week.setAttribute("role", "group");
      week.setAttribute("aria-label", `Semana del ${formatAccessibleDate(weekDays[0].date)}`);

      weekDays.forEach((day) => {
        week.append(createHeatMapCell(day));
      });

      for (let dayIndex = weekDays.length; dayIndex < 7; dayIndex += 1) {
        const futureSpace = document.createElement("span");
        futureSpace.className = "heatmap-future-space";
        futureSpace.setAttribute("aria-hidden", "true");
        week.append(futureSpace);
      }

      heatMapWeeks.append(week);
    });

    const activeDays = heatMapDays.filter((day) => day.active);
    heatMapEmpty.hidden = activeDays.length > 0;
  }

  function createHeatMapCell(day) {
    const accessibleDate = formatAccessibleDate(day.date);
    const accessibleSummary = day.active
      ? `${formatMinutes(day.minutes)}, ${day.sessionCount} ${day.sessionCount === 1 ? "sesión" : "sesiones"}`
      : "sin actividad";
    const label = `${accessibleDate}: ${accessibleSummary}`;
    const cell = document.createElement(day.active ? "button" : "div");

    if (day.active) cell.type = "button";
    cell.className = "heatmap-day";
    cell.dataset.intensity = String(day.intensity);
    cell.setAttribute("aria-label", label);
    if (!day.active) cell.setAttribute("role", "img");

    if (day.active) {
      const showDetails = () => {
        heatMapDetail.textContent = `${accessibleDate}: ${formatMinutes(day.minutes)} en ${day.sessionCount} ${day.sessionCount === 1 ? "sesión" : "sesiones"}.`;
      };

      cell.addEventListener("pointerenter", showDetails);
      cell.addEventListener("focus", showDetails);
      cell.addEventListener("click", showDetails);
    }

    return cell;
  }

  function formatMonth(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Intl.DateTimeFormat("es-ES", { month: "short" })
      .format(new Date(year, month - 1, day));
  }

  function formatAccessibleDate(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(year, month - 1, day));
  }
}