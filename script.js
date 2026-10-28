
const $ = (id) => document.getElementById(id);

const pantallas = [
  "inicio",
  "formulario",
  "opciones",
  "preguntas",
  "resultado"
];

let opcionElegida = null;
let participacionesLocales = 0;

function mostrar(id) {
  pantallas.forEach((pantalla) => {
    $(pantalla).classList.toggle("hidden", pantalla !== id);
  });
}

function fechaValida(valor) {
  if (!valor) return false;

  const partes = valor.split("-").map(Number);
  const [anio, mes, dia] = partes;

  if (partes.length !== 3) return false;

  const fecha = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    fecha.getUTCFullYear() !== anio ||
    fecha.getUTCMonth() !== mes - 1 ||
    fecha.getUTCDate() !== dia
  ) {
    return false;
  }

  const hoy = new Date();
  const limiteSuperior = new Date(
    Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  );

  const nacimiento = fecha.getTime();
  const hoyUTC = limiteSuperior.getTime();

  if (nacimiento > hoyUTC) return false;

  let edad = hoy.getUTCFullYear() - anio;
  const cumpleEsteAnio =
    hoy.getUTCMonth() + 1 > mes ||
    (hoy.getUTCMonth() + 1 === mes && hoy.getUTCDate() >= dia);

  if (!cumpleEsteAnio) edad--;

  return edad >= 16 && edad <= 100;
}

$("comenzar").addEventListener("click", () => {
  const deseaVotar = window.confirm("¿Deseas participar en la demostración?");
  if (deseaVotar) mostrar("formulario");
});

$("datosForm").addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nombre = $("nombre").value.trim();
  const apellidos = $("apellidos").value.trim();
  const fecha = $("fecha").value;

  if (!nombre || !apellidos) {
    alert("Completa el nombre y los apellidos.");
    return;
  }

  if (!fechaValida(fecha)) {
    $("errorFecha").textContent =
      "Introduce una fecha válida y una edad de entre 16 y 100 años.";
    return;
  }

  $("errorFecha").textContent = "";
  mostrar("opciones");
});

document.querySelectorAll("[data-option]").forEach((boton) => {
  boton.addEventListener("click", () => {
    opcionElegida = boton.dataset.option;
    mostrar("preguntas");
  });
});

$("preguntasForm").addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!opcionElegida) {
    alert("Selecciona una opción.");
    mostrar("opciones");
    return;
  }

  // Demostración local: no envía ni guarda respuestas personales.
  participacionesLocales++;
  $("contador").textContent = participacionesLocales;

  $("datosForm").reset();
  $("preguntasForm").reset();
  opcionElegida = null;

  mostrar("resultado");
});

$("volver").addEventListener("click", () => {
  mostrar("inicio");
});
