
"use strict";

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

const redBar = document.getElementById("red-bar");
const blueBar = document.getElementById("blue-bar");
const redResult = document.getElementById("red-result");
const blueResult = document.getElementById("blue-result");
const publicOpinions = document.getElementById("public-opinions");

let currentPrefix = "";
let localVotes = { red: 0, blue: 0 };
let localOpinions = [];

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
  ) {
    return null;
  }

  return date;
}

function calculateAge(birthDate) {
  const today = todayAsDate();
  let age = today.getFullYear() - birthDate.getFullYear();

  const birthdayHasNotOccurred =
    today.getMonth() < birthDate.getMonth() ||
    (
      today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate()
    );

  if (birthdayHasNotOccurred) age--;

  return age;
}

function makePrefix(birthDate) {
  const year = String(birthDate.getFullYear()).slice(-2);
  const month = String(birthDate.getMonth() + 1).padStart(2, "0");
  const day = String(birthDate.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function updateBirthDateUI() {
  identityError.textContent = "";
  codeSuffixInput.value = "";

  const birthDate = parseDateOnly(birthDateInput.value);

  if (!birthDate) {
    codeSection.hidden = true;
    currentPrefix = "";
    return;
  }

  const age = calculateAge(birthDate);

  if (age < 16 || age > 100) {
    codeSection.hidden = true;
    currentPrefix = "";
    identityError.textContent =
      "La edad debe estar entre 16 y 100 años. Comprueba la fecha introducida.";
    return;
  }

  currentPrefix = makePrefix(birthDate);
  codePrefixInput.value = currentPrefix;
  prefixPreview.textContent = currentPrefix;
  codeSection.hidden = false;
}

birthDateInput.addEventListener("change", updateBirthDateUI);

codeSuffixInput.addEventListener("input", () => {
  // Solo se permiten cinco dígitos.
  codeSuffixInput.value = codeSuffixInput.value
    .replace(/\D/g, "")
    .slice(0, 5);

  identityError.textContent = "";
});

function renderQuestions(position) {
  questionsContainer.replaceChildren();

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
  radio.addEventListener("change", () => {
    renderQuestions(radio.value);
  });
});

identityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  identityError.textContent = "";

  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const birthDate = parseDateOnly(birthDateInput.value);
  const suffix = codeSuffixInput.value.trim();

  if (!firstName || !lastName) {
    identityError.textContent = "Completa tu nombre y apellidos.";
    return;
  }

  if (!birthDate) {
    identityError.textContent = "Selecciona una fecha de nacimiento válida.";
    return;
  }

  const age = calculateAge(birthDate);

  if (age < 16 || age > 100) {
    identityError.textContent = "La edad debe estar entre 16 y 100 años.";
    return;
  }

  if (!currentPrefix || !/^\d{5}$/.test(suffix)) {
    identityError.textContent =
      "Completa los cinco dígitos restantes del código.";
    return;
  }

  // No se guarda ni se envía el nombre, la fecha o el código.
  identityForm.reset();
  codeSection.hidden = true;
  currentPrefix = "";

  surveySection.hidden = false;
  surveySection.scrollIntoView({ behavior: "smooth", block: "start" });
});

surveyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  surveyMessage.textContent = "";

  const selected = document.querySelector('input[name="position"]:checked');

  if (!selected) {
    surveyMessage.textContent = "Selecciona una opción antes de enviar.";
    return;
  }

  const answers = Array.from(
    questionsContainer.querySelectorAll("textarea")
  )
    .map((field, index) => ({
      question: questions[selected.value][index],
      answer: field.value.trim()
    }))
    .filter((item) => item.answer.length > 0);

  if (answers.length === 0) {
    surveyMessage.textContent =
      "Escribe al menos una respuesta antes de enviar.";
    return;
  }

  // Demo local: no se envía nada a Internet.
  localVotes[selected.value]++;

  answers.forEach((item) => {
    localOpinions.push({
      position: selected.value,
      text: `Yo pienso que ${item.answer}`,
      question: item.question
    });
  });

  updateResults();
  renderPublicOpinions();

  surveyMessage.textContent =
    "Tus respuestas se han guardado solo en esta sesión del navegador. No se han enviado a un servidor.";

  surveyForm.reset();
  questionsContainer.replaceChildren();

  document.querySelectorAll('input[name="position"]').forEach((radio) => {
    radio.checked = false;
  });
});

function updateResults() {
  const total = localVotes.red + localVotes.blue;

  const redPercent = total ? Math.round((localVotes.red / total) * 100) : 0;
  const bluePercent = total ? 100 - redPercent : 0;

  redBar.style.width = `${redPercent}%`;
  blueBar.style.width = `${bluePercent}%`;

  redResult.textContent = `Continuidad: ${localVotes.red} (${redPercent}%)`;
  blueResult.textContent = `Cambio: ${localVotes.blue} (${bluePercent}%)`;
}

function renderPublicOpinions() {
  publicOpinions.replaceChildren();

  if (localOpinions.length === 0) {
    const empty = document.createElement("p");
    empty.className = "help-text";
    empty.textContent = "Todavía no hay opiniones en esta sesión.";
    publicOpinions.append(empty);
    return;
  }

  localOpinions.slice().reverse().forEach((opinion) => {
    const card = document.createElement("article");
    card.className = "opinion-card";

    const heading = document.createElement("strong");
    heading.textContent =
      opinion.position === "red"
        ? "Opinión — Continuidad"
        : "Opinión — Cambio";

    const question = document.createElement("p");
    question.textContent = opinion.question;

    const answer = document.createElement("p");
    answer.textContent = opinion.text;

    card.append(heading, question, answer);
    publicOpinions.append(card);
  });
}

updateResults();
renderPublicOpinions();
