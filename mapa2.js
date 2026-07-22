/*==============================
MAPAS
==============================*/

const mapaPadrao = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "© OpenStreetMap"
    }
);

const mapaColorido = L.tileLayer(
    "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    {
        attribution: "© OpenStreetMap HOT"
    }
);

const mapaEscuro = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
        attribution: "© CARTO"
    }
);

const mapaClaro = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
        attribution: "© CARTO"
    }
);

const mapaSatelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "© Esri"
    }
);


/*==============================
CRIAR MAPA
==============================*/

export const map = L.map("map",{

    center:[-17.8,-50.9],

    zoom:16,

    layers:[mapaPadrao]

});

export let destinoLat;
export let destinoLng;

export let marcadorDestino;

const mapas = {

    "🗺️ Padrão": mapaPadrao,

    "🌞 Claro": mapaClaro,

    "🌙 Escuro": mapaEscuro,

    "🛰️ Satélite": mapaSatelite

};

L.control.layers(mapas).addTo(map);