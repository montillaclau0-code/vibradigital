// Buscamos los elementos del HTML por su id
const radio = document.getElementById("radio");
const btn = document.getElementById("btn");
const tarjeta = document.getElementById("tarjeta");
const titulo = document.getElementById("titulo");
const estado = document.getElementById("estado");
const mascota = document.getElementById("mascota");

// Cambia el botón, la mascota y la onda entre "sonando" y "en pausa"
function mostrarSonando(sonando) {
  tarjeta.classList.toggle("sonando", sonando);
  mascota.classList.toggle("sonando", sonando);
  mascota.setAttribute("aria-label", sonando ? "Pausar la radio" : "Reproducir la radio");
  btn.textContent = sonando ? "❚❚" : "▶";
  btn.setAttribute("aria-label", sonando ? "Pausar" : "Reproducir");
}

// Busca en la lista de Programación cuál es el próximo programa.
// Lee las filas del HTML, así que si cambias los horarios allá, se actualiza solo.
// Los horarios deben estar escritos como "6:00 AM" o "9:30 PM".
function proximoPrograma() {
  const ahora = new Date();
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const lista = [];

  document.querySelectorAll("#programacion li").forEach((fila) => {
    const hora = fila.querySelector("strong").textContent.trim();
    const nombre = fila.textContent.replace(hora, "").trim();
    const partes = hora.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!partes) return;
    let h = parseInt(partes[1], 10) % 12;
    if (partes[3].toUpperCase() === "PM") h += 12;
    lista.push({ minutos: h * 60 + parseInt(partes[2], 10), hora, nombre });
  });

  if (lista.length === 0) return null;
  lista.sort((a, b) => a.minutos - b.minutos);

  const siguiente = lista.find((p) => p.minutos > minutosAhora);
  if (siguiente) return { ...siguiente, manana: false };
  return { ...lista[0], manana: true }; // ya pasaron todos: el primero de mañana
}

// Textos de la tarjeta
function textoNormal() {
  titulo.textContent = "Transmisión en vivo";
  estado.textContent = "Vibra Digital Radio";
}

function mostrarFueraDelAire() {
  mostrarSonando(false);
  const p = proximoPrograma();
  titulo.textContent = "Fuera del aire";
  estado.textContent = p
    ? "Próximo: " + p.nombre + " · " + (p.manana ? "mañana " : "") + p.hora
    : "Vuelve pronto";
}

// Evita que un segundo toque cancele la conexión mientras todavía está conectando
let conectando = false;

// Si tarda demasiado en conectar, se rinde después de estos milisegundos
function limiteDeEspera(ms) {
  return new Promise((_, rechazar) =>
    setTimeout(() => rechazar(new Error("tiempo agotado")), ms)
  );
}

btn.addEventListener("click", async () => {
  if (conectando) return; // ya está conectando: no hacemos nada

  if (radio.paused) {
    conectando = true;
    btn.textContent = "…";
    titulo.textContent = "Conectando…";
    estado.textContent = "Esto puede tardar unos segundos";
    try {
      await Promise.race([radio.play(), limiteDeEspera(15000)]);
      mostrarSonando(true);
      titulo.textContent = "Transmisión en vivo";
      estado.textContent = "Sonando ahora";
    } catch (error) {
      // Pasa si nadie está transmitiendo, si la URL está mal, si no hay internet o si hay VPN
      console.log("Error:", error.name, error.message);
      console.log("URL usada:", radio.src);
      radio.pause();
      radio.load();
      mostrarFueraDelAire();
    } finally {
      conectando = false;
    }
  } else {
    radio.pause();
    radio.load(); // al volver a darle play, escucha lo que suena ahora y no lo que quedó guardado
    mostrarSonando(false);
    textoNormal();
  }
});

// Tocar a la mascota hace lo mismo que el botón de play
mascota.addEventListener("click", () => btn.click());

// Si la transmisión se corta mientras suena
radio.addEventListener("error", mostrarFueraDelAire);
radio.addEventListener("ended", mostrarFueraDelAire);
