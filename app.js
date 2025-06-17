// app.js

// Obtener elementos del DOM
const contenedorProductos = document.getElementById("productos");
const inputBusqueda = document.getElementById("busqueda");
const contenedorCategorias = document.getElementById("categorias");

// Seleccionar todos los enlaces de Admin y Logout por sus CLASES
const adminLinks = document.querySelectorAll(".nav-admin-link"); 
const logoutLinks = document.querySelectorAll(".nav-logout-link"); 

// NUEVOS: Enlaces para Mis Direcciones y Mis Pedidos
const misDireccionesLinks = document.querySelectorAll(".nav-mis-direcciones-link");
const misPedidosLinks = document.querySelectorAll(".nav-mis-pedidos-link");


let Aproductos = []; // Almacena todos los productos cargados
let categoriaSeleccionada = "all";

// =================================================================================================
// FUNCIONES DE CARGA Y MOSTRADO DE PRODUCTOS/CATEGORÍAS
// =================================================================================================

async function cargarProductos() {
    try {
        mostrarMensaje("Cargando productos...");
        const respuesta = await fetch("http://127.0.0.1:8000/api/productos");
        if (!respuesta.ok) {
            const errorData = await respuesta.json().catch(() => ({ message: "Error desconocido" }));
            throw new Error(`Error ${respuesta.status}: ${errorData.message || respuesta.statusText}`);
        }
        const productos = await respuesta.json();
        Aproductos = productos;

        if (productos.length === 0) {
            console.log("No hay productos disponibles");
            mostrarMensaje("No hay productos disponibles."); 
        } else {
            mostrarProductos(productos);
        }
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        contenedorProductos.innerHTML = `<p class="text-red-500 text-center col-span-full">Error al cargar los productos. Intenta nuevamente.</p>`;
    }
}

async function cargarCategorias() {
    try {
        const respuesta = await fetch("http://127.0.0.1:8000/api/categorias");
        if (!respuesta.ok) {
             const errorData = await respuesta.json().catch(() => ({ message: "Error desconocido" }));
            throw new Error(`Error ${respuesta.status}: ${errorData.message || respuesta.statusText}`);
        }
        const categorias = await respuesta.json();
        mostrarCategorias(["all", ...categorias]);
    } catch (error) {
        console.error("Error al cargar las categorías:", error);
        contenedorCategorias.innerHTML = `<p class="text-red-500 text-center">Error al cargar las categorías.</p>`;
    }
}

async function filtrarProductos() {
    let filtrados = Aproductos;
    const texto = inputBusqueda.value.toLowerCase();

    if (categoriaSeleccionada !== "all") {
        filtrados = filtrados.filter(p =>
            Array.isArray(p.categorias) && p.categorias.some(cat => cat.nombre.toLowerCase() === categoriaSeleccionada.toLowerCase())
        );
    }

    if (texto.trim() !== "") {
        filtrados = filtrados.filter(p =>
            (p.titulo && p.titulo.toLowerCase().includes(texto)) || 
            (p.descripcion && p.descripcion.toLowerCase().includes(texto))
        );
    }

    if (filtrados.length === 0) {
        mostrarMensaje("No se encontraron productos que coincidan con tu búsqueda o filtros.");
    } else {
        mostrarProductos(filtrados);
    }
}

function mostrarMensaje(mensaje) {
    contenedorProductos.innerHTML = `<p class="text-center col-span-full text-gray-500">${mensaje}</p>`;
}

function mostrarProductos(productos) {
    contenedorProductos.innerHTML = "";
    if (productos.length === 0) {
        mostrarMensaje("No hay productos para mostrar.");
        return;
    }

    productos.forEach((producto) => {
        const productoDiv = document.createElement("div");
        productoDiv.className = "bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-xl transition-shadow duration-300";

        const imageUrl = producto.imagen && producto.imagen !== 'undefined' && producto.imagen !== ''
            ? producto.imagen
            : 'https://placehold.co/400x300/e0e0e0/505050?text=Sin+Imagen';

        // Mostrar stock y ocultar botón si no hay stock
        const hayStock = producto.stock > 0;

        productoDiv.innerHTML = `
            <img src="${imageUrl}" alt="${producto.titulo}" class="w-32 h-32 object-cover mb-4 rounded-lg">
            <h2 class="text-lg font-semibold mb-2">${producto.titulo}</h2>
            <p class="text-green-700 mb-2">$${producto.precio}</p>
            <p class="mb-2 ${hayStock ? 'text-gray-700' : 'text-red-600 font-semibold'}">
                Stock: ${producto.stock}
            </p>
            ${hayStock ? `
                <button class="add-to-cart-btn bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 mb-2" data-product-id="${producto.id}">Agregar al carrito</button>
            ` : `
                <span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">Sin stock</span>
            `}
            <button class="detalle-btn bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300" data-product-id="${producto.id}">Detalles</button>
        `;

        const botonDetalles = productoDiv.querySelector(".detalle-btn");
        botonDetalles.addEventListener("click", () => {
            window.location.href = `detalles.html?id=${producto.id}`;
        });

        // Solo agregar el listener si hay stock
        if (hayStock) {
            const botonAgregar = productoDiv.querySelector(".add-to-cart-btn");
            botonAgregar.addEventListener("click", (event) => {
                handleAddToCart(event.target.dataset.productId);
            });
        }

        contenedorProductos.appendChild(productoDiv);
    });
}

