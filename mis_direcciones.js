document.addEventListener("DOMContentLoaded", () => {
    const addressesList = document.getElementById("addresses-list");
    const addressForm = document.getElementById("address-form");
    const formTitle = document.getElementById("form-title");
    const addressIdInput = document.getElementById("address-id");
    const direccionInput = document.getElementById("direccion");
    const ciudadInput = document.getElementById("ciudad");
    const provinciaInput = document.getElementById("provincia");
    const telefonoInput = document.getElementById("telefono");
    const formErrorMessage = document.getElementById("form-error-message");
    const saveButton = addressForm.querySelector('button[type="submit"]');
    const cancelEditBtn = document.getElementById("cancel-edit-btn");

    let selectedAddressId = null; // Variable para almacenar el ID de la dirección seleccionada

    // =================================================================================================
    // FUNCIONES PARA CARGAR Y RENDERIZAR DIRECCIONES
    // =================================================================================================

    async function loadAddresses() {
        addressesList.innerHTML = `<p class="text-center text-gray-500">Cargando direcciones...</p>`;
        const token = localStorage.getItem('token');

        if (!token) {
            addressesList.innerHTML = `<p class="text-red-500 text-center">Debes iniciar sesión para ver tus direcciones.</p>`;
            // Opcional: Redirigir al login
            // window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/direcciones', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error al cargar direcciones: ${response.statusText}`);
            }

            renderAddresses(data);
        } catch (error) {
            console.error('Error al cargar las direcciones:', error);
            addressesList.innerHTML = `<p class="text-red-500 text-center">Error al cargar las direcciones: ${error.message}.</p>`;
        }
    }

    function renderAddresses(addresses) {
        addressesList.innerHTML = ""; // Limpiar antes de renderizar

        if (addresses.length === 0) {
            addressesList.innerHTML = `<p class="text-center text-gray-500">Aún no tienes direcciones guardadas. Añade una nueva.</p>`;
            return;
        }

        addresses.forEach(address => {
            const addressCard = document.createElement("div");
            // Añadir una clase 'selected-address' para resaltado si está seleccionada
            const isSelected = selectedAddressId === address.id;
            addressCard.className = `address-card cursor-pointer ${isSelected ? 'border-blue-600 ring-2 ring-blue-500' : 'border-gray-200'}`;
            addressCard.dataset.id = address.id; // Añadir data-id al card para la selección

            addressCard.innerHTML = `
                <p class="text-lg font-semibold">${address.direccion}</p>
                <p class="text-gray-700">${address.ciudad}, ${address.provincia}</p>
                <p class="text-gray-700">Teléfono: ${address.telefono}</p>
                <div class="mt-4 flex gap-2">
                    <button class="btn-secondary btn-edit-address" data-id="${address.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-10l7 7m-7-7a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z" />
                        </svg>
                        Editar
                    </button>
                    <button class="btn-danger btn-delete-address" data-id="${address.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                    </button>
                </div>
            `;
            addressesList.appendChild(addressCard);
        });

        // Añadir el botón de confirmar pedido si hay direcciones
        if (addresses.length > 0) {
            // Eliminar botón existente si ya está para evitar duplicados
            let existingCheckoutBtn = document.getElementById("confirm-order-btn");
            if (existingCheckoutBtn) existingCheckoutBtn.remove();

            const confirmOrderBtn = document.createElement("button");
            confirmOrderBtn.id = "confirm-order-btn";
            confirmOrderBtn.className = "btn-primary w-full mt-8";
            confirmOrderBtn.textContent = "Confirmar Pedido";
            addressesList.appendChild(confirmOrderBtn);

            confirmOrderBtn.addEventListener('click', handleConfirmOrder);
        } else {
             // Si no hay direcciones, ocultar el botón de confirmar pedido
            let existingCheckoutBtn = document.getElementById("confirm-order-btn");
            if (existingCheckoutBtn) existingCheckoutBtn.remove();
        }

        attachAddressEventListeners(); // Adjuntar event listeners a los nuevos botones
        attachAddressSelectionListeners(); // Adjuntar event listeners para la selección
    }

    // =================================================================================================
    // MANEJO DE SELECCIÓN DE DIRECCIONES
    // =================================================================================================
    function attachAddressSelectionListeners() {
        document.querySelectorAll(".address-card").forEach(card => {
            card.addEventListener("click", (e) => {
                // Prevenir que el clic en los botones de editar/eliminar también seleccione la tarjeta
                if (e.target.closest(".btn-edit-address") || e.target.closest(".btn-delete-address")) {
                    return;
                }

                const clickedId = parseInt(e.currentTarget.dataset.id);
                if (selectedAddressId === clickedId) {
                    // Deseleccionar si ya estaba seleccionada
                    selectedAddressId = null;
                } else {
                    // Seleccionar la nueva dirección
                    selectedAddressId = clickedId;
                }
                
                // Volver a renderizar para aplicar la clase de seleccionado/deseleccionado
                loadAddresses(); 
            });
        });
    }


    // =================================================================================================
    // MANEJO DE EVENTOS DEL FORMULARIO Y ACCIONES CRUD
    // =================================================================================================

    addressForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        formErrorMessage.classList.add("hidden");
        formErrorMessage.textContent = "";

        const id = addressIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://127.0.0.1:8000/api/direcciones/${id}` : 'http://127.0.0.1:8000/api/direcciones';

        const token = localStorage.getItem('token');
        if (!token) {
            showFormError("Sesión expirada. Por favor, inicia sesión.");
            // Opcional: Redirigir al login
            // window.location.href = 'login.html';
            return;
        }

        const addressData = {
            direccion: direccionInput.value.trim(),
            ciudad: ciudadInput.value.trim(),
            provincia: provinciaInput.value.trim(),
            telefono: telefonoInput.value.trim(),
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(addressData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Manejar errores de validación de Laravel
                if (response.status === 422 && data.errors) {
                    let errors = Object.values(data.errors).flat().join('\n');
                    showFormError(`Error de validación:\n${errors}`);
                } else {
                    throw new Error(data.message || `Error al guardar la dirección: ${response.statusText}`);
                }
                return;
            }

            alert(data.message || `Dirección ${id ? 'actualizada' : 'creada'} exitosamente.`);
            resetForm();
            loadAddresses(); // Recargar la lista de direcciones
        } catch (error) {
            console.error('Error al guardar la dirección:', error);
            showFormError(`Error al guardar la dirección: ${error.message}`);
        }
    });

    function showFormError(message) {
        formErrorMessage.textContent = message;
        formErrorMessage.classList.remove("hidden");
    }

    function resetForm() {
        addressIdInput.value = '';
        direccionInput.value = '';
        ciudadInput.value = '';
        provinciaInput.value = '';
        telefonoInput.value = '';
        formTitle.textContent = 'Añadir Nueva Dirección';
        saveButton.textContent = 'Guardar Dirección';
        cancelEditBtn.classList.add('hidden');
        formErrorMessage.classList.add("hidden"); // Ocultar errores al resetear
    }

    function attachAddressEventListeners() {
        // Botones de Editar
        document.querySelectorAll(".btn-edit-address").forEach(button => {
            button.addEventListener("click", async (e) => {
                const addressId = e.currentTarget.dataset.id;
                await editAddress(addressId);
            });
        });

        // Botones de Eliminar
        document.querySelectorAll(".btn-delete-address").forEach(button => {
            button.addEventListener("click", async (e) => {
                const addressId = e.currentTarget.dataset.id;
                if (confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
                    await deleteAddress(addressId);
                }
            });
        });
    }

    async function editAddress(id) {
        const token = localStorage.getItem('token');
        if (!token) { alert("Sesión expirada. Inicia sesión."); window.location.href = 'login.html'; return; }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/direcciones/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error al cargar la dirección para editar: ${response.statusText}`);
            }

            // Rellenar el formulario con los datos de la dirección
            addressIdInput.value = data.id;
            direccionInput.value = data.direccion;
            ciudadInput.value = data.ciudad;
            provinciaInput.value = data.provincia;
            telefonoInput.value = data.telefono;

            formTitle.textContent = 'Editar Dirección';
            saveButton.textContent = 'Actualizar Dirección';
            cancelEditBtn.classList.remove('hidden');

        } catch (error) {
            console.error('Error al editar dirección:', error);
            alert(`No se pudo cargar la dirección para editar: ${error.message}`);
        }
    }

    async function deleteAddress(id) {
        const token = localStorage.getItem('token');
        if (!token) { alert("Sesión expirada. Inicia sesión."); window.location.href = 'login.html'; return; }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/direcciones/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error al eliminar la dirección: ${response.statusText}`);
            }

            alert(data.message || 'Dirección eliminada exitosamente.');
            loadAddresses(); // Recargar la lista
        } catch (error) {
            console.error('Error al eliminar dirección:', error);
            alert(`No se pudo eliminar la dirección: ${error.message}`);
        }
    }

    // Event listener para el botón "Cancelar Edición"
    cancelEditBtn.addEventListener('click', resetForm);

    // =================================================================================================
    // LÓGICA PARA CONFIRMAR PEDIDO (CHECKOUT)
    // =================================================================================================

    async function handleConfirmOrder() {
        if (selectedAddressId === null) {
            alert("Por favor, selecciona una dirección para tu pedido.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) { 
            alert("Sesión expirada. Inicia sesión para confirmar tu pedido."); 
            window.location.href = 'login.html'; 
            return; 
        }

        // Confirmación adicional antes de proceder al checkout
        if (!confirm("¿Estás seguro de que quieres confirmar tu pedido con esta dirección?")) {
            return; // Cancelar si el usuario no confirma
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ direccion_id: selectedAddressId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error al confirmar el pedido: ${response.statusText}`);
            }

            alert(data.message || 'Pedido confirmado exitosamente. Redirigiendo a tus pedidos.');
            window.location.href = 'mis_pedidos.html'; // Redirigir a la página de pedidos
        } catch (error) {
            console.error('Error al confirmar el pedido:', error);
            alert(`No se pudo confirmar el pedido: ${error.message}`);
        }
    }


    // =================================================================================================
    // INICIALIZACIÓN
    // =================================================================================================

    // Cargar las direcciones al cargar la página
    loadAddresses();
});