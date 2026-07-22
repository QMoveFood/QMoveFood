console.log("Leaflet:", L);
console.log("Routing:", L.Routing);

import {
    map,
    minhaLat,
    minhaLng,
    destinoLat,
    destinoLng
} from "./mapa.js";

let controleRota = null;

export function calcularRota() {

    if (
        minhaLat == null ||
        destinoLat == null
    ) return;

    if (controleRota) {
        map.removeControl(controleRota);
    }

    controleRota = L.Routing.control({

        waypoints: [

            L.latLng(minhaLat, minhaLng),

            L.latLng(destinoLat, destinoLng)

        ],

        routeWhileDragging: false,

        addWaypoints: false,

        draggableWaypoints: false,

        fitSelectedRoutes: true,

        show: false

    }).addTo(map);

    controleRota.on("routesfound", function(e){

        const rota = e.routes[0];

        const distancia =
            rota.summary.totalDistance / 1000;

        const tempo =
            Math.ceil(
                rota.summary.totalTime / 60
            );

        const valor =
            5 + (distancia * 2.80);

        atualizarPainel(
            distancia,
            tempo,
            valor
        );

    });

}

/*==============================
BOTÃO DESTINO
==============================*/
const btnSelecionarDestino =
document.getElementById("btnSelecionarDestino");

if (btnSelecionarDestino) {

    btnSelecionarDestino.onclick = () => {

        alert("Clique no mapa para selecionar o destino.");

    };

}

export function atualizarPainel(distancia, tempo, valor){

    document.getElementById("txtDistancia").innerHTML =
        distancia.toFixed(1) + " km";

    document.getElementById("txtTempo").innerHTML =
        tempo + " min";

    document.getElementById("txtValor").innerHTML =
        "R$ " + valor.toFixed(2);

}