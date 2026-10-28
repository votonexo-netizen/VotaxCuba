
/*
 * VotaXCuba — script.js
 *
 * IMPORTANTE:
 * 1. Usa la clave pública anon/publishable de Supabase.
 * 2. No coloques la service_role ni una secret key aquí.
 * 3. Las consultas públicas usan la vista opiniones_publicas.
 */

const SUPABASE_URL = "https://dqylqfjevffjiyjeyfsz.supabase.co";
const SUPABASE_FUNCTION_URL =
  "https://dqylqfjevffjiyjeyfsz.supabase.co/functions/v1/registrar-voto";

// Sustituye el texto siguiente por tu clave PÚBLICA anon/publishable de Supabase.
const SUPABASE_ANON_KEY = "sb_publishable_VFDtlMisspOg_thRYF7iag_XvvKDqVl";

const MAX_RESPUESTA = 500;
const TOTAL_PREGUNTAS = 20;

const preguntasEncuesta = [
  "¿Cuáles consideras que son los principales problemas que enfrenta Cuba actualmente?",
  "¿Qué cambios consideras más importantes para mejorar la vida cotidiana en Cuba?",
  "¿Cómo valoras la situación económica actual del país? Explica tu opinión.",
  "¿Qué medidas podrían ayudar a mejorar el acceso a los alimentos y otros productos básicos?",
  "¿Qué importancia tienen los servicios de salud para el futuro del país?",
  "¿Qué cambios, si alguno, consideras necesarios en el sistema educativo?",
  "¿Qué oportunidades deberían existir para que los jóvenes construyan su futuro en Cuba?",
  "¿Qué medidas podrían contribuir a mejorar los salarios y el poder adquisitivo?",
  "¿Cómo crees que podría mejorarse el acceso a la vivienda?",
  "¿Qué importancia tienen la libertad de expresión y el respeto a las opiniones diferentes?",
  "¿Cómo deberían abordarse las diferencias políticas entre los ciudadanos?",
  "¿Qué papel deberían tener los ciudadanos en las decisiones que afectan al país?",
  "¿Qué cambios podrían ayudar a reducir la corrupción y aumentar la transparencia?",
  "¿Cómo valoras las oportunidades para emprender y desarrollar negocios?",
  "¿Qué medidas podrían ayudar a mejorar la infraestructura y los servicios públicos?",
  "¿Qué importancia tienen las relaciones de Cuba con otros países?",
  "¿Qué aspectos de la vida en Cuba consideras que deberían conservarse?",
  "¿Qué aspectos de la sociedad cubana consideras que deberían cambiar?",
  "¿Cómo imaginas a Cuba dentro de diez años si se aplicaran las medidas que consideras adecuadas?",
  "¿Hay algo más que quieras expresar sobre el presente o el futuro de Cuba?"
];

const $ = (id) => document.getElementById(id);

let codigoVerificado = "";
let nombreVerificado = "";
let posicionSeleccionada = "";
let enviandoEncuesta = false;

function normalizarNombre(valor) {
  return String(valor ?? "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ");
}

function mostrarMensaje(elemento, mensaje, tipo = "error") {
  if (!elemento) return;

  elemento.textContent = mensaje;
  elemento.classList.toggle("success-message", tipo === "success");
  elemento.classList.toggle("error-message", tipo !== "success");
}

function limpiarMensaje(elemento) {
  if (!elemento) return;
  elemento.textContent = "";
  elemento.classList.remove("success-message");
}

function fechaPrefijo(fecha) {
  // Convierte YYYY-MM-DD en YYMMDD.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return "";

  const [anio, mes, dia] = fecha.split("-");
  return `${anio.slice(-2)}${mes}${dia}`;
}

function calcularEdad(fecha) {
  if (!fecha) return NaN;

  const nacimiento = new Date(`${fecha}T00:00:00`);
  const hoy = new Date();

  if (Number.isNaN(nacimiento.getTime()) || nacimiento > hoy) {
    return NaN;
  }

  let edad = hoy.getFullYear() - nacimiento.getFullYear();

  const aunNoCumpleEsteAno =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() &&
      hoy.getDate() < nacimiento.getDate());

  if (aunNoCumpleEsteAno) edad--;

  return edad;
}

function obtenerClavePublica() {
  if (
    !SUPABASE_ANON_KEY ||
    SUPABASE_ANON_KEY === "PEGA_AQUI_TU_CLAVE_PUBLICA_DE_SUPABASE"
  ) {
    throw new Error(
      "Falta configurar la clave pública de Supabase en script.js."
    );
  }

  return SUPABASE_ANON_KEY;
}

