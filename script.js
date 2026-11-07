// Buscamos los elementos del HTML por su id
const radio = document.getElementById("radio");
const btn = document.getElementById("btn");
const tarjeta = document.getElementById("tarjeta");
const estado = document.getElementById("estado");
const mascota = document.getElementById("mascota");

// Muestra el estado "sonando" o "en pausa"
function mostrarSonando(sonando) {
  tarjeta.classList.toggle("sonando", sonando);
  mascota.classList.toggle("sonando", sonando);
  mascota.setAttribute("aria-label", sonando ? "Pausar la radio" : "Reproducir la radio");
  btn.textContent = sonando ? "❚❚" : "▶";
  btn.setAttribute("aria-label", sonando ? "Pausar" : "Reproducir");
}

// Tocar a la mascota hace lo mismo que el botón de play
mascota.addEventListener("click", () => btn.click());

btn.addEventListener("click", async () => {
  if (radio.paused) {
    try {
      await radio.play();
      mostrarSonando(true);
      estado.textContent = "Sonando ahora";
    } catch (error) {
      // Pasa si la URL del stream está mal o no hay internet
      console.log("Error:", error.name, error.message);
      console.log("URL usada:", radio.src);
      mostrarSonando(false);
      estado.textContent = "No se pudo conectar (" + error.name + ")";
    }
  } else {
    radio.pause();
    mostrarSonando(false);
    estado.textContent = "Vibra Digital Radio";
  }
});
