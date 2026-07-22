// ======================================
// CORRIDAS.JS - PARTE 1
// CONFIGURAÇÃO INICIAL
// ======================================


import { 
    auth,
    db
} from "./firebase.js";


import {
    buscarEndereco
} from "./geocoder.js";


import {

    map,
    minhaLat,
    minhaLng,
    destinoLat,
    destinoLng

} from "./mapa.js";


import {

    collection,
    addDoc,
    doc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    query,
    where,
    getDocs

} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";




// ======================================
// ELEMENTOS DA TELA
// ======================================


const btnChamarCorrida =
document.getElementById(
"btnChamarCorrida"
);



const btnCancelar =
document.getElementById(
"btnCancelarCorrida"
);



const btnSelecionarDestino =
document.getElementById(
"btnSelecionarDestino"
);



const aguardando =
document.getElementById(
"aguardandoMotorista"
);



const tempoBusca =
document.getElementById(
"tempoBusca"
);




// ======================================
// VARIÁVEIS DO SISTEMA
// ======================================


let corridaAtual = null;


let corridaEmAndamento = false;



let timer = null;


let tempoRestante = 180;



let pararEscutaCorrida = null;


let pararEscutaMotorista = null;



let marcadorMotorista = null;



let valor = 0;


let distancia = 0;


let tempo = 0;



console.log(
"🚖 Sistema de corridas carregado"
);

export async function verificarCorridaExistente(){

    const user = auth.currentUser;


    if(!user)
        return;



    const q = query(

        collection(
            db,
            "corridas"
        ),


        where(
            "passageiroUid",
            "==",
            user.uid
        ),


        where(
            "status",
            "in",
            [
                "pagamento_pendente",
                "aguardando",
                "aceita",
                "motorista_chegou"
            ]
        )

    );



    const snap = await getDocs(q);



    if(snap.empty){

        console.log(
            "Nenhuma corrida encontrada"
        );

        return;

    }



    const corrida =
    snap.docs[0];



    corridaAtual =
    corrida.id;



    corridaEmAndamento =
    true;



    console.log(
        "Corrida recuperada:",
        corridaAtual
    );



    ouvirCorrida();



}
confirmarPagamento();
// ======================================
// CORRIDAS.JS - PARTE 2
// CRIAR CORRIDA PENDENTE
// ======================================



// PEGAR VALOR DA CORRIDA

function pegarValorCorrida(){


    const campo =
    document.getElementById(
        "txtValor"
    );


    if(!campo)
        return 0;



    let texto =
    campo.innerText
    .replace("R$","")
    .replace(",",".")
    .trim();



    valor = Number(texto);



    if(isNaN(valor))
        valor = 0;



    return valor;

}





// PEGAR DISTÂNCIA

function pegarDistancia(){


    const campo =
    document.getElementById(
        "txtDistancia"
    );


    if(!campo)
        return 0;



    let texto =
    campo.innerText
    .replace("km","")
    .replace(",",".")
    .trim();



    distancia = Number(texto);



    if(isNaN(distancia))
        distancia = 0;



    return distancia;

}





// PEGAR TEMPO

function pegarTempo(){


    const campo =
    document.getElementById(
        "txtTempo"
    );


    if(!campo)
        return 0;



    let texto =
    campo.innerText
    .replace("min","")
    .trim();



    tempo = Number(texto);



    if(isNaN(tempo))
        tempo = 0;



    return tempo;

}
// ======================================
// BOTÃO CHAMAR CORRIDA
// ======================================

if(btnChamarCorrida){


btnChamarCorrida.onclick = async ()=>{



console.log(
"🚖 Iniciando solicitação de corrida"
);




if(corridaEmAndamento){


alert(
"Você já possui uma corrida ativa"
);


return;


}




const usuario =
auth.currentUser;



if(!usuario){


alert(
"Faça login primeiro"
);


return;


}




if(
minhaLat == null ||
minhaLng == null
){


alert(
"Aguardando localização"
);


return;


}




if(
destinoLat == null ||
destinoLng == null
){


alert(
"Escolha o destino"
);


return;


}





try{


btnChamarCorrida.disabled = true;



// BUSCAR ENDEREÇOS


const origemEndereco =
await buscarEndereco(
minhaLat,
minhaLng
);



const destinoEndereco =
await buscarEndereco(
destinoLat,
destinoLng
);




// PEGAR VALORES


pegarValorCorrida();

pegarDistancia();

pegarTempo();



if(valor <= 0){


alert(
"Valor inválido"
);


btnChamarCorrida.disabled=false;


return;


}




// CRIAR CORRIDA NO FIREBASE


const corrida =
await addDoc(

collection(
db,
"corridas"
),

{


passageiroUid:
usuario.uid,



origemLat:
minhaLat,


origemLng:
minhaLng,



destinoLat:
destinoLat,


destinoLng:
destinoLng,



origemEndereco:
origemEndereco,



destinoEndereco:
destinoEndereco,



distancia:
distancia,



tempo:
tempo,



valor:
valor,



pago:false,



motoristaUid:null,



status:
"pagamento_pendente",



criadoEm:
serverTimestamp()


}


);




// GUARDAR ID PARA PAGAMENTO


localStorage.setItem(

"corridaIdPagamento",

corrida.id

);



console.log(
"✅ Corrida criada:",
corrida.id
);





// SALVAR DADOS PARA RETORNO DO MERCADO PAGO


localStorage.setItem(

"corridaPendente",

JSON.stringify({

passageiroUid:
usuario.uid,


corridaId:
corrida.id,


valor:
valor


})

);





// IR PARA PAGAMENTO


const resposta =
await fetch(

"http://localhost:3000/criarPagamento",

{


method:"POST",


headers:{


"Content-Type":
"application/json"


},


body:JSON.stringify({

valor:valor,

corridaId:corrida.id


})


}


);



const pagamento =
await resposta.json();



console.log(
"Mercado Pago:",
pagamento
);



if(pagamento.link){


window.location.href =
pagamento.link;


return;


}



throw new Error(
"Pagamento sem link"
);



}

catch(erro){


console.error(
"❌ Erro criando corrida:",
erro
);



alert(
"Erro ao criar corrida"
);



btnChamarCorrida.disabled=false;


}



};


}
// ======================================
// CORRIDAS.JS - PARTE 3
// CONFIRMAR PAGAMENTO
// ======================================



