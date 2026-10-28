
const $ = (id) => document.getElementById(id);

const pantallas = ["inicio", "formulario", "opciones", "preguntas", "resultado"];
const STORAGE_KEY = "votaxcuba_demo_v1";

let opcionElegida = null;
let declaracionActual = "";

const preguntasComunes = [
  {
    id: "urgente",
    titulo: "¿Cuál es el problema más urgente que enfrenta Cuba?",
    tipo: "textarea",
    requerido: true
  },
  {
    id: "primero",
    titulo: "¿Qué cambio debería realizarse primero?",
    tipo: "textarea",
    requerido: true
  },
  {
    id: "metodo",
    titulo: "¿Qué vía de cambio consideras más adecuada?",
    tipo: "radio",
    requerido: true,
    opciones: [
      "Elecciones y reformas institucionales",
      "Diálogo y acuerdos",
      "Protestas pacíficas",
      "Una combinación de estas vías",
      "Otra vía"
    ]
  },
  {
    id: "libertades",
    titulo: "¿Qué importancia tienen las libertades individuales en tu decisión?",
    tipo: "textarea",
    requerido: true
  },
  {
    id: "contrario",
    titulo: "¿Qué argumento de la opción contraria te parece razonable?",
    tipo: "textarea",
    requerido: true
  },
  {
    id: "mensaje",
    titulo: "¿Qué mensaje darías a alguien que piensa diferente?",
    tipo: "textarea",
    requerido: true
  }
];

const preguntasRojo = [
  {
    id: "motivo",
    titulo: "¿Cuáles son las principales razones de tu elección?",
    tipo: "textarea", requerido: true
  },
  {
    id: "positivo",
    titulo: "¿Qué aspectos del sistema actual consideras positivos?",
    tipo: "textarea", requerido: true
  },
  {
    id: "cambiar",
    titulo: "¿Qué aspectos cambiarías o mejorarías?",
    tipo: "textarea", requerido: true
  },
  {
    id: "revolucion",
    titulo: "¿Qué significa para ti la Revolución cubana hoy?",
    tipo: "textarea", requerido: true
  },
  {
    id: "ideales",
    titulo: "¿Qué ideales de los dirigentes históricos consideras importantes?",
    tipo: "textarea", requerido: true
  },
  {
    id: "fidel",
    titulo: "¿Qué opinas de las decisiones de Fidel Castro?",
    tipo: "textarea", requerido: true
  },
  {
    id: "raul",
    titulo: "¿Qué opinas de las decisiones de Raúl Castro?",
    tipo: "textarea", requerido: true
  },
  {
    id: "diazcanel",
    titulo: "¿Qué opinas de la gestión de Miguel Díaz-Canel?",
    tipo: "textarea", requerido: true
  },
  {
    id: "economia",
    titulo: "¿Cuáles consideras que son las principales causas de las dificultades económicas de Cuba?",
    tipo: "textarea", requerido: true
  },
  {
    id: "bloqueo",
    titulo: "¿Qué responsabilidad atribuyes al bloqueo o embargo estadounidense?",
    tipo: "textarea", requerido: true
  },
  {
    id: "gobierno",
    titulo: "¿Qué responsabilidad atribuyes a las decisiones del Gobierno cubano?",
    tipo: "textarea", requerido: true
  },
  {
    id: "economiaPlan",
    titulo: "¿Qué cambios económicos propondrías?",
    tipo: "textarea", requerido: true
  },
  {
    id: "salarios",
    titulo: "¿Cómo mejorarías los salarios y el acceso a productos básicos?",
    tipo: "textarea", requerido: true
  },
  {
    id: "servicios",
    titulo: "¿Qué cambios propondrías en salud y educación?",
    tipo: "textarea", requerido: true
  },
  {
    id: "disenso",
    titulo: "¿Cómo deberían relacionarse el Gobierno y quienes discrepan de él?",
    tipo: "textarea", requerido: true
  },
  {
    id: "eeuu",
    titulo: "¿Qué relación debería mantener Cuba con Estados Unidos?",
    tipo: "textarea", requerido: true
  },
  {
    id: "condiciones",
    titulo: "¿Qué condiciones facilitarían una mejora de esa relación?",
    tipo: "textarea", requerido: true
  },
  {
    id: "propuesta",
    titulo: "¿Qué medidas concretas propondrías para mejorar el futuro del país?",
    tipo: "textarea", requerido: true
  },
  {
    id: "reconsiderar",
    titulo: "¿Qué tendría que ocurrir para que reconsideraras tu elección?",
    tipo: "textarea", requerido: true
  }
];