function mostrarCategorias(categorias) {
    contenedorCategorias.innerHTML = "";

    categorias.forEach((cat) => {
        const isAll = cat === "all";
        const nombre = isAll ? "Todos" : cat.nombre;
        const valor = isAll ? "all" : cat.nombre; 

        const btn = document.createElement("button");
        const claseActiva = categoriaSeleccionada.toLowerCase() === valor.toLowerCase() ? "bg-blue-700" : "bg-blue-500";

        btn.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        btn.className = `px-4 py-2 rounded-full text-white ${claseActiva} hover:bg-blue-600 transition-colors duration-300 text-sm md:text-base`; 

        btn.addEventListener("click", () => {
            categoriaSeleccionada = valor;
            mostrarCategorias(categorias); 
            filtrarProductos();
        });

        contenedorCategorias.appendChild(btn);
    });
}

// =================================================================================================
// LÓGICA DE AUTENTICACIÓN Y NAVEGACIÓN
// =================================================================================================

// Función auxiliar para gestionar la visibilidad de los enlaces de navegación
function updateNavLinksVisibility() {
    const usuarioData = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");
    let usuario = null;
    let isAdmin = false;
    let isLoggedIn = token === "true"; // Asegura que 'logueado' sea 'true'

    if (usuarioData) {
        try {
            usuario = JSON.parse(usuarioData);
            isAdmin = usuario.rol === 'admin';
            isLoggedIn = true; // Si hay datos de usuario, asumimos que está logueado
        } catch (e) {
            console.error("Error al parsear datos de usuario del localStorage:", e);
            localStorage.removeItem("token");
            localStorage.removeItem("logueado");
            localStorage.removeItem("usuario");
            isLoggedIn = false;
        }
    }

    adminLinks.forEach(link => { 
        if (isAdmin) {
            link.classList.remove('hidden'); 
        } else {
            link.classList.add('hidden'); 
        }
    });

    logoutLinks.forEach(link => { 
        if (isLoggedIn) {
            link.classList.remove('hidden'); 
            link.addEventListener("click", async (e) => {
                e.preventDefault();

                try {
                    const logoutToken = localStorage.getItem("token"); // Usar una variable diferente para evitar confusión
                    const respuesta = await fetch("http://127.0.0.1:8000/api/logout", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${logoutToken}`,
                            "Accept": "application/json",
                        },
                    });

                    if (!respuesta.ok) {
                        throw new Error("Error al cerrar sesión");
                    }
                } catch (error) {
                    console.error("Error en logout:", error);
                } finally {
                    localStorage.removeItem("token");
                    localStorage.removeItem("logueado");
                    localStorage.removeItem("usuario");
                    window.location.href = "login.html";
                }
            });
        } else {
            link.classList.add('hidden'); 
        }
    });

    // Mostrar/ocultar enlaces de Direcciones y Pedidos solo si está logueado
    misDireccionesLinks.forEach(link => {
        if (isLoggedIn) {
            link.classList.remove('hidden');
        } else {
            link.classList.add('hidden');
        }
    });

    misPedidosLinks.forEach(link => {
        if (isLoggedIn) {
            link.classList.remove('hidden');
        } else {
            link.classList.add('hidden');
        }
    });

    // OCULTAR BOTÓN CARRITO Y MIS PEDIDOS SI ES ADMIN
    document.querySelectorAll('a[href="carrito.html"], .nav-mis-pedidos-link').forEach(link => {
        if (isAdmin) {
            link.classList.add('hidden');
        } else {
            link.classList.remove('hidden');
        }
    });
}


async function handleAddToCart(productId) {
    const estaLogueado = localStorage.getItem("logueado") === "true";
    const token = localStorage.getItem("token"); // Obtener el token del localStorage
    
    if (!estaLogueado || !token) {
        alert("Necesitas iniciar sesión para añadir productos al carrito.");
        window.location.href = "login.html";
        return; 
    }

    const productoToAdd = Aproductos.find(p => p.id == productId);

    if (!productoToAdd) {
        console.error("Producto no encontrado para añadir al carrito:", productId);
        alert("Error: Producto no disponible.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/cart/add", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera
            },
            body: JSON.stringify({ 
                product_id: productId, 
                quantity: 1 // Siempre añadimos 1 unidad inicial al hacer clic en "Agregar al carrito"
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Manejar errores de la API (ej. validación fallida, producto no encontrado)
            throw new Error(data.message || `Error al añadir al carrito: ${response.statusText}`);
        }

        alert(data.message || `${productoToAdd.titulo} ha sido añadido/actualizado en tu carrito.`);
        console.log("Respuesta de la API de carrito:", data);

    } catch (error) {
        console.error("Error al añadir al carrito mediante API:", error);
        alert(`No se pudo añadir el producto al carrito: ${error.message}`);
    }
}


// =================================================================================================
// INICIALIZACIÓN AL CARGAR EL DOM
// =================================================================================================

document.addEventListener("DOMContentLoaded", () => {
    // === Lógica para mostrar/ocultar enlaces de navegación (Admin, Logout) ===
    updateNavLinksVisibility(); // Llamar a la función al cargar la página

    const menuBtn = document.getElementById("menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden"); 
        });
    }

    cargarProductos();
    cargarCategorias();
    inputBusqueda.addEventListener("input", filtrarProductos);
});

document.addEventListener("DOMContentLoaded", () => {
    const contactoLink = document.getElementById("contacto-link");
    if (contactoLink) {
        contactoLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "contacto.html";
        });
    }
});