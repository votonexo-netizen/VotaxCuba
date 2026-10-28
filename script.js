
"use strict";

const SUPABASE_FUNCTION_URL =
  "https://dqylqfjevffjiyjeyfsz.supabase.co/functions/v1/registrar-voto";

// La clave publishable es pública y puede usarse en el navegador.
// Sustituye este texto por tu sb_publishable_... de Supabase.
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_VFDtlMisspOg_thRYF7iag_XvvKDqVl";

const homeSection = document.getElementById("home-section");
const identityForm = document.getElementById("identity-form");
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

let selectedPosition = null;
let currentToken = "";
let allOpinions = [];

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

function todayAsDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
  ) return null;
  return date;
}

function calculateAge(birthDate) {
  const today = todayAsDate();
  let age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());
  if (beforeBirthday) age--;
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
  if (codeSuffixInput) codeSuffixInput.value = "";

  const birthDate = parseDateOnly(birthDateInput.value);
  if (!birthDate) {
    codeSection.hidden = true;
    return;
  }

  const age = calculateAge(birthDate);
  if (age < 16 || age > 100) {
    codeSection.hidden = true;
    identityError.textContent = "La edad debe estar entre 16 y 100 años.";
    return;
  }

  codePrefixInput.value = makePrefix(birthDate);
  prefixPreview.textContent = codePrefixInput.value;
  codeSection.hidden = false;
}

if (birthDateInput) {
  birthDateInput.addEventListener("change", updateBirthDateUI);
}

if (codeSuffixInput) {
  codeSuffixInput.addEventListener("input", () => {
    codeSuffixInput.value =
      codeSuffixInput.value.replace(/\D/g, "").slice(0, 5);
    if (identityError) identityError.textContent = "";
  });
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
    textarea.placeholder = "Escribe tu opinión (máximo 500 caracteres)";

    counter.className = "help-text";
    counter.textContent = "0/500 caracteres";

    textarea.addEventListener("input", () => {
      counter.textContent = `${textarea.value.length}/500 caracteres`;
    });

    wrapper.append(label, textarea, counter);
    questionsContainer.append(wrapper);
  });
}

document.querySelectorAll('input[name="position"]').forEach((radio) => {
  radio.addEventListener("change", () => renderQuestions(radio.value));
});

if (identityForm) {
  identityForm.addEventListener("submit", (event) => {
    event.preventDefault();
    identityError.textContent = "";

    const birthDate = parseDateOnly(birthDateInput.value);
    if (!birthDate) {
      identityError.textContent = "Selecciona una fecha de nacimiento válida.";
      return;
    }

    const age = calculateAge(birthDate);
    if (age < 16 || age > 100) {
      identityError.textContent = "La edad debe estar entre 16 y 100 años.";
      return;
    }

    // La identidad no se envía ni se almacena.
    // El token se obtiene de un proceso de verificación independiente.
    const tokenInput = document.getElementById("participation-token");
    currentToken = tokenInput ? tokenInput.value.trim() : "";

    if (!currentToken) {
      identityError.textContent =
        "Para continuar hace falta un token de participación válido.";
      return;
    }

    homeSection.hidden = true;
    surveySection.hidden = false;
    surveySection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (surveyForm) {
  surveyForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    surveyMessage.textContent = "";

    if (
      !SUPABASE_PUBLISHABLE_KEY ||
      SUPABASE_PUBLISHABLE_KEY === "PEGA_AQUI_TU_CLAVE_PUBLISHABLE"
    ) {
      surveyMessage.textContent =
        "Falta configurar la clave publicable de Supabase.";
      return;
    }

    const selected = document.querySelector(
      'input[name="position"]:checked'
    );

    if (!selected) {
      surveyMessage.textContent = "Selecciona la opción roja o azul.";
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

    try {
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_PUBLISHABLE_KEY,
          "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          token: currentToken,
          respuestas: answers
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.ok !== true) {
        surveyMessage.textContent =
          result.error || "No se pudieron registrar las respuestas.";
        return;
      }

      surveyMessage.textContent =
        "Respuestas registradas correctamente. Gracias por participar.";

      surveyForm.reset();
      questionsContainer.replaceChildren();
      document.querySelectorAll('input[name="position"]').forEach((radio) => {
        radio.checked = false;
      });

      currentToken = "";
      selectedPosition = null;

      await loadPublicOpinions();
      await loadVoteCounts();

      surveySection.hidden = true;
      homeSection.hidden = false;
      homeSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error(error);
      surveyMessage.textContent =
        "No se pudo conectar con el servidor. Inténtalo más tarde.";
    }
  });
}

if (cancelSurveyButton) {
  cancelSurveyButton.addEventListener("click", () => {
    surveyForm.reset();
    questionsContainer.replaceChildren();
    surveyMessage.textContent = "";
    currentToken = "";
    selectedPosition = null;
    surveySection.hidden = true;
    homeSection.hidden = false;
    homeSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

async function loadPublicOpinions(positionFilter = null) {
  publicOpinions.replaceChildren();

  try {
    const url =
      `${SUPABASE_FUNCTION_URL.replace("/functions/v1/registrar-voto", "")}` +
      "/rest/v1/opiniones?select=respuestas,created_at&order=created_at.desc&limit=100";

    const response = await fetch(url, {
      headers: {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error("No se pudieron cargar las opiniones.");
    }

    const data = await response.json();
    allOpinions = data;

    const filtered = positionFilter
      ? data.filter((item) => {
          const firstLine = item.respuestas.split("\n")[0] || "";
          return positionFilter === "red"
            ? firstLine.includes("Opción roja")
            : firstLine.includes("Opción azul");
        })
      : data;

    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "help-text";
      empty.textContent = "Todavía no hay opiniones públicas.";
      publicOpinions.append(empty);
      return;
    }

    filtered.forEach((opinion) => {
      const card = document.createElement("article");
      card.className = "opinion-card";

      const heading = document.createElement("strong");
      heading.textContent = "Opinión publicada";

      const paragraph = document.createElement("p");
      paragraph.textContent = opinion.respuestas;

      card.append(heading, paragraph);
      publicOpinions.append(card);
    });
  } catch (error) {
    console.error(error);
    const message = document.createElement("p");
    message.className = "help-text";
    message.textContent =
      "No se pudieron cargar las opiniones públicas.";
    publicOpinions.append(message);
  }
}

async function loadVoteCounts() {
  // No se muestran cifras inventadas. Para obtener resultados reales,
  // hace falta un endpoint agregado y público que no exponga identidades.
  if (totalVotesElement) {
    totalVotesElement.textContent = "Los resultados se están preparando.";
  }
  if (redResult) redResult.textContent = "Resultados rojos pendientes";
  if (blueResult) blueResult.textContent = "Resultados azules pendientes";
  if (redBar) redBar.style.width = "0%";
  if (blueBar) blueBar.style.width = "0%";
}

if (showRedOpinionsButton) {
  showRedOpinionsButton.addEventListener("click", () => {
    renderQuestions("red");
    loadPublicOpinions("red");
  });
}

if (showBlueOpinionsButton) {
  showBlueOpinionsButton.addEventListener("click", () => {
    renderQuestions("blue");
    loadPublicOpinions("blue");
  });
}

updateBirthDateUI();
loadPublicOpinions();
loadVoteCounts();