const preguntasAzul = [
  {
    id: "motivo",
    titulo: "¿Cuáles son las principales razones de tu elección?",
    tipo: "textarea", requerido: true
  },
  {
    id: "sistema",
    titulo: "¿Qué aspectos del sistema político actual consideras que necesitan cambiar?",
    tipo: "textarea", requerido: true
  },
  {
    id: "conservar",
    titulo: "¿Qué aspectos de la sociedad cubana conservarías?",
    tipo: "textarea", requerido: true
  },
  {
    id: "modelo",
    titulo: "¿Qué tipo de sistema político te gustaría que tuviera Cuba?",
    tipo: "textarea", requerido: true
  },
  {
    id: "derechos",
    titulo: "¿Qué derechos y libertades debería garantizar un nuevo Gobierno?",
    tipo: "textarea", requerido: true
  },
  {
    id: "dirigentes",
    titulo: "¿Cómo deberían elegirse los dirigentes y exigírseles responsabilidades?",
    tipo: "textarea", requerido: true
  },
  {
    id: "instituciones",
    titulo: "¿Qué instituciones deberían mantenerse, reformarse o sustituirse?",
    tipo: "textarea", requerido: true
  },
  {
    id: "economia",
    titulo: "¿Cuáles consideras que son las principales causas de las dificultades económicas de Cuba?",
    tipo: "textarea", requerido: true
  },
  {
    id: "bloqueo",
    titulo: "¿Qué responsabilidad atribuyes al embargo estadounidense?",
    tipo: "textarea", requerido: true
  },
  {
    id: "gobierno",
    titulo: "¿Qué responsabilidad atribuyes a las decisiones económicas del Gobierno cubano?",
    tipo: "textarea", requerido: true
  },
  {
    id: "economiaPlan",
    titulo: "¿Qué cambios económicos propondrías?",
    tipo: "textarea", requerido: true
  },
  {
    id: "salarios",
    titulo: "¿Cómo mejorarías los salarios y el acceso a productos básicos?",
    tipo: "textarea", requerido: true
  },
  {
    id: "servicios",
    titulo: "¿Qué cambios propondrías en salud y educación?",
    tipo: "textarea", requerido: true
  },
  {
    id: "proteccion",
    titulo: "¿Cómo protegerías a quienes apoyan al Gobierno actual y a quienes se oponen?",
    tipo: "textarea", requerido: true
  },
  {
    id: "eeuu",
    titulo: "¿Qué relación debería mantener Cuba con Estados Unidos?",
    tipo: "textarea", requerido: true
  },
  {
    id: "ayuda",
    titulo: "¿Qué condiciones deberían exigirse a la ayuda internacional?",
    tipo: "textarea", requerido: true
  },
  {
    id: "riesgos",
    titulo: "¿Qué riesgos tendría una transición política y cómo podrían reducirse?",
    tipo: "textarea", requerido: true
  },
  {
    id: "participacion",
    titulo: "¿Qué formas de participación ciudadana consideras legítimas y eficaces?",
    tipo: "textarea", requerido: true
  },
  {
    id: "reconsiderar",
    titulo: "¿Qué tendría que ocurrir para que reconsideraras tu elección?",
    tipo: "textarea", requerido: true
  },
  {
    id: "cincoAnos",
    titulo: "¿Cómo imaginas Cuba cinco años después de una transición?",
    tipo: "textarea", requerido: true
  },
  {
    id: "protesta",
    titulo: "¿Participarías en una protesta pacífica?",
    tipo: "radio", requerido: true,
    opciones: ["Sí", "No", "Prefiero no responder"]
  },
  {
    id: "protestaMotivo",
    titulo: "Si quieres, explica por qué participarías o por qué no.",
    tipo: "textarea", requerido: false
  },
  {
    id: "cambio",
    titulo: "¿Qué vía de cambio político prefieres?",
    tipo: "radio", requerido: true,
    opciones: [
      "Elecciones y reformas institucionales",
      "Diálogo y acuerdos",
      "Protestas pacíficas",
      "Una combinación de estas vías",
      "Otra vía"
    ]
  }
];

