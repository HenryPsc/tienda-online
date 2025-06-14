function initMap() {
    const ubicacion = { lat: -0.356980, lng: -78.387370 }; // Coordenadas de Pintag - Tolontag
    const mapa = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: ubicacion
    });

    new google.maps.Marker({
        position: ubicacion,
        map: mapa,
        title: "Donde nos encontramos",
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const volverLink = document.getElementById("volver-link");
    if (volverLink) {
        volverLink.addEventListener("click", function () {
        window.location.href = "index.html";
     });
    }
});