const contenedorProductos = document.getElementById("productos");
const inputBusqueda = document.getElementById("busqueda");
const contenedorCategorias = document.getElementById("categorias");

let Aproductos = [];
let categoriaSeleccionada = "all";

async function cargarProductos() {
  try {
    mostrarMensaje("Cargando productos...");
    const respuesta = await fetch("https://fakestoreapi.com/products");

    if (!respuesta.ok) throw new Error("Error en la respuesta de la API");

    const productos = await respuesta.json();
    Aproductos = productos;

    if (productos.length === 0) {
      mostrarMensaje("No hay productos disponibles");
    } else {
      mostrarProductos(productos);
    }
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    mostrarMensaje("Error al cargar los productos");
  }
}

async function cargarCategorias() {
  try {
    const respuesta = await fetch("https://fakestoreapi.com/products/categories");
    if (!respuesta.ok) throw new Error("Error en la respuesta de la API");

    const categorias = await respuesta.json();
    mostrarCategorias(["all", ...categorias]);
  } catch (error) {
    console.error("Error al cargar las categorías:", error);
  }
}

function mostrarMensaje(mensaje) {
  contenedorProductos.innerHTML = `
    <p class="text-center col-span-full text-gray-500">${mensaje}</p>`;
}

function mostrarProductos(productos) {
  contenedorProductos.innerHTML = "";

  if (productos.length === 0) {
    mostrarMensaje("No se encontraron productos.");
    return;
  }

  productos.forEach((producto) => {
    const productoDiv = document.createElement("div");
    productoDiv.className = "bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-xl transition-shadow duration-300 cursor-pointer";

    productoDiv.addEventListener("click", () => {
      window.location.href = `detalles.html?id=${producto.id}`;
    });

    productoDiv.innerHTML = `
      <img src="${producto.image}" alt="${producto.title}" class="w-32 h-32 object-contain mb-4 rounded-lg">
      <h2 class="text-lg font-semibold mb-2 text-center">${producto.title}</h2>
      <p class="text-gray-700 font-bold mb-2">$${producto.price}</p>
      <p class="text-gray-600 text-sm mb-4 text-center">${producto.description.slice(0, 100)}...</p>
    `;

    contenedorProductos.appendChild(productoDiv);
  });
}


function mostrarCategorias(categorias) {
  contenedorCategorias.innerHTML = "";

  categorias.forEach((cat) => {
    const btn = document.createElement("button");

    const textoBoton = cat === "all" ? "Todos" : cat.charAt(0).toUpperCase() + cat.slice(1);
    const claseActiva = categoriaSeleccionada === cat ? "bg-blue-700" : "bg-blue-500";

    btn.textContent = textoBoton;
    btn.className = `px-4 py-2 rounded-full text-white ${claseActiva} hover:bg-blue-600 transition-colors duration-300`;

    btn.addEventListener("click", () => {
      categoriaSeleccionada = cat;
      mostrarCategorias(categorias);
      filtrarProductos();
    });

    contenedorCategorias.appendChild(btn);
  });
}

function filtrarProductos() {
  let filtrados = Aproductos;
  const texto = inputBusqueda.value.toLowerCase().trim();

  if (categoriaSeleccionada !== "all") {
    filtrados = filtrados.filter(p => p.category === categoriaSeleccionada);
  }

  if (texto !== "") {
    filtrados = filtrados.filter(p =>
      p.title.toLowerCase().includes(texto) ||
      p.description.toLowerCase().includes(texto)
    );
  }

  mostrarProductos(filtrados);
}

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  cargarCategorias();
});

const btnCerrarSesion = document.getElementById("cerrarSesion");
btnCerrarSesion.addEventListener("click", () => {
  window.location.href = "inicio.html";
});

const btnContacto = document.getElementById("contacto");
btnContacto.addEventListener("click", () => {
  window.location.href = "contacto.html";
});
inputBusqueda.addEventListener("input", filtrarProductos);