function leerDatos() {
  try {
    const datos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (
      datos &&
      Array.isArray(datos.votos) &&
      Array.isArray(datos.declaraciones)
    ) return datos;
  } catch (_) {}
  return { votos: [], declaraciones: [] };
}

function guardarDatos(datos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
}

function mostrar(id) {
  pantallas.forEach((pantalla) => {
    $(pantalla).classList.toggle("hidden", pantalla !== id);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function calcularFechaNacimiento(valor) {
  if (!valor) return { valida: false, prefijo: "" };

  const [anio, mes, dia] = valor.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    fecha.getUTCFullYear() !== anio ||
    fecha.getUTCMonth() !== mes - 1 ||
    fecha.getUTCDate() !== dia
  ) return { valida: false, prefijo: "" };

  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;

  if (
    hoy.getMonth() + 1 < mes ||
    (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)
  ) edad--;

  if (edad < 16 || edad > 100) {
    return { valida: false, prefijo: "" };
  }

  const prefijo =
    String(anio).slice(-2) +
    String(mes).padStart(2, "0") +
    String(dia).padStart(2, "0");

  return { valida: true, prefijo };
}

$("fecha").addEventListener("change", (evento) => {
  const valor = evento.target.value;
  const salida = $("prefijoFecha");

  if (!valor) {
    salida.textContent = "";
    return;
  }

  const resultado = calcularFechaNacimiento(valor);
  salida.textContent = resultado.valida
    ? `Prefijo de fecha de demostración: ${resultado.prefijo}`
    : "Fecha inválida o edad fuera del intervalo de 16 a 100 años.";
});

$("comenzar").addEventListener("click", () => {
  if (window.confirm("¿Deseas participar en esta consulta de demostración?")) {
    mostrar("formulario");
  }
});

$("datosForm").addEventListener("submit", (evento) => {
  evento.preventDefault();

  const fecha = $("fecha").value;
  if (fecha && !calcularFechaNacimiento(fecha).valida) {
    alert("Comprueba la fecha de nacimiento.");
    return;
  }

  mostrar("opciones");
});

function crearCampo(pregunta) {
  const grupo = document.createElement("div");
  grupo.className = "question";
  const etiqueta = document.createElement("label");
  etiqueta.textContent = pregunta.titulo;
  etiqueta.htmlFor = `q_${pregunta.id}`;
  grupo.appendChild(etiqueta);

  if (pregunta.tipo === "textarea") {
    const area = document.createElement("textarea");
    area.id = `q_${pregunta.id}`;
    area.name = pregunta.id;
    area.rows = 3;
    area.maxLength = 1200;
    area.required = Boolean(pregunta.requerido);
    grupo.appendChild(area);
  } else {
    const fieldset = document.createElement("fieldset");
    fieldset.id = `q_${pregunta.id}`;
    pregunta.opciones.forEach((opcion, indice) => {
      const fila = document.createElement("label");
      fila.className = "radio-line";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = pregunta.id;
      radio.value = opcion;
      radio.required = Boolean(pregunta.requerido && indice === 0);
      fila.append(radio, document.createTextNode(opcion));
      fieldset.appendChild(fila);
    });
    grupo.appendChild(fieldset);
  }

  return grupo;
}

function iniciarPreguntas(opcion) {
  opcionElegida = opcion;
  const preguntas = [
    ...(opcion === "rojo" ? preguntasRojo : preguntasAzul),
    ...preguntasComunes
  ];

  $("tituloPreguntas").textContent =
    opcion === "rojo" ? "Formulario — opción roja" : "Formulario — opción azul";

  $("introPreguntas").textContent =
    opcion === "rojo"
      ? "Explica tus razones, los aspectos que apoyas y los cambios que propondrías."
      : "Explica por qué deseas un cambio, qué alternativa propones y cómo protegerías los derechos de todos.";

  const contenedor = $("camposPreguntas");
  contenedor.replaceChildren();
  preguntas.forEach((pregunta) => contenedor.appendChild(crearCampo(pregunta)));
  $("consentirPublicacion").checked = false;
  mostrar("preguntas");
}

document.querySelectorAll("[data-option]").forEach((boton) => {
  boton.addEventListener("click", () => iniciarPreguntas(boton.dataset.option));
});

function respuestasFormulario() {
  const respuestas = [];
  const campos = $("camposPreguntas").querySelectorAll("textarea, fieldset");

  campos.forEach((campo) => {
    let valor = "";
    if (campo.tagName === "TEXTAREA") {
      valor = campo.value.trim();
    } else {
      const seleccionado = campo.querySelector("input:checked");
      valor = seleccionado ? seleccionado.value : "";
    }
    if (valor) {
      const etiqueta = campo.closest(".question")?.querySelector("label");
      respuestas.push({ pregunta: etiqueta?.textContent || "", respuesta: valor });
    }
  });

  return respuestas;
}

function crearDeclaracion(opcion, respuestas) {
  const introduccion = opcion === "rojo"
    ? "Yo pienso que la continuidad del sistema político cubano debe valorarse teniendo en cuenta sus logros, sus dificultades y los cambios que considero necesarios."
    : "Yo pienso que Cuba necesita evaluar alternativas políticas y económicas, protegiendo los derechos de toda la población durante cualquier cambio.";

  const partes = [introduccion];

  respuestas.forEach(({ pregunta, respuesta }) => {
    partes.push(`${pregunta} Mi respuesta es: ${respuesta}`);
  });

  return partes.join("\n\n");
}

$("preguntasForm").addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!opcionElegida) return;

  const respuestas = respuestasFormulario();
  const declaracion = crearDeclaracion(opcionElegida, respuestas);
  const autoriza = $("consentirPublicacion").checked;

  declaracionActual = declaracion;
  $("declaracionPrevia").textContent = declaracion;
  $("estadoPublicacion").textContent = autoriza
    ? "La declaración se añadirá a la lista local de esta demostración."
    : "La declaración no se publicará en la lista. Solo se muestra aquí para que puedas leerla.";

  const datos = leerDatos();
  datos.votos.push(opcionElegida);

  if (autoriza) {
    datos.declaraciones.unshift({
      opcion: opcionElegida,
      texto: declaracion,
      fecha: new Date().toISOString()
    });
  }

  guardarDatos(datos);
  actualizarResultados();
  mostrar("resultado");
});

