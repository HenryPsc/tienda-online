document.addEventListener("DOMContentLoaded", () => {
    const ordersListContainer = document.getElementById("orders-list");

    // =================================================================================================
    // FUNCIONES PARA CARGAR Y RENDERIZAR PEDIDOS
    // =================================================================================================

    async function loadOrders() {
        ordersListContainer.innerHTML = `<p class="text-center text-gray-500">Cargando tus pedidos...</p>`;
        const token = localStorage.getItem('token');

        if (!token) {
            ordersListContainer.innerHTML = `<p class="text-red-500 text-center">Debes iniciar sesión para ver tus pedidos.</p>`;
            // Opcional: Redirigir al login
            // window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/pedidos', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error al cargar pedidos: ${response.statusText}`);
            }

            renderOrders(data);
        } catch (error) {
            console.error('Error al cargar los pedidos:', error);
            ordersListContainer.innerHTML = `<p class="text-red-500 text-center">Error al cargar tus pedidos: ${error.message}.</p>`;
        }
    }

    function renderOrders(orders) {
        ordersListContainer.innerHTML = ""; // Limpiar antes de renderizar

        if (orders.length === 0) {
            ordersListContainer.innerHTML = `<p class="text-center text-gray-500">Aún no has realizado ningún pedido.</p>`;
            return;
        }

        orders.forEach(order => {
            const orderCard = document.createElement("div");
            orderCard.className = "order-card"; // Usar clase personalizada

            // Formatear la fecha
            const orderDate = new Date(order.fecha_pedido || order.created_at).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            // Construir la lista de productos del pedido
            let productsHtml = '';
            // Asegúrate de que order.productos existe y es un array antes de iterar
            if (Array.isArray(order.productos) && order.productos.length > 0) {
                productsHtml = `
                    <div class="font-semibold text-gray-700 mt-4 mb-2">Productos del Pedido:</div>
                    <div class="order-item-grid border-b border-gray-300 pb-2 mb-2 font-medium">
                        <div>Imagen</div>
                        <div>Producto</div>
                        <div class="text-center">Cantidad</div>
                        <div class="text-right">Precio Unitario</div>
                        <div class="text-right">Subtotal</div>
                    </div>
                `;
                order.productos.forEach(item => {
                    // item.pivot contiene los campos de la tabla pivote
                    // item.imagen, item.titulo son de la tabla productos
                    const imageUrl = item.imagen && item.imagen !== 'undefined'
                        ? item.imagen
                        : 'https://placehold.co/50x50/e0e0e0/505050?text=No+Img';
                    
                    productsHtml += `
                        <div class="order-item-grid">
                            <div class="flex justify-center"><img src="${imageUrl}" alt="${item.titulo}" class="w-12 h-12 object-cover rounded"></div>
                            <div>${item.titulo}</div>
                            <div class="text-center">${item.pivot.cantidad}</div>
                            <div class="text-right">$${parseFloat(item.pivot.precio_unitario).toFixed(2)}</div>
                            <div class="text-right">$${parseFloat(item.pivot.subtotal).toFixed(2)}</div>
                        </div>
                    `;
                });
            } else {
                productsHtml = '<p class="text-gray-500 text-sm mt-4">No hay productos en este pedido.</p>';
            }
            
            // Usar order.direccion.direccion si existe, si no, un fallback
            const shippingAddress = order.direccion 
                ? `${order.direccion.direccion}, ${order.direccion.ciudad}, ${order.direccion.provincia}`
                : 'Dirección no disponible';

            orderCard.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-xl font-semibold text-blue-700">Pedido #${order.id}</h3>
                    <span class="px-3 py-1 text-sm font-medium rounded-full ${order.estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}">
                        ${order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                    </span>
                </div>
                <p class="text-gray-600 mb-1">Fecha: ${orderDate}</p>
                <p class="text-gray-600 mb-1">Dirección de Envío: ${shippingAddress}</p>
                <p class="text-lg font-bold text-gray-800 mt-2">Total: $${parseFloat(order.total).toFixed(2)}</p>
                
                ${productsHtml}

                <div class="mt-4 text-right">
                    <button class="btn-primary btn-view-details bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300" data-id="${order.id}">Ver Detalles</button>
                </div>
            `;
            ordersListContainer.appendChild(orderCard);
        });

        attachOrderEventListeners();
    }

    function attachOrderEventListeners() {
        document.querySelectorAll(".btn-view-details").forEach(button => {
            button.addEventListener("click", async (e) => {
                const orderId = e.currentTarget.dataset.id;
                alert(`Funcionalidad de ver detalles del pedido #${orderId} (Endpoint /api/pedidos/{id} ya implementado en backend)`);
                // En una app real, aquí podrías abrir un modal con más detalles o redirigir a una página de detalle de pedido
                // window.location.href = `detalle_pedido.html?id=${orderId}`;
            });
        });
    }

    // =================================================================================================
    // INICIALIZACIÓN
    // =================================================================================================
    loadOrders();
});

function mostrarPedidos(pedidos) {
  const contenedor = document.getElementById("orders-list");
  contenedor.innerHTML = "";
  pedidos.forEach(pedido => {
    const div = document.createElement("div");
    div.className = "bg-white rounded-lg shadow p-4 flex flex-col";
    div.innerHTML = `
      <div class="font-semibold text-blue-700 mb-2">Pedido #${pedido.id}</div>
      <div class="text-gray-600 mb-1">Fecha: ${pedido.fecha}</div>
      <div class="text-gray-700 mb-2">Estado: <span class="font-bold text-green-600">${pedido.estado}</span></div>
      <div class="text-sm text-gray-500">Total: $${pedido.total}</div>
    `;
    contenedor.appendChild(div);
  });
}