async function enviarAlServidor(datos) {
  const clave = obtenerClavePublica();

  const respuesta = await fetch(SUPABASE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": clave,
      "Authorization": `Bearer ${clave}`
    },
    body: JSON.stringify(datos)
  });

  let resultado;

  try {
    resultado = await respuesta.json();
  } catch {
    throw new Error("El servidor devolvió una respuesta no válida.");
  }

  if (!respuesta.ok || resultado.ok !== true) {
    throw new Error(
      resultado.error || "No se pudo completar la solicitud."
    );
  }

  return resultado;
}

async function leerVistaPublica(parametros = "") {
  const clave = obtenerClavePublica();

  const url =
    `${SUPABASE_URL}/rest/v1/opiniones_publicas` +
    (parametros ? `?${parametros}` : "");

  const respuesta = await fetch(url, {
    method: "GET",
    headers: {
      "apikey": clave,
      "Authorization": `Bearer ${clave}`
    }
  });

  if (!respuesta.ok) {
    throw new Error(
      "No se pudieron cargar los datos públicos. Comprueba los permisos de Supabase."
    );
  }

  return respuesta.json();
}

function crearPreguntas() {
  const contenedor = $("questions-container");
  if (!contenedor) return;

  contenedor.replaceChildren();

  preguntasEncuesta.forEach((pregunta, indice) => {
    const bloque = document.createElement("div");
    bloque.className = "question";

    const etiqueta = document.createElement("label");
    etiqueta.htmlFor = `respuesta-${indice + 1}`;
    etiqueta.textContent = `${indice + 1}. ${pregunta}`;

    const campo = document.createElement("textarea");
    campo.id = `respuesta-${indice + 1}`;
    campo.name = `respuesta-${indice + 1}`;
    campo.maxLength = MAX_RESPUESTA;
    campo.required = true;
    campo.rows = 4;
    campo.placeholder = "Escribe tu opinión…";

    const ayuda = document.createElement("p");
    ayuda.className = "help-text";
    ayuda.textContent = `Máximo ${MAX_RESPUESTA} caracteres.`;

    bloque.append(etiqueta, campo, ayuda);
    contenedor.appendChild(bloque);
  });
}