function actualizarResultados() {
  const datos = leerDatos();
  const rojos = datos.votos.filter((v) => v === "rojo").length;
  const azules = datos.votos.filter((v) => v === "azul").length;
  const total = rojos + azules;
  const pctRojo = total ? Math.round(rojos / total * 100) : 0;
  const pctAzul = total ? 100 - pctRojo : 0;

  $("totalVotos").textContent = `${total} participaciones locales`;
  $("totalRojo").textContent = `Rojo: ${rojos} (${pctRojo}%)`;
  $("totalAzul").textContent = `Azul: ${azules} (${pctAzul}%)`;
  $("barraRoja").style.width = `${pctRojo}%`;
  $("barraAzul").style.width = `${pctAzul}%`;
  $("barraRoja").style.display = total ? "block" : "none";
  $("barraAzul").style.display = total ? "block" : "none";
  mostrarDeclaraciones("todos");
}

function mostrarDeclaraciones(filtro) {
  const datos = leerDatos();
  const lista = $("listaDeclaraciones");
  const declaraciones = datos.declaraciones.filter((d) =>
    filtro === "todos" || d.opcion === filtro
  );

  $("tituloDeclaraciones").textContent =
    filtro === "rojo" ? "Declaraciones de opción roja" :
    filtro === "azul" ? "Declaraciones de opción azul" :
    "Declaraciones autorizadas";

  lista.replaceChildren();

  if (!declaraciones.length) {
    const p = document.createElement("p");
    p.className = "help";
    p.textContent = "No hay declaraciones autorizadas en esta categoría en este navegador.";
    lista.appendChild(p);
    return;
  }

  declaraciones.forEach((declaracion) => {
    const article = document.createElement("article");
    article.className = `statement ${declaracion.opcion}`;

    const etiqueta = document.createElement("strong");
    etiqueta.textContent = declaracion.opcion === "rojo" ? "Opción roja" : "Opción azul";

    const texto = document.createElement("p");
    texto.textContent = declaracion.texto;

    article.append(etiqueta, texto);
    lista.appendChild(article);
  });
}

$("verRojo").addEventListener("click", () => mostrarDeclaraciones("rojo"));
$("verAzul").addEventListener("click", () => mostrarDeclaraciones("azul"));

$("volver").addEventListener("click", () => {
  $("datosForm").reset();
  $("preguntasForm").reset();
  $("prefijoFecha").textContent = "";
  opcionElegida = null;
  mostrar("inicio");
});

actualizarResultados();
