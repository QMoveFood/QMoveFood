import { auth, db } from "./firebase.js";

import { map } from "./mapa.js";
import {verificarCorridaExistente} from "./corridas.js";
import "./rota.js";
import { mp } from "./mercadopago.js";


import {
    collection,
    addDoc,
    updateDoc,
    query,
    where,
    onSnapshot,
    doc,
    serverTimestamp,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/*==============================
ELEMENTOS
==============================*/

const btnAdmin = document.getElementById("btnAdmin");
const btnSair = document.getElementById("btnSair");
const onlineCount = document.getElementById("onlineCount");

let motoristasMarkers = [];

/*==============================
LOGIN
==============================*/

if (btnAdmin) {
    btnAdmin.style.display = "none";
}

btnSair.onclick = async () => {

    await signOut(auth);

    location.href = "index.html";

};

if (btnAdmin) {

    btnAdmin.onclick = () => {

        location.href = "admin.html";

    };

}

/*==============================
AUTENTICAÇÃO
==============================*/

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.href = "index.html";

        return;

    }

    carregarMotoristasOnline();
    await verificarCorridaExistente();

    const snap = await getDoc(doc(db, "usuarios", user.uid));

    if (snap.exists()) {

        const dados = snap.data();

        if (dados.admin) {

            btnAdmin.style.display = "block";

        }

    }

});

/*==============================
PAINEL CORRIDA
==============================*/

const btnCorrida =
document.getElementById("btnCorrida");

const painelCorrida =
document.getElementById("painelCorrida");

if (btnCorrida) {

    btnCorrida.onclick = () => {

        painelCorrida.classList.toggle("ativo");

    };

}

/*==============================
MOTORISTAS ONLINE
==============================*/

function carregarMotoristasOnline() {

    const q = query(

        collection(db, "usuarios"),

        where("tipo", "==", "motorista"),

        where("online", "==", true)

    );

    onSnapshot(q, (snapshot) => {

        onlineCount.innerText = snapshot.size;

        motoristasMarkers.forEach(marker => {

            map.removeLayer(marker);

        });

        motoristasMarkers = [];

        snapshot.forEach((docSnap) => {

            const motorista = docSnap.data();

            if (!motorista.lat || !motorista.lng) return;

            const marker = L.marker([
                motorista.lat,
                motorista.lng
            ])
            .addTo(map)
            .bindPopup("🚗 " + motorista.nome);

            motoristasMarkers.push(marker);

        });

    });

}
console.log(
"🚖 Passageiro carregado"
);
