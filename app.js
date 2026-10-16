
function abrirRegistro() {
  document.getElementById("registro").hidden = false;
  document.getElementById("registro").scrollIntoView({
    behavior: "smooth"
  });
}

function cerrarRegistro() {
  document.getElementById("registro").hidden = true;
}

function registrarPaciente(evento) {
  evento.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const nacimiento = document.getElementById("nacimiento").value;
  const tutor = document.getElementById("tutor").value.trim();

  if (!nombre || !nacimiento || !tutor) {
    alert("Completa los campos obligatorios.");
    return;
  }

  document.getElementById("resultado").textContent =
    "Expediente de demostración PAC-000001: " +
    nombre + " | Tutor: " + tutor;

  cerrarRegistro();
  alert("Paciente de prueba registrado en pantalla.");
}
