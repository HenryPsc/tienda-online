# Tienda online

una aplicacion web que fue desarrollada dentro de Visual Code con los tipos de archivos HTML, JavaScript, Tailwind CSS Y Firebaase. lo que permite a los usuarios explorar por el catalogo de los productos. filtrar por categoria, ver detalles, iniciar y cerrar sesion, y la posibilidad de visualizar imagenes que se encuentran almacenadas en Firebase Storage. la cual tambien en el apartado de contancto se encuentra la integracion con Google Maps, lo que muestra la ubicacion de local.

## Características

    - Autenticación: Inicio y cierre de sesión con validación y almacenamiento de token.
    - Catálogo de productos: Visualización, búsqueda y filtrado por categorías.
    - Detalles de producto: Página individual con información y categorías asociadas.
    - Gestión de categorías: Filtrado dinámico usando datos de una API propia.
    - Imágenes en Firebase Storage: Recuperación y visualización segura de imágenes.
    - Google Maps: Mapa con marcador de la tienda en la página de contacto.
    - Protección de rutas: Redirección automática si el usuario no está autenticado.
    - Estilos modernos: Interfaz responsiva con Tailwind CSS.

## Se usa Firebase únicamente para almacenar imágenes.

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "TU_PROYECTO_ID",
  storageBucket: "TU_BUCKET.appspot.com",
  messagingSenderId: "ID",
  appId: "APP_ID"
};

## instalacion de composer
    la cual se utilizo el comando
    - composer install

# vincular con la base de datos.
    en el archivo .env se encuentra un apartado donde podemos realizar la configuracion para que se conecte con la base de datos.

    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=laravel
    DB_USERNAME=root
    DB_PASSWORD=
