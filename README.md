# Tienda online

una aplicacion web que fue desarrollada dentro de Visual Code con los tipos de archivos HTML, JavaScript, Tailwind CSS Y Firebaase. lo que permite a los usuarios explorar por el catalogo de los productos. filtrar por categoria, ver detalles, iniciar y cerrar sesion, y la posibilidad de visualizar imagenes que se encuentran almacenadas en Firebase Storage. la cual tambien en el apartado de contancto se encuentra la integracion con Google Maps, lo que muestra la ubicacion de local.

## Características

- **Autenticación:** Inicio y cierre de sesión con validación y almacenamiento de token.
- **Catálogo de productos:** Visualización, búsqueda y filtrado por categorías.
- **Detalles de producto:** Página individual con información y categorías asociadas.
- **Gestión de categorías:** Filtrado dinámico usando datos de una API propia.
- **Imágenes en Firebase Storage:** Recuperación y visualización segura de imágenes.
- **Google Maps:** Mapa con marcador de la tienda en la página de contacto.
- **Protección de rutas:** Redirección automática si el usuario no está autenticado.
- **Estilos modernos:** Interfaz responsiva con Tailwind CSS.

## Tecnologías utilizadas

- **Frontend:** HTML5, JavaScript, Tailwind CSS
- **Backend/API:** Laravel (o cualquier API REST propia)
- **Autenticación:** LocalStorage y validación con API
- **Almacenamiento de imágenes:** Firebase Storage
- **Google Maps API:** Para mostrar la ubicación de la tienda

## Estructura del proyecto

```
├── app.js                # Lógica principal del catálogo y filtrado
├── appdetalles.js        # Lógica de la página de detalles de producto
├── contacto.html         # Página de contacto con Google Maps
├── detalles.html         # Página de detalles de producto
├── firebase-conf.js      # Configuración de Firebase (no usado en frontend, solo referencia)
├── index.html            # Página principal
├── login.html            # Página de inicio de sesión
├── package.json          # Dependencias (solo para referencia)
└── firebase-storage/
    ├── cors.json         # Configuración CORS para Firebase Storage
    ├── firebase.json     # Configuración de reglas de Firebase
    └── storage.rules     # Reglas de seguridad de Firebase Storage
```

