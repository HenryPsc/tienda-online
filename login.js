const formLogin = document.getElementById("formLogin");
const inputUsuario = document.getElementById("username");
const inputClave = document.getElementById("password");
const errorMensaje = document.getElementById("errorMensaje");

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMensaje.textContent = "";

  const datos = {
    username: inputUsuario.value,
    password: inputClave.value
  };

  try {
    const respuesta = await fetch("https://fakestoreapi.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    if (!respuesta.ok) throw new Error("Credenciales incorrectas");

    const resultado = await respuesta.json();

    localStorage.setItem("token", resultado.token);

    window.location.href = "index.html";

  } catch (error) {
    errorMensaje.textContent = error.message;
  }
});