function mostrarEncuesta(posicion) {
  posicionSeleccionada = posicion;

  const inicio = $("home-section");
  const encuesta = $("survey-section");

  if (inicio) inicio.hidden = true;
  if (encuesta) encuesta.hidden = false;

  const mensaje = $("survey-message");
  limpiarMensaje(mensaje);

  if (encuesta) {
    encuesta.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function volverAlInicio() {
  const inicio = $("home-section");
  const encuesta = $("survey-section");

  if (encuesta) encuesta.hidden = true;
  if (inicio) inicio.hidden = false;

  const formulario = $("survey-form");
  if (formulario) formulario.reset();

  posicionSeleccionada = "";

  const mensaje = $("survey-message");
  limpiarMensaje(mensaje);

  if (inicio) {
    inicio.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function verificarIdentidad(evento) {
  evento.preventDefault();

  const mensaje = $("identity-error");
  limpiarMensaje(mensaje);

  const nombre = normalizarNombre($("first-name")?.value);
  const apellidos = normalizarNombre($("last-name")?.value);
  const fecha = $("birth-date")?.value || "";
  const sufijo = $("code-suffix")?.value.trim() || "";

  if (!nombre || !apellidos) {
    mostrarMensaje(mensaje, "Introduce tu nombre y apellidos completos.");
    return;
  }

  if (nombre.length > 100 || apellidos.length > 100) {
    mostrarMensaje(mensaje, "El nombre o los apellidos son demasiado largos.");
    return;
  }

  const edad = calcularEdad(fecha);

  if (!fecha || !Number.isFinite(edad)) {
    mostrarMensaje(mensaje, "Introduce una fecha de nacimiento válida.");
    return;
  }

  if (edad < 16 || edad > 100) {
    mostrarMensaje(mensaje, "La encuesta admite participantes de entre 16 y 100 años.");
    return;
  }

  if (!/^\d{5}$/.test(sufijo)) {
    mostrarMensaje(mensaje, "Introduce exactamente los cinco dígitos restantes del código.");
    $("code-suffix")?.focus();
    return;
  }

  const prefijo = fechaPrefijo(fecha);
  const token = `${prefijo}${sufijo}`;
  const nombreCompleto = normalizarNombre(`${nombre} ${apellidos}`);

  if (!/^\d{11}$/.test(token)) {
    mostrarMensaje(mensaje, "El código debe contener exactamente 11 dígitos.");
    return;
  }

  const boton = $("identity-form")?.querySelector('button[type="submit"]');

  try {
    if (boton) {
      boton.disabled = true;
      boton.textContent = "Verificando…";
    }

    await enviarAlServidor({
      accion: "verificar",
      token,
      nombre: nombreCompleto
    });

    codigoVerificado = token;
    nombreVerificado = nombreCompleto;

    mostrarMensaje(mensaje, "Datos verificados. Puedes continuar.", "success");

    // La encuesta se abre después de verificar el código y el nombre.
    crearPreguntas();
    mostrarEncuesta("red");
  } catch (error) {
    mostrarMensaje(
      mensaje,
      error.message || "No se pudo verificar la información."
    );
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Verificar y continuar";
    }
  }
}

async function registrarEncuesta(evento) {
  evento.preventDefault();

  const mensaje = $("survey-message");
  limpiarMensaje(mensaje);

  if (enviandoEncuesta) return;

  if (!codigoVerificado || !nombreVerificado) {
    mostrarMensaje(
      mensaje,
      "Primero debes verificar tu nombre y tu código de participación."
    );
    volverAlInicio();
    return;
  }

  const seleccion = document.querySelector(
    'input[name="position"]:checked'
  );

  if (!seleccion) {
    mostrarMensaje(mensaje, "Selecciona la opción roja o azul.");
    return;
  }

  const respuestas = [];

  for (let i = 1; i <= TOTAL_PREGUNTAS; i++) {
    const campo = $(`respuesta-${i}`);
    const respuesta = campo?.value.trim() || "";

    if (!respuesta) {
      mostrarMensaje(mensaje, `Debes responder la pregunta ${i}.`);
      campo?.focus();
      return;
    }

    if (respuesta.length > MAX_RESPUESTA) {
      mostrarMensaje(
        mensaje,
        `La respuesta ${i} supera el máximo de ${MAX_RESPUESTA} caracteres.`
      );
      campo?.focus();
      return;
    }

    respuestas.push(respuesta);
  }

  const boton = $("survey-form")?.querySelector('button[type="submit"]');

  try {
    enviandoEncuesta = true;

    if (boton) {
      boton.disabled = true;
      boton.textContent = "Enviando respuestas…";
    }

    await enviarAlServidor({
      accion: "registrar",
      token: codigoVerificado,
      nombre: nombreVerificado,
      posicion: seleccion.value,
      respuestas
    });

    mostrarMensaje(
      mensaje,
      "Respuestas registradas correctamente. Gracias por participar.",
      "success"
    );

    // Evita reutilizar los datos en el navegador tras el envío exitoso.
    codigoVerificado = "";
    nombreVerificado = "";

    $("identity-form")?.reset();
    $("survey-form")?.reset();

    if ($("code-section")) $("code-section").hidden = true;
    if ($("code-prefix")) $("code-prefix").textContent = "";

    posicionSeleccionada = "";

    await cargarResultados();
    await cargarOpiniones();

    window.setTimeout(() => {
      const encuesta = $("survey-section");
      const inicio = $("home-section");

      if (encuesta) encuesta.hidden = true;
      if (inicio) inicio.hidden = false;

      limpiarMensaje($("identity-error"));
      limpiarMensaje($("survey-message"));

      if (inicio) {
        inicio.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 1800);
  } catch (error) {
    mostrarMensaje(
      mensaje,
      error.message || "No se pudieron registrar las respuestas."
    );
  } finally {
    enviandoEncuesta = false;

    if (boton) {
      boton.disabled = false;
      boton.textContent = "Enviar respuestas";
    }
  }
}

async function cargarResultados() {
  const totalElemento = $("total-votes");
  const rojoElemento = $("red-result");
  const azulElemento = $("blue-result");
  const barraRoja = $("red-bar");
  const barraAzul = $("blue-bar");

  try {
    // Se lee únicamente la vista pública, nunca la tabla original.
    const filas = await leerVistaPublica("select=posicion");

    const votosRojos = filas.filter(
      (fila) => fila.posicion === "red"
    ).length;

    const votosAzules = filas.filter(
      (fila) => fila.posicion === "blue"
    ).length;

    const total = votosRojos + votosAzules;

    const porcentajeRojo =
      total > 0 ? Math.round((votosRojos / total) * 100) : 0;

    const porcentajeAzul =
      total > 0 ? Math.round((votosAzules / total) * 100) : 0;

    if (totalElemento) {
      totalElemento.textContent = `Total de participaciones: ${total}`;
    }

    if (rojoElemento) {
      rojoElemento.textContent =
        `Votos rojos: ${votosRojos} (${porcentajeRojo}%)`;
    }

    if (azulElemento) {
      azulElemento.textContent =
        `Votos azules: ${votosAzules} (${porcentajeAzul}%)`;
    }

    if (barraRoja) barraRoja.style.width = `${porcentajeRojo}%`;
    if (barraAzul) barraAzul.style.width = `${porcentajeAzul}%`;
  } catch (error) {
    console.error("Error al cargar resultados:", error);

    if (totalElemento) {
      totalElemento.textContent =
        "No se pudieron cargar los resultados. Inténtalo más tarde.";
    }
  }
}

async function cargarOpiniones(filtro = "") {
  const contenedor = $("public-opinions");
  if (!contenedor) return;

  contenedor.replaceChildren();

  const cargando = document.createElement("p");
  cargando.className = "help-text";
  cargando.textContent = "Cargando opiniones…";
  contenedor.appendChild(cargando);

  try {
    const parametros = new URLSearchParams({
      select: "respuestas,posicion,created_at",
      order: "created_at.desc",
      limit: "100"
    });

    if (filtro === "red" || filtro === "blue") {
      parametros.set("posicion", `eq.${filtro}`);
    }

    // La vista no incluye nombre_completo.
    const filas = await leerVistaPublica(parametros.toString());

    contenedor.replaceChildren();

    if (!Array.isArray(filas) || filas.length === 0) {
      const vacio = document.createElement("p");
      vacio.className = "help-text";
      vacio.textContent = "Todavía no hay opiniones públicas en esta categoría.";
      contenedor.appendChild(vacio);
      return;
    }

    filas.forEach((fila) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "opinion-card";

      const titulo = document.createElement("h3");
      titulo.textContent =
        fila.posicion === "red" ? "Opción roja" : "Opción azul";

      const texto = document.createElement("p");
      // textContent evita interpretar las respuestas como HTML.
      texto.textContent = String(fila.respuestas ?? "");

      tarjeta.append(titulo, texto);
      contenedor.appendChild(tarjeta);
    });
  } catch (error) {
    console.error("Error al cargar opiniones:", error);

    contenedor.replaceChildren();

    const aviso = document.createElement("p");
    aviso.className = "error-message";
    aviso.textContent =
      "No se pudieron cargar las opiniones. Comprueba la conexión y los permisos de Supabase.";

    contenedor.appendChild(aviso);
  }
}

function configurarFormularioIdentidad() {
  const fecha = $("birth-date");
  const seccionCodigo = $("code-section");
  const prefijo = $("code-prefix");
  const sufijo = $("code-suffix");

  if (!fecha) return;

  const actualizarCodigo = () => {
    const valor = fecha.value;
    const edad = calcularEdad(valor);
    const codigoPrefijo = fechaPrefijo(valor);

    if (seccionCodigo) {
      seccionCodigo.hidden = !valor;
    }

    if (prefijo) {
      prefijo.textContent = codigoPrefijo;
    }

    // Reinicia los cinco dígitos si cambia la fecha.
    if (sufijo) {
      sufijo.value = "";
    }

    limpiarMensaje($("identity-error"));

    if (valor && Number.isFinite(edad) && (edad < 16 || edad > 100)) {
      mostrarMensaje(
        $("identity-error"),
        "La encuesta admite participantes de entre 16 y 100 años."
      );
    }
  };

  fecha.addEventListener("change", actualizarCodigo);
  fecha.addEventListener("input", actualizarCodigo);
}

function configurarEventos() {
  $("identity-form")?.addEventListener("submit", verificarIdentidad);
  $("survey-form")?.addEventListener("submit", registrarEncuesta);
  $("cancel-survey")?.addEventListener("click", volverAlInicio);

  $("show-red-opinions")?.addEventListener("click", () => {
    cargarOpiniones("red");
  });

  $("show-blue-opinions")?.addEventListener("click", () => {
    cargarOpiniones("blue");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  configurarFormularioIdentidad();
  configurarEventos();
  crearPreguntas();

  cargarResultados();
  cargarOpiniones();
});
