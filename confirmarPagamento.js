import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const url =
new URLSearchParams(
window.location.search
);


const pagamento =
url.get("pagamento");


if(pagamento === "aprovado"){


console.log(
"Pagamento aprovado"
);


// libera corrida

const corridaSalva =
localStorage.getItem(
"corridaPendente"
);

function iniciarContagem(){

    tempoRestante = 180;

    aguardando.style.display = "block";

    atualizarCronometro();

    clearInterval(timer);

    timer = setInterval(async()=>{

        tempoRestante--;

        atualizarCronometro();

        if(tempoRestante<=0){

            clearInterval(timer);

            if(corridaAtual){

                await updateDoc(
                    doc(db,"corridas",corridaAtual),
                    {
                        status:"cancelada"
                    }
                );

            }

            finalizarTela();

        }

    },1000);

}


window.onload = async()=>{


const url = new URLSearchParams(
window.location.search
);


const pagamento =
url.get("pagamento");


if(pagamento==="aprovado"){


const dados =
JSON.parse(
localStorage.getItem("corridaPendente")
);


if(!dados)return;



const corridaCriada = await addDoc(

collection(db,"corridas"),

{

passageiroUid:user.uid,

origemLat:minhaLat,
origemLng:minhaLng,

destinoLat:destinoLat,
destinoLng:destinoLng,

origemEndereco,
destinoEndereco,

distancia,
tempo,
valor,

pago:false,

motoristaUid:null,

status:"pagamento_pendente",

criadoEm:serverTimestamp()

}

);


localStorage.setItem(
"corridaIdPagamento",
corridaCriada.id
);
}
}
}