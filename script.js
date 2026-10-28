
"use strict";

const SUPABASE_FUNCTION_URL =
  "https://dqylqfjevffjiyjeyfsz.supabase.co/functions/v1/registrar-voto";

const SUPABASE_URL =
  "https://dqylqfjevffjiyjeyfsz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_VFDtlMisspOg_thRYF7iag_XvvKDqVl";

const homeSection = document.getElementById("home-section");
const identityForm = document.getElementById("identity-form");
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const birthDateInput = document.getElementById("birth-date");
const codeSection = document.getElementById("code-section");
const codePrefixInput = document.getElementById("code-prefix");
const prefixPreview = document.getElementById("prefix-preview");
const codeSuffixInput = document.getElementById("code-suffix");
const identityError = document.getElementById("identity-error");

const surveySection = document.getElementById("survey-section");
const surveyForm = document.getElementById("survey-form");
const questionsContainer = document.getElementById("questions-container");
const surveyMessage = document.getElementById("survey-message");
const cancelSurveyButton = document.getElementById("cancel-survey");

const totalVotesElement = document.getElementById("total-votes");
const redBar = document.getElementById("red-bar");
const blueBar = document.getElementById("blue-bar");
const redResult = document.getElementById("red-result");
const blueResult = document.getElementById("blue-result");
const publicOpinions = document.getElementById("public-opinions");
const showRedOpinionsButton = document.getElementById("show-red-opinions");
const showBlueOpinionsButton = document.getElementById("show-blue-opinions");

let currentToken = "";
let currentName = "";
let selectedPosition = null;
let verificationInProgress = false;

const questions = {
  red: [
    "¿Por qué apoyas la continuidad del Gobierno actual?",
    "¿Cómo describirías tu vida cotidiana en Cuba?",
    "¿Qué es lo que más te preocupa de la situación del país?",
    "¿Qué te gustaría que mejorara en los próximos cinco años?",
    "¿Tienes oportunidades suficientes para trabajar o estudiar?",
    "¿Crees que el esfuerzo de las personas se recompensa justamente?",
    "¿Qué opinas de la corrupción en Cuba?",
    "¿Sientes que el Gobierno escucha las preocupaciones de la población?",
    "¿Cuáles son las mayores dificultades de Cuba actualmente?",
    "¿Qué impacto crees que tiene el embargo de Estados Unidos?",
    "¿Qué decisiones del Gobierno deberían cambiar?",
    "¿Qué aspectos de las decisiones de Fidel Castro valoras o cuestionas?",
    "¿Qué opinas del papel de Raúl Castro en la historia reciente?",
    "¿Qué debería hacer el liderazgo actual para mejorar la vida diaria?",
    "¿Qué aspectos del sistema actual consideras importante conservar?",
    "¿Qué cambio dentro del sistema ayudaría a vivir mejor?",
    "¿Qué oportunidades necesitan los jóvenes cubanos?",
    "¿Cómo debería ser la relación de Cuba con Estados Unidos?",
    "¿Qué cambiaría para Cuba si se normalizaran las relaciones con Estados Unidos?",
    "¿Qué tendría que ocurrir para que tuvieras más confianza en el futuro?"
  ],
  blue: [
    "¿Por qué crees que Cuba necesita un nuevo Gobierno?",
    "¿Cómo describirías tu vida cotidiana en Cuba?",
    "¿Qué es lo que más te preocupa de la situación del país?",
    "¿Qué te gustaría que mejorara en los próximos cinco años?",
    "¿Tienes oportunidades suficientes para trabajar o estudiar?",
    "¿Crees que el esfuerzo de las personas se recompensa justamente?",
    "¿Qué opinas de la corrupción y de quién debe responder por ella?",
    "¿Sientes que las autoridades escuchan las preocupaciones de la población?",
    "¿Cuáles son las mayores dificultades de Cuba actualmente?",
    "¿Qué impacto crees que tiene el embargo de Estados Unidos?",
    "¿Qué responsabilidades debería asumir el Gobierno actual?",
    "¿Qué aspectos de las decisiones de Fidel Castro valoras o cuestionas?",
    "¿Qué opinas del papel de Raúl Castro en la historia reciente?",
    "¿Qué debería cambiar primero un nuevo Gobierno?",
    "¿Qué aspectos de la vida cubana deberían protegerse durante un cambio?",
    "¿Cómo se podría evitar que un nuevo Gobierno repita los mismos errores?",
    "¿Qué oportunidades necesitan los jóvenes cubanos?",
    "¿Cómo debería ser la relación de Cuba con Estados Unidos?",
    "¿Qué tipo de ayuda internacional sería beneficiosa para Cuba?",
    "¿Qué garantías deberían existir para quienes piensen diferente?"
  ]
};

function normalizeName(value) {
  return String(value ?? "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ");
}

function parseDateOnly(value) {
  if (!value) return null;

  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function calculateAge(date) {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();

  if (
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() &&
      today.getDate() < date.getDate())
  ) {
    age--;
  }

  return age;
}

