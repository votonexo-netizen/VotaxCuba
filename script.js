
"use strict";

// Configuraremos Supabase cuando creemos el proyecto.
// No pegues aquí una clave secreta o service_role.

const SUPABASE_URL = "";
const SUPABASE_PUBLISHABLE_KEY = "";

let supabaseClient = null;

if (
  window.supabase &&
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_PUBLISHABLE_KEY.length > 0
) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
}

const form = document.getElementById("vote-form");
const message = document.getElementById("form-message");
const submitButton = document.getElementById("submit-vote");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  message.textContent =
    "La votación aún no está activa. Primero debemos configurar " +
    "la verificación segura del código y la protección antirobot.";

  message.setAttribute("role", "status");
});

function showResults(blue, red) {
  // Esta función se utilizará cuando conectemos resultados públicos
  // obtenidos de una consulta segura a Supabase.
  const blueCount = Number(blue);
  const redCount = Number(red);

  if (
    !Number.isSafeInteger(blueCount) ||
    !Number.isSafeInteger(redCount) ||
    blueCount < 0 ||
    redCount < 0
  ) {
    return;
  }

  document.getElementById("blue-count").textContent = blueCount;
  document.getElementById("red-count").textContent = redCount;
  document.getElementById("total-count").textContent =
    blueCount + redCount;
}

// Todavía no se cargan resultados ficticios ni se aceptan votos.
