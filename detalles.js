const contenedor = document.getElementById("detalleProducto");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function cargarProducto() {
  try {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`);
    if (!res.ok) throw new Error("Producto no encontrado");

    const producto = await res.json();

    contenedor.innerHTML = `
      <div class="flex flex-col md:flex-row gap-6">
        <img src="${producto.image}" alt="${producto.title}" class="w-48 h-48 object-contain mx-auto md:mx-0" />
        <div>
          <h2 class="text-2xl font-bold mb-2">${producto.title}</h2>
          <p class="text-gray-700 mb-2"><strong>Precio:</strong> $${producto.price}</p>
          <p class="text-gray-600 mb-4">${producto.description}</p>
          <p class="text-sm text-gray-500">Categoría: ${producto.category}</p>
          <button class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Agregar al carrito</button>
        </div>
      </div>
    `;
  } catch (error) {
    contenedor.innerHTML = `<p class="text-red-500 text-center">${error.message}</p>`;
  }
}

cargarProducto();