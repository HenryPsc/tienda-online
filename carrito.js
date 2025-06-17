document.addEventListener("DOMContentLoaded", () => {
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalElement = document.getElementById("cart-total");
    const clearCartBtn = document.getElementById("clear-cart-btn");
    const checkoutBtn = document.getElementById("checkout-btn");

    let currentCartItems = []; // Almacenará los items del carrito

    // =================================================================================================
    // FUNCIONES PRINCIPALES DEL CARRITO (AHORA CONECTADAS A LA API DE LARAVEL)
    // =================================================================================================

    async function loadCartItems() {
        cartItemsContainer.innerHTML = `<p class="text-center text-gray-500">Cargando carrito...</p>`;
        const token = localStorage.getItem('token');

        if (!token) {
            cartItemsContainer.innerHTML = `<p class="text-red-500 text-center">Debes iniciar sesión para ver tu carrito.</p>`;
            cartTotalElement.textContent = "$0.00";
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/cart', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}` // Incluir el token en la cabecera
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error al cargar el carrito: ${response.statusText}`);
            }

            currentCartItems = data.items; // La API devuelve los ítems dentro de la propiedad 'items'
            renderCartItems(currentCartItems);
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            cartItemsContainer.innerHTML = `<p class="text-red-500 text-center">Error al cargar el carrito: ${error.message}.</p>`;
            cartTotalElement.textContent = "$0.00";
        }
    }

    function renderCartItems(items) {
        cartItemsContainer.innerHTML = ""; // Limpiar antes de renderizar

        if (items.length === 0) {
            cartItemsContainer.innerHTML = `<p class="text-center text-gray-500">Tu carrito está vacío.</p>`;
            cartTotalElement.textContent = "$0.00";
            return;
        }

        items.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "cart-item-grid items-center mb-4";
            
            // Usar item.producto.imagen porque la API carga la relación 'producto'
            const imageUrl = item.producto.imagen && item.producto.imagen !== 'undefined' && item.producto.imagen !== ''
                ? item.producto.imagen
                : 'https://placehold.co/100x100/e0e0e0/505050?text=Sin+Imagen';

            // Usar item.producto.precio porque la API carga la relación 'producto'
            const itemPrecio = parseFloat(item.producto.precio) || 0; 

            itemDiv.innerHTML = `
                <div class="item-image flex justify-center">
                    <img src="${imageUrl}" alt="${item.producto.titulo}" class="w-20 h-20 object-cover rounded-lg">
                </div>
                <div class="item-details">
                    <h3 class="font-semibold text-lg">${item.producto.titulo}</h3>
                    <p class="text-gray-600 text-sm md:hidden">Precio: $${itemPrecio.toFixed(2)}</p>
                </div>
                <div class="item-quantity flex items-center justify-center gap-2">
                    <button class="quantity-btn decrease-btn bg-gray-200 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-300 transition-colors" data-id="${item.product_id}" data-action="decrease">-</button>
                    <span class="text-lg font-medium">${item.quantity}</span>
                    <button class="quantity-btn increase-btn bg-gray-200 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-300 transition-colors" data-id="${item.product_id}" data-action="increase">+</button>
                </div>
                <div class="item-price text-right text-lg font-semibold">
                    $${(itemPrecio * item.quantity).toFixed(2)}
                </div>
                <div class="item-delete flex justify-center">
                    <button class="remove-item-btn text-red-500 hover:text-red-700 transition-colors" data-id="${item.product_id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        updateCartTotal(items);
        attachEventListeners(); // Adjuntar listeners después de renderizar
    }

    function updateCartTotal(items) {
        const total = items.reduce((sum, item) => sum + ((parseFloat(item.producto.precio) || 0) * item.quantity), 0); // Usar item.producto.precio
        cartTotalElement.textContent = `$${total.toFixed(2)}`;
    }

    // =================================================================================================
    // MANEJO DE EVENTOS Y ACCIONES DEL CARRITO (AHORA CONECTADAS A LA API)
    // =================================================================================================

    function attachEventListeners() {
        document.querySelectorAll(".quantity-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const productId = e.target.dataset.id;
                const action = e.target.dataset.action;
                let item = currentCartItems.find(i => i.product_id == productId);

                if (!item) return;

                let newQuantity = item.quantity;
                if (action === "increase") {
                    newQuantity++;
                } else if (action === "decrease") {
                    newQuantity--;
                }

                if (newQuantity > 0) {
                    await updateQuantity(productId, newQuantity);
                } else {
                    await removeItem(productId); 
                }
            });
        });

        document.querySelectorAll(".remove-item-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const productId = e.target.closest("button").dataset.id; 
                await removeItem(productId);
            });
        });
    }

    async function updateQuantity(productId, newQuantity) {
        const token = localStorage.getItem('token');
        if (!token) { alert("Sesión expirada. Inicia sesión."); window.location.href = 'login.html'; return; }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/cart/update/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error al actualizar la cantidad: ${response.statusText}`);
            }
            alert(data.message || "Cantidad actualizada.");
            loadCartItems(); // Recargar el carrito para reflejar cambios desde la DB
        } catch (error) {
            console.error('Error al actualizar cantidad en API:', error);
            alert(`No se pudo actualizar la cantidad: ${error.message}`);
        }
    }

    async function removeItem(productId) {
        const token = localStorage.getItem('token');
        if (!token) { alert("Sesión expirada. Inicia sesión."); window.location.href = 'login.html'; return; }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/cart/remove/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error al eliminar el producto: ${response.statusText}`);
            }
            alert(data.message || "Producto eliminado del carrito.");
            loadCartItems(); // Recargar el carrito
        } catch (error) {
            console.error('Error al eliminar item en API:', error);
            alert(`No se pudo eliminar el producto: ${error.message}`);
        }
    }

    async function clearCart() {
        const token = localStorage.getItem('token');
        if (!token) { alert("Sesión expirada. Inicia sesión."); window.location.href = 'login.html'; return; }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/cart/clear', {
                method: 'POST', // Usamos POST para clear, como lo definimos en rutas
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error al vaciar el carrito: ${response.statusText}`);
            }
            alert(data.message || "Carrito vaciado exitosamente.");
            loadCartItems(); // Recargar (estará vacío)
        } catch (error) {
            console.error('Error al vaciar carrito en API:', error);
            alert(`No se pudo vaciar el carrito: ${error.message}`);
        }
    }

    async function proceedToCheckout() {
        const token = localStorage.getItem('token');
        if (!token) { alert("Necesitas iniciar sesión para proceder al pago."); window.location.href = 'login.html'; return; }

        // Redirigir a la página de direcciones
        window.location.href = 'mis_direcciones.html'; 
    }

    // =================================================================================================
    // INICIALIZACIÓN
    // =================================================================================================

    clearCartBtn.addEventListener("click", clearCart);
    checkoutBtn.addEventListener("click", proceedToCheckout);

    // Cargar los items del carrito al iniciar la página
    loadCartItems();
    
});