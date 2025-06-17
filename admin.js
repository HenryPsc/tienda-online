// admin.js (Actualización completa con Modal de Detalles de Pedido)

document.addEventListener("DOMContentLoaded", () => {
    // =================================================================================================
    // ELEMENTOS DEL DOM PARA GESTIÓN DE PRODUCTOS
    // =================================================================================================
    const productsList = document.getElementById("products-list");
    const productForm = document.getElementById("product-form");
    const productFormTitle = document.getElementById("product-form-title");
    const productIdInput = document.getElementById("product-id");
    const tituloInput = document.getElementById("titulo");
    const descripcionInput = document.getElementById("descripcion");
    const precioInput = document.getElementById("precio");
    const stockInput = document.getElementById("stock");
    const imagenUrlInput = document.getElementById("imagen");      
    const imageUploadInput = document.getElementById("image-upload"); 
    const imagePreview = document.getElementById("image-preview");
    const uploadStatus = document.getElementById("upload-status"); 
    const categoriesSelect = document.getElementById("categories-select");
    const productFormErrorMessage = document.getElementById("product-form-error-message");
    const saveProductButton = productForm.querySelector('button[type="submit"]');
    const cancelEditProductBtn = document.getElementById("cancel-edit-product-btn");

    // =================================================================================================
    // ELEMENTOS DEL DOM PARA GESTIÓN DE PEDIDOS
    // =================================================================================================
    const ordersTableBody = document.getElementById("orders-table-body");

    // =================================================================================================
    // ELEMENTOS DEL DOM PARA ESTADO DE PRODUCTOS (se mantuvo, aunque no se usa activamente)
    // =================================================================================================
    const productStatusTableBody = document.getElementById("product-status-table-body"); // Mantener referencia si se desea usar

    // =================================================================================================
    // ELEMENTOS DEL DOM PARA NAVEGACIÓN (Pestañas)
    // =================================================================================================
    const productsTabBtn = document.getElementById("products-tab-btn");
    const ordersTabBtn = document.getElementById("orders-tab-btn");
    const productStatusTabBtn = document.getElementById("product-status-tab-btn"); // Botón de pestaña de Estado de Productos
    const productsSection = document.getElementById("products-section");
    const ordersSection = document.getElementById("orders-section");
    const productStatusSection = document.getElementById("product-status-section"); // Sección de contenido de Estado de Productos

    // =================================================================================================
    // ELEMENTOS DEL DOM PARA EL MODAL DE DETALLES DE PEDIDO (NUEVOS)
    // =================================================================================================
    const orderDetailsModal = document.getElementById("orderDetailsModal");
    const closeModalButton = document.querySelector("#orderDetailsModal .close-button");
    const modalOrderId = document.getElementById("modalOrderId");
    const modalClientName = document.getElementById("modalClientName");
    const modalClientEmail = document.getElementById("modalClientEmail");
    const modalOrderDate = document.getElementById("modalOrderDate");
    const modalOrderTotal = document.getElementById("modalOrderTotal");
    const modalOrderStatus = document.getElementById("modalOrderStatus");
    const modalShippingAddress = document.getElementById("modalShippingAddress");
    const modalShippingCity = document.getElementById("modalShippingCity");
    const modalShippingState = document.getElementById("modalShippingState");
    const modalShippingPostalCode = document.getElementById("modalShippingPostalCode");
    const modalShippingCountry = document.getElementById("modalShippingCountry");
    const modalShippingPhone = document.getElementById("modalShippingPhone");
    const modalOrderProducts = document.getElementById("modalOrderProducts");


    // =================================================================================================
    // VARIABLES GLOBALES PARA SUBIDA DE IMAGEN
    // =================================================================================================
    let currentImageUrl = null; 
    let selectedFile = null;    


    // =================================================================================================
    // LÓGICA DE NAVEGACIÓN (Pestañas)
    // =================================================================================================
    function showTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.add('hidden');
        });
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        document.getElementById(tabId + '-section').classList.remove('hidden');
        document.getElementById(tabId + '-tab-btn').classList.add('active');

        if (tabId === 'products') {
            loadProducts();
            loadCategories(); 
        } else if (tabId === 'orders') {
            loadAllOrders(); 
        } else if (tabId === 'product-status') { 
            // Si decides implementar esta pestaña, aquí llamarías a loadProductStatuses();
            // Por ahora, no hace nada si no está implementado en tu backend/frontend para esta pestaña.
            // loadProductStatuses(); 
        }
    }

    productsTabBtn.addEventListener('click', () => showTab('products'));
    ordersTabBtn.addEventListener('click', () => showTab('orders'));
    productStatusTabBtn.addEventListener('click', () => showTab('product-status'));


    // =================================================================================================
    // LÓGICA DE AUTENTICACIÓN Y ROLES
    // =================================================================================================

    function checkAdminRole() {
        const usuarioData = localStorage.getItem("usuario");
        const token = localStorage.getItem("token");

        if (!usuarioData || !token) {
            alert("Acceso denegado. Debes iniciar sesión.");
            window.location.href = "login.html";
            return false;
        }

        try {
            const usuario = JSON.parse(usuarioData);
            if (usuario.rol !== 'admin') {
                alert("Acceso denegado. Esta área es solo para administradores.");
                window.location.href = "index.html";
                return false;
            }
            return true;
        } catch (e) {
            console.error("Error al parsear datos de usuario:", e);
            alert("Error de sesión. Por favor, inicia sesión de nuevo.");
            localStorage.clear(); 
            window.location.href = "login.html";
            return false;
        }
    }

    const adminLogoutLink = document.getElementById("admin-logout-link");
    if (adminLogoutLink) {
        adminLogoutLink.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
                const logoutToken = localStorage.getItem("token"); 
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
    }

    // =================================================================================================
    // FUNCIONES DE GESTIÓN DE PRODUCTOS
    // =================================================================================================

    async function loadProducts() {
        productsList.innerHTML = `<p class="text-center text-gray-500">Cargando productos...</p>`;
        const token = localStorage.getItem('token');

        if (!token) { return; }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/productos', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                const errorDetail = data.message || `Error al cargar productos: ${response.statusText}`;
                throw new Error(errorDetail);
            }
            renderProducts(data);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            productsList.innerHTML = `<p class="text-red-500 text-center col-span-full">Error al cargar productos: ${error.message}.</p>`;
        }
    }

    function renderProducts(products) {
        productsList.innerHTML = "";
        if (products.length === 0) {
            productsList.innerHTML = `<p class="text-center text-gray-500">No hay productos registrados.</p>`;
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.className = "bg-white p-4 rounded-lg shadow-md flex items-center space-x-4";

            const imageUrl = product.imagen && product.imagen !== 'undefined' && product.imagen !== ''
                ? product.imagen
                : 'https://placehold.co/80x80/e0e0e0/505050?text=No+Img';

            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.titulo}" class="w-20 h-20 object-cover rounded-md">
                <div class="flex-1">
                    <h4 class="font-semibold text-lg">${product.titulo}</h4>
                    <p class="text-gray-600 text-sm">$${parseFloat(product.precio).toFixed(2)} | Stock: ${product.stock}</p>
                    <p class="text-xs text-gray-500">Categorías: ${product.categorias.map(cat => cat.nombre).join(', ') || 'N/A'}</p>
                </div>
                <div class="flex flex-col gap-2">
                    <button class="btn-secondary btn-edit-product" data-id="${product.id}">Editar</button>
                    <button class="btn-danger btn-delete-product" data-id="${product.id}">Eliminar</button>
                </div>
            `;
            productsList.appendChild(productCard);
        });

        attachProductEventListeners();
    }

    async function loadCategories() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8000/api/categorias', {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al cargar categorías');
            
            categoriesSelect.innerHTML = ''; 
            data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.nombre;
                categoriesSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            alert(`No se pudieron cargar las categorías: ${error.message}`);
        }
    }

    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        productFormErrorMessage.classList.add("hidden");
        productFormErrorMessage.textContent = "";
        uploadStatus.textContent = ''; 

        const id = productIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://127.0.0.1:8000/api/productos/${id}` : 'http://127.0.0.1:8000/api/productos';

        const token = localStorage.getItem('token');
        if (!token) { showProductFormError("Sesión expirada."); return; }

        let imageUrlToSave = currentImageUrl; 

        if (selectedFile) {
            try {
                uploadStatus.textContent = 'Subiendo imagen...';
                saveProductButton.disabled = true; 
                imageUrlToSave = await uploadImageToFirebase(selectedFile);
                uploadStatus.textContent = 'Imagen subida correctamente.';
            } catch (error) {
                uploadStatus.textContent = 'Error al subir imagen.';
                saveProductButton.disabled = false;
                console.error("Error al subir imagen:", error);
                showProductFormError(`Error al subir imagen: ${error.message}`);
                return;
            }
        }
        
        saveProductButton.disabled = false; 

        const selectedCategories = Array.from(categoriesSelect.selectedOptions).map(option => option.value);

        const productData = {
            titulo: tituloInput.value.trim(),
            descripcion: descripcionInput.value.trim(),
            precio: parseFloat(precioInput.value),
            stock: parseInt(stockInput.value),
            imagen: imageUrlToSave, 
            categorias: selectedCategories, 
            status: 'activo', // Asegúrate de que este campo está presente
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    let errors = Object.values(data.errors).flat().join('\n');
                    showProductFormError(`Error de validación:\n${errors}`);
                } else {
                    throw new Error(data.message || `Error al guardar producto: ${response.statusText}`);
                }
                return;
            }

            alert(data.message || `Producto ${id ? 'actualizado' : 'creado'} exitosamente.`);
            resetProductForm();
            loadProducts();
            // Si el producto se actualiza, recargar también la vista de estados de productos si la implementas
            // if (id) loadProductStatuses(); 
        } catch (error) {
            console.error('Error al guardar el producto:', error);
            showProductFormError(`Error al guardar el producto: ${error.message}`);
        }
    });

    function showProductFormError(message) {
        productFormErrorMessage.textContent = message;
        productFormErrorMessage.classList.remove("hidden");
    }

    function resetProductForm() {
        productIdInput.value = '';
        tituloInput.value = '';
        descripcionInput.value = '';
        precioInput.value = '';
        stockInput.value = '';
        imagenUrlInput.value = ''; 
        imageUploadInput.value = ''; 
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
        uploadStatus.textContent = ''; 
        selectedFile = null; 
        currentImageUrl = null; 
        Array.from(categoriesSelect.options).forEach(option => option.selected = false);

        productFormTitle.textContent = 'Añadir Nuevo Producto';
        saveProductButton.textContent = 'Guardar Producto';
        cancelEditProductBtn.classList.add('hidden');
        productFormErrorMessage.classList.add("hidden");
    }

    function attachProductEventListeners() {
        document.querySelectorAll(".btn-edit-product").forEach(button => {
            button.addEventListener("click", async (e) => {
                const productId = e.currentTarget.dataset.id;
                await editProduct(productId);
            });
        });

        document.querySelectorAll(".btn-delete-product").forEach(button => {
            button.addEventListener("click", async (e) => {
                const productId = e.currentTarget.dataset.id;
                if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                    await deleteProduct(productId);
                }
            });
        });
    }

    async function editProduct(id) {
        const token = localStorage.getItem('token');
        if (!token) { alert("Sesión expirada."); window.location.href = 'login.html'; return; }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/productos/${id}`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Error al cargar producto para editar');

            productIdInput.value = data.id;
            tituloInput.value = data.titulo;
            descripcionInput.value = data.descripcion;
            precioInput.value = data.precio;
            stockInput.value = data.stock;
            currentImageUrl = data.imagen || null;
            imagenUrlInput.value = data.imagen || ''; 

            if (data.imagen) {
                imagePreview.src = data.imagen;
                imagePreview.classList.remove('hidden');
            } else {
                imagePreview.classList.add('hidden');
            }

            Array.from(categoriesSelect.options).forEach(option => {
                option.selected = data.categorias.some(cat => cat.id == option.value);
            });

            productFormTitle.textContent = 'Editar Producto';
            saveProductButton.textContent = 'Actualizar Producto';
            cancelEditProductBtn.classList.remove('hidden');

            imageUploadInput.value = '';
            selectedFile = null;

        } catch (error) {
            console.error('Error al editar producto:', error);
            alert(`No se pudo cargar el producto para editar: ${error.message}`);
        }
    }

    async function deleteProduct(id) {
        const token = localStorage.getItem('token');
        if (!token) { alert("Sesión expirada."); window.location.href = 'login.html'; return; }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/productos/${id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al eliminar el producto');

            alert(data.message || 'Producto eliminado exitosamente.');
            loadProducts();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert(`No se pudo eliminar el producto: ${error.message}`);
        }
    }

    cancelEditProductBtn.addEventListener('click', resetProductForm);

    // =================================================================================================
    // FUNCIONES DE SUBIDA DE IMAGEN A FIREBASE STORAGE
    // =================================================================================================
    
    function previewImage(event) { 
        const file = event.target.files[0];
        selectedFile = file; 
        if (file) {
            imagePreview.src = URL.createObjectURL(file);
            imagePreview.classList.remove('hidden');
        } else {
            imagePreview.src = '';
            imagePreview.classList.add('hidden');
        }
        uploadStatus.textContent = ''; 
    };

    async function uploadImageToFirebase(file) {
        if (!file) throw new Error("No se ha seleccionado ningún archivo.");
        if (!firebase || !firebase.storage) throw new Error("Firebase Storage no está inicializado. Asegúrate de incluir y configurar el SDK de Firebase en tu HTML.");

        const storageRef = firebase.storage().ref(); 
        const imageName = `${Date.now()}-${file.name}`; 
        const imageRef = storageRef.child('product_images/' + imageName); 

        const uploadTask = imageRef.put(file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    uploadStatus.textContent = `Subiendo: ${progress.toFixed(2)}%`;
                },
                (error) => {
                    console.error("Error al subir a Firebase Storage:", error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    resolve(downloadURL);
                }
            );
        });
    }

    // =================================================================================================
    // FUNCIONES DE GESTIÓN DE PEDIDOS
    // =================================================================================================

    async function loadAllOrders() {
        ordersTableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">Cargando pedidos...</td></tr>`;
        const token = localStorage.getItem('token');

        if (!token) { alert("Sesión expirada."); return; }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/pedidos', { 
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                const errorDetail = data.message || `Error al cargar pedidos: ${response.statusText}`;
                throw new Error(errorDetail);
            }
            renderAllOrders(data);
        } catch (error) {
            console.error('Error al cargar todos los pedidos:', error);
            ordersTableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 whitespace-nowrap text-center text-red-500">Error al cargar pedidos: ${error.message}. Asegúrate de que el backend está corriendo y la ruta '/api/admin/pedidos' devuelve todos los pedidos.</td></tr>`;
        }
    }

    function renderAllOrders(orders) {
        ordersTableBody.innerHTML = "";
        if (orders.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">No hay pedidos registrados.</td></tr>`;
            return;
        }

        orders.forEach(order => {
            const orderRow = document.createElement("tr");
            orderRow.className = "hover:bg-gray-50";

            const orderDate = new Date(order.fecha_pedido || order.created_at).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            const clientName = order.user ? order.user.name : 'Desconocido';

            orderRow.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${clientName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${parseFloat(order.total).toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${orderDate}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <select class="order-status-select px-2 py-1 rounded-md text-sm" data-id="${order.id}">
                        <option value="pendiente" ${order.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="procesando" ${order.estado === 'procesando' ? 'selected' : ''}>Procesando</option>
                        <option value="enviado" ${order.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="completado" ${order.estado === 'completado' ? 'selected' : ''}>Completado</option>
                        <option value="cancelado" ${order.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button class="btn-secondary btn-view-order-details" data-id="${order.id}">Ver</button>
                </td>
            `;
            ordersTableBody.appendChild(orderRow);
        });

        attachOrderManagementEventListeners();
    }

    function attachOrderManagementEventListeners() {
        document.querySelectorAll(".order-status-select").forEach(select => {
            select.addEventListener("change", async (e) => {
                const orderId = e.currentTarget.dataset.id;
                const newStatus = e.currentTarget.value;
                if (confirm(`¿Estás seguro de cambiar el estado del pedido #${orderId} a "${newStatus}"?`)) {
                    await updateOrderStatus(orderId, newStatus);
                } else {
                    e.currentTarget.value = e.currentTarget.dataset.prevStatus || 'pendiente';
                }
            });
            select.dataset.prevStatus = select.value;
        });

        document.querySelectorAll(".btn-view-order-details").forEach(button => {
            button.addEventListener("click", async (e) => { // Cambiado a async para poder usar await
                const orderId = e.currentTarget.dataset.id;
                await showOrderDetailsModal(orderId); // Llama a la nueva función
            });
        });
    }

    async function updateOrderStatus(orderId, newStatus) {
        const token = localStorage.getItem('token');
        if (!token) { alert("Sesión expirada."); window.location.href = 'login.html'; return; }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/pedidos/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: newStatus })
            });

            const data = await response.json();
            if (!response.ok) {
                const errorDetail = data.message || `Error al actualizar estado: ${response.statusText}`;
                throw new Error(errorDetail);
            }

            alert(data.message || `Estado del pedido #${orderId} actualizado a "${data.pedido.estado}".`);
            loadAllOrders(); 
        } catch (error) {
            console.error('Error al actualizar estado del pedido:', error);
            alert(`No se pudo actualizar el estado del pedido: ${error.message}`);
        }
    }

    // =================================================================================================
    // FUNCIONES DEL MODAL DE DETALLES DE PEDIDO (NUEVAS)
    // =================================================================================================
    async function showOrderDetailsModal(orderId) {
        const token = localStorage.getItem('token');
        if (!token) { alert("Sesión expirada."); window.location.href = 'login.html'; return; }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/pedidos/${orderId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `Error al cargar detalles del pedido: ${response.statusText}`);
            }

            // Rellenar el modal con los datos del pedido
            modalOrderId.textContent = data.id;
            modalClientName.textContent = data.user ? data.user.name : 'N/A';
            modalClientEmail.textContent = data.user ? data.user.email : 'N/A';
            modalOrderDate.textContent = new Date(data.fecha_pedido || data.created_at).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            modalOrderTotal.textContent = parseFloat(data.total).toFixed(2);
            modalOrderStatus.textContent = data.estado;

            // Rellenar detalles de la dirección
            if (data.direccion) {
                modalShippingAddress.textContent = `${data.direccion.calle} ${data.direccion.numero}, ${data.direccion.apartamento ? 'Apto ' + data.direccion.apartamento : ''}`;
                modalShippingCity.textContent = data.direccion.ciudad;
                modalShippingState.textContent = data.direccion.provincia;
                modalShippingPostalCode.textContent = data.direccion.codigo_postal;
                modalShippingCountry.textContent = data.direccion.pais;
                modalShippingPhone.textContent = data.direccion.telefono || 'N/A';
            } else {
                modalShippingAddress.textContent = 'Dirección no disponible.';
                modalShippingCity.textContent = '';
                modalShippingState.textContent = '';
                modalShippingPostalCode.textContent = '';
                modalShippingCountry.textContent = '';
                modalShippingPhone.textContent = '';
            }

            // Rellenar lista de productos
            modalOrderProducts.innerHTML = ''; // Limpiar lista anterior
            if (data.productos && data.productos.length > 0) {
                data.productos.forEach(product => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${product.pivot.cantidad} x ${product.titulo} ($${parseFloat(product.pivot.precio_unitario).toFixed(2)} c/u) - Subtotal: $${parseFloat(product.pivot.subtotal).toFixed(2)}`;
                    modalOrderProducts.appendChild(listItem);
                });
            } else {
                const listItem = document.createElement('li');
                listItem.textContent = 'No hay productos en este pedido.';
                modalOrderProducts.appendChild(listItem);
            }

            // Mostrar el modal
            orderDetailsModal.style.display = "flex"; // Usar flex para centrar contenido
        } catch (error) {
            console.error('Error al mostrar detalles del pedido:', error);
            alert(`No se pudieron cargar los detalles del pedido: ${error.message}`);
        }
    }

    // Cerrar el modal al hacer clic en la 'x'
    closeModalButton.addEventListener("click", () => {
        orderDetailsModal.style.display = "none";
    });

    // Cerrar el modal al hacer clic fuera del contenido del modal
    window.addEventListener("click", (event) => {
        if (event.target == orderDetailsModal) {
            orderDetailsModal.style.display = "none";
        }
    });


    // =================================================================================================
    // INICIALIZACIÓN
    // =================================================================================================
    if (checkAdminRole()) {
        showTab('products'); // Mostrar la pestaña de productos por defecto al cargar el admin
        imageUploadInput.addEventListener('change', previewImage);
    }
});

function mostrarEstadoProductos(productos) {
    const contenedor = document.getElementById("product-status-tab");
    if (!contenedor) return;

    if (!productos.length) {
        contenedor.innerHTML = "<p class='text-gray-500 text-center'>No hay productos para mostrar.</p>";
        return;
    }

    let html = `
        <div class="overflow-x-auto">
        <table class="min-w-full bg-white rounded-lg shadow">
            <thead>
                <tr>
                    <th class="px-4 py-2 text-left">Imagen</th>
                    <th class="px-4 py-2 text-left">Producto</th>
                    <th class="px-4 py-2 text-center">Stock</th>
                    <th class="px-4 py-2 text-center">Estado</th>
                </tr>
            </thead>
            <tbody>
    `;

    productos.forEach(producto => {
        let estado = "";
        let estadoClass = "";
        if (producto.stock === 0) {
            estado = "Sin stock";
            estadoClass = "bg-red-100 text-red-700";
        } else if (producto.stock <= 5) {
            estado = "Bajo stock";
            estadoClass = "bg-yellow-100 text-yellow-700";
        } else {
            estado = "Disponible";
            estadoClass = "bg-green-100 text-green-700";
        }

        html += `
            <tr>
                <td class="px-4 py-2">
                    <img src="${producto.imagen || 'https://placehold.co/60x60'}" alt="${producto.titulo}" class="w-12 h-12 object-cover rounded">
                </td>
                <td class="px-4 py-2">${producto.titulo}</td>
                <td class="px-4 py-2 text-center">${producto.stock}</td>
                <td class="px-4 py-2 text-center">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${estadoClass}">${estado}</span>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        </div>
    `;

    contenedor.innerHTML = html;
}