async function confirmarPagamento(){



const parametros =
new URLSearchParams(
window.location.search
);



const pagamento =
parametros.get("pagamento");



if(pagamento !== "aprovado"){

return;

}



console.log(
"✅ Pagamento aprovado!"
);





const corridaId =
localStorage.getItem(
"corridaIdPagamento"
);





if(!corridaId){


console.error(
"❌ ID da corrida não encontrado"
);


return;


}





try{



const referencia =
doc(
db,
"corridas",
corridaId
);





await updateDoc(

referencia,

{


pago:true,


status:"aguardando",



pagamentoConfirmado:
serverTimestamp()



}


);





console.log(
"🚖 Corrida liberada para motoristas:",
corridaId
);





corridaAtual =
corridaId;



corridaEmAndamento =
true;





localStorage.removeItem(
"corridaIdPagamento"
);



localStorage.removeItem(
"corridaPendente"
);






window.history.replaceState(

{},

document.title,

"passageiro.html"

);







alert(
"🚖 Pagamento confirmado!\nProcurando motorista..."
);






// mostrar tela aguardando


if(aguardando){


aguardando.style.display =
"block";


}





// iniciar contador


iniciarContagem();




// escutar motorista


ouvirCorrida();




}

catch(erro){


console.error(
"Erro liberando corrida:",
erro
);



alert(
"Erro ao confirmar pagamento"
);



}



}
// ======================================
// CONTADOR DE BUSCA MOTORISTA
// ======================================


function iniciarContagem(){



tempoRestante = 180;



clearInterval(timer);



atualizarCronometro();



timer =
setInterval(async()=>{



tempoRestante--;



atualizarCronometro();




if(tempoRestante <= 0){



clearInterval(timer);



if(corridaAtual){



await updateDoc(

doc(
db,
"corridas",
corridaAtual
),

{


status:"cancelada"


}


);


}



finalizarTela();



alert(
"Nenhum motorista aceitou a corrida"
);



}



},1000);



}





function atualizarCronometro(){



if(!tempoBusca)
return;



let minutos =
Math.floor(
tempoRestante / 60
);



let segundos =
tempoRestante % 60;




tempoBusca.innerHTML =

String(minutos)
.padStart(2,"0")

+

":"

+

String(segundos)
.padStart(2,"0");



}
// ======================================
// CORRIDAS.JS - PARTE 5
// ESCUTAR ALTERAÇÕES DA CORRIDA
// ======================================


function ouvirCorrida(){


    if(!corridaAtual){

        console.log(
            "Nenhuma corrida ativa"
        );

        return;

    }



    // remove escuta antiga

    if(pararEscutaCorrida){

        pararEscutaCorrida();

    }





    pararEscutaCorrida = onSnapshot(


        doc(
            db,
            "corridas",
            corridaAtual
        ),



        (snapshot)=>{


            if(!snapshot.exists()){


                console.log(
                    "Corrida não encontrada"
                );


                return;

            }




            const corrida =
            snapshot.data();





            console.log(
                "Atualização corrida:",
                corrida.status
            );






            // MOTORISTA ACEITOU

            if(
                corrida.status === "aceita"
            ){


                clearInterval(timer);



                if(aguardando){

                    aguardando.style.display =
                    "none";

                }



                alert(
                    "🚖 Motorista aceitou sua corrida!"
                );



                acompanharMotorista(
                    corrida.motoristaUid
                );


            }








            // MOTORISTA CHEGOU


            if(
                corrida.status === "motorista_chegou"
            ){


                alert(
                    "🚗 Seu motorista chegou!"
                );


            }








            // CORRIDA FINALIZADA


            if(
                corrida.status === "finalizada"
            ){



                alert(
                    "✅ Corrida finalizada!"
                );



                finalizarTela();


            }








            // CANCELADA


            if(
                corrida.status === "cancelada"
            ){



                alert(
                    "❌ Corrida cancelada!"
                );


                finalizarTela();


            }




        },



        (erro)=>{


            console.error(

                "Erro escutando corrida:",
                erro

            );


        }



    );


}
function acompanharMotorista(uidMotorista){


if(!uidMotorista)
return;


onSnapshot(

doc(
db,
"usuarios",
uidMotorista
),


(snap)=>{


if(!snap.exists())
return;


const motorista=snap.data();


console.log(
"Motorista:",
motorista.nome
);


if(!marcadorMotorista){


marcadorMotorista=L.marker([

motorista.lat,

motorista.lng

])

.addTo(map);


}else{


marcadorMotorista.setLatLng([

motorista.lat,

motorista.lng

]);


}


}


);


}
