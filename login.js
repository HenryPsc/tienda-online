// login.js

// Obtener elementos del DOM
const form = document.getElementById("form-login");
const mensajeError = document.getElementById("mensaje-error");
const mirarCatalogoBtn = document.getElementById("mirar-catalogo-btn"); // Botón para ir al catálogo sin iniciar sesión

// --- Event Listeners ---

// Event listener para el formulario de login
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevenir el envío por defecto del formulario

  // Limpiar mensajes de error previos
  mensajeError.classList.add("hidden");
  mensajeError.textContent = "";

  // Obtener y limpiar los valores de los campos
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validar campos vacíos
  if (!email || !password) {
    mostrarError("Por favor, completa ambos campos.");
    return; // Detener la ejecución si hay campos vacíos
  }

  try {
    // Realizar la petición POST al endpoint de login de la API
    const respuesta = await fetch("http://127.0.0.1:8000/api/login", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", // Indicar que el cuerpo de la petición es JSON
        "Accept": "application/json"       // Indicar que esperamos una respuesta JSON
      },
      body: JSON.stringify({ // Convertir los datos a JSON string
        email: email,
        password: password 
      }),
    });

    // Parsear la respuesta como JSON
    const data = await respuesta.json();

    // Si la respuesta no es OK (código de estado 2xx), lanzar un error
    if (!respuesta.ok) {
      // Usar el mensaje del servidor si está disponible, sino un mensaje genérico
      throw new Error(data.message || "Credenciales inválidas");
    }

    // --- Autenticación Exitosa ---
    // Almacenar el token de acceso y el estado de logueado en localStorage
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("logueado", "true");
    // Almacenar la información del usuario (id, nombre, email, rol) como un string JSON
    localStorage.setItem("usuario", JSON.stringify({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      rol: data.user.rol
    }));

    // Redireccionar al usuario según su rol o destino predefinido
    redirigirSegunRol(data.user.rol);

  } catch (error) {
    // Capturar y mostrar cualquier error que ocurra durante el fetch o el procesamiento
    mostrarError(error.message);
    console.error("Error en login:", error); // Imprimir el error completo en consola para depuración
  }
});

// Event listener para el nuevo botón "Mirar Catálogo"
mirarCatalogoBtn.addEventListener("click", () => {
  // Redirigir al usuario al index.html directamente
  window.location.href = "index.html";
});

// --- Funciones Auxiliares ---

/**
 * Muestra un mensaje de error en la interfaz.
 * @param {string} mensaje - El mensaje de error a mostrar.
 */
function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
  mensajeError.classList.remove("hidden"); // Remover la clase 'hidden' para hacerlo visible
}

/**
 * Redirige al usuario basado en su rol.
 * Ahora, los administradores son redirigidos a admin.html.
 * @param {string} rol - El rol del usuario (ej. 'admin', 'cliente').
 */
function redirigirSegunRol(rol) {
  if (rol === 'admin') {
    window.location.href = "admin.html"; // Redirigir administradores a su panel
  } else {
    window.location.href = "index.html"; // Todos los demás (clientes) van al catálogo principal
  }
}