function makePrefix(date) {
  return String(date.getFullYear()).slice(-2) +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");
}

function updateBirthDateUI() {
  if (!birthDateInput || !codeSection) return;

  identityError.textContent = "";
  codeSuffixInput.value = "";

  const date = parseDateOnly(birthDateInput.value);

  if (!date) {
    codeSection.hidden = true;
    return;
  }

  const age = calculateAge(date);

  if (age < 16 || age > 100) {
    codeSection.hidden = true;
    identityError.textContent =
      "La edad debe estar entre 16 y 100 años.";
    return;
  }

  codePrefixInput.value = makePrefix(date);
  prefixPreview.textContent = codePrefixInput.value;
  codeSection.hidden = false;
}

birthDateInput?.addEventListener("change", updateBirthDateUI);

codeSuffixInput?.addEventListener("input", () => {
  codeSuffixInput.value =
    codeSuffixInput.value.replace(/\D/g, "").slice(0, 5);

  identityError.textContent = "";
});

async function sendToServer(payload) {
  const response = await fetch(SUPABASE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_PUBLISHABLE_KEY,
      "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.ok !== true) {
    throw new Error(
      result.error || "No se pudo completar la solicitud."
    );
  }

  return result;
}

function renderQuestions(position) {
  selectedPosition = position;
  questionsContainer.replaceChildren();
  surveyMessage.textContent = "";

  questions[position].forEach((questionText, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "question";

    const label = document.createElement("label");
    const textarea = document.createElement("textarea");
    const counter = document.createElement("p");

    const fieldId = `answer-${index + 1}`;

    label.htmlFor = fieldId;
    label.textContent = `${index + 1}. ${questionText}`;

    textarea.id = fieldId;
    textarea.name = fieldId;
    textarea.maxLength = 500;
    textarea.rows = 4;
    textarea.required = true;
    textarea.placeholder =
      "Escribe tu opinión (máximo 500 caracteres)";

    counter.className = "help-text";
    counter.textContent = "0/500 caracteres";

    textarea.addEventListener("input", () => {
      counter.textContent =
        `${textarea.value.length}/500 caracteres`;
    });

    wrapper.append(label, textarea, counter);
    questionsContainer.append(wrapper);
  });
}

document.querySelectorAll('input[name="position"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    renderQuestions(radio.value);
  });
});

// Verifica el nombre y el código ANTES de mostrar las preguntas.
identityForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (verificationInProgress) return;

  identityError.textContent = "";

  const firstName = normalizeName(firstNameInput?.value);
  const lastName = normalizeName(lastNameInput?.value);
  const fullName = normalizeName(`${firstName} ${lastName}`);
  const date = parseDateOnly(birthDateInput?.value);

  if (!firstName || !lastName || fullName.length < 2) {
    identityError.textContent =
      "Introduce tu nombre y todos tus apellidos.";
    return;
  }

  if (fullName.length > 200) {
    identityError.textContent =
      "El nombre completo no puede superar 200 caracteres.";
    return;
  }

  if (!date) {
    identityError.textContent =
      "Selecciona una fecha de nacimiento válida.";
    return;
  }

  const age = calculateAge(date);

  if (age < 16 || age > 100) {
    identityError.textContent =
      "La edad debe estar entre 16 y 100 años.";
    return;
  }

  const suffix = codeSuffixInput.value.trim();

  if (!/^[0-9]{5}$/.test(suffix)) {
    identityError.textContent =
      "Introduce exactamente los cinco dígitos restantes.";
    return;
  }

  const token = codePrefixInput.value + suffix;

  verificationInProgress = true;

  const submitButton = identityForm.querySelector(
    'button[type="submit"], input[type="submit"]'
  );

  if (submitButton) submitButton.disabled = true;

  identityError.textContent = "Comprobando nombre y código…";

  try {
    await sendToServer({
      accion: "verificar",
      token,
      nombre: fullName
    });

    currentToken = token;
    currentName = fullName;

    identityError.textContent = "";

    homeSection.hidden = true;
    surveySection.hidden = false;

    surveySection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  } catch (error) {
    identityError.textContent =
      error instanceof Error
        ? error.message
        : "No se pudieron verificar los datos.";

    currentToken = "";
    currentName = "";

    // La persona permanece en el formulario de identificación.
  } finally {
    verificationInProgress = false;
    if (submitButton) submitButton.disabled = false;
  }
});

surveyForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  surveyMessage.textContent = "";

  const selected = document.querySelector(
    'input[name="position"]:checked'
  );

  if (!currentToken || !currentName) {
    surveyMessage.textContent =
      "Primero debes verificar tu nombre y código.";
    surveySection.hidden = true;
    homeSection.hidden = false;
    return;
  }

  if (!selected || !selectedPosition) {
    surveyMessage.textContent =
      "Selecciona la opción roja o azul.";
    return;
  }

  const fields = Array.from(
    questionsContainer.querySelectorAll("textarea")
  );

  const firstEmpty = fields.find((field) => !field.value.trim());

  if (fields.length !== 20 || firstEmpty) {
    surveyMessage.textContent =
      "Debes responder las 20 preguntas antes de enviar.";

    if (firstEmpty) {
      firstEmpty.focus();
      firstEmpty.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }

    return;
  }

  const answers = fields.map((field) => field.value.trim());

  surveyMessage.textContent = "Enviando respuestas…";

  const submitButton = surveyForm.querySelector(
    'button[type="submit"], input[type="submit"]'
  );

  if (submitButton) submitButton.disabled = true;

  try {
    await sendToServer({
      accion: "registrar",
      token: currentToken,
      nombre: currentName,
      posicion: selectedPosition,
      respuestas: answers
    });

    surveyMessage.textContent =
      "Respuestas registradas correctamente. Gracias por participar.";

    surveyForm.reset();
    questionsContainer.replaceChildren();

    document.querySelectorAll('input[name="position"]').forEach((radio) => {
      radio.checked = false;
    });

    currentToken = "";
    currentName = "";
    selectedPosition = null;

    await loadPublicOpinions();
    await loadVoteCounts();

    surveySection.hidden = true;
    homeSection.hidden = false;

    identityForm?.reset();
    if (codeSection) codeSection.hidden = true;

    homeSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  } catch (error) {
    surveyMessage.textContent =
      error instanceof Error
        ? error.message
        : "No se pudieron registrar las respuestas.";

    // Si falla el registro, conserva las respuestas para reintentar.
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

cancelSurveyButton?.addEventListener("click", () => {
  surveyForm.reset();
  questionsContainer.replaceChildren();
  surveyMessage.textContent = "";

  currentToken = "";
  currentName = "";
  selectedPosition = null;

  document.querySelectorAll('input[name="position"]').forEach((radio) => {
    radio.checked = false;
  });

  surveySection.hidden = true;
  homeSection.hidden = false;

  homeSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

async function loadPublicOpinions(positionFilter = null) {
  publicOpinions.replaceChildren();

  try {
    const params = new URLSearchParams({
      select: "respuestas,posicion,created_at",
      order: "created_at.desc",
      limit: "100"
    });

    if (positionFilter) {
      params.set("posicion", `eq.${positionFilter}`);
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/opiniones?${params.toString()}`,
      {
        headers: {
          "apikey": SUPABASE_PUBLISHABLE_KEY,
          "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("No se pudieron cargar las opiniones.");
    }

    const data = await response.json();

    if (!data.length) {
      const empty = document.createElement("p");
      empty.className = "help-text";
      empty.textContent = "Todavía no hay opiniones para mostrar.";
      publicOpinions.append(empty);
      return;
    }

    data.forEach((opinion) => {
      const card = document.createElement("article");
      card.className = "opinion-card";

      const heading = document.createElement("strong");
      heading.textContent =
        opinion.posicion === "red"
          ? "Opinión · opción roja"
          : opinion.posicion === "blue"
            ? "Opinión · opción azul"
            : "Opinión";

      const paragraph = document.createElement("p");
      paragraph.textContent = opinion.respuestas;

      card.append(heading, paragraph);
      publicOpinions.append(card);
    });
  } catch (error) {
    console.error("Error al cargar opiniones.");

    const message = document.createElement("p");
    message.className = "help-text";
    message.textContent =
      "No se pudieron cargar las opiniones. Comprueba los permisos de lectura de Supabase.";

    publicOpinions.append(message);
  }
}

async function loadVoteCounts() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/opiniones?select=posicion`,
      {
        headers: {
          "apikey": SUPABASE_PUBLISHABLE_KEY,
          "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("No se pudieron cargar los resultados.");
    }

    const data = await response.json();

    const redCount = data.filter((item) => item.posicion === "red").length;
    const blueCount = data.filter((item) => item.posicion === "blue").length;
    const total = redCount + blueCount;

    const redPercent = total
      ? Math.round((redCount / total) * 100)
      : 0;

    const bluePercent = total ? 100 - redPercent : 0;

    if (totalVotesElement) {
      totalVotesElement.textContent = `Total de votaciones: ${total}`;
    }

    if (redResult) {
      redResult.textContent =
        `Votos rojos: ${redCount} (${redPercent}%)`;
    }

    if (blueResult) {
      blueResult.textContent =
        `Votos azules: ${blueCount} (${bluePercent}%)`;
    }

    if (redBar) redBar.style.width = `${redPercent}%`;
    if (blueBar) blueBar.style.width = `${bluePercent}%`;
  } catch (error) {
    if (totalVotesElement) {
      totalVotesElement.textContent =
        "No se pudieron cargar los resultados.";
    }
  }
}

showRedOpinionsButton?.addEventListener("click", () => {
  loadPublicOpinions("red");
});

showBlueOpinionsButton?.addEventListener("click", () => {
  loadPublicOpinions("blue");
});

updateBirthDateUI();
loadPublicOpinions();
loadVoteCounts();
