import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference } from "mercadopago";

const app = express();

app.use(cors());
app.use(express.json());

// =====================================
// MERCADO PAGO
// =====================================

const client = new MercadoPagoConfig({
    accessToken: "TEST-2809774628838340-072011-a17a574d5792685316a8e93efa58825f-666055304"
});

// CRIA O CLIENTE DE PREFERÊNCIAS
const preferenceClient = new Preference(client);

// =====================================
// TESTE
// =====================================

app.get("/", (req, res) => {
    res.send("Servidor Mercado Pago funcionando!");
});

// =====================================
// CRIAR PAGAMENTO
// =====================================

app.post("/criarPagamento", async (req, res) => {

    try {

        const valor = Number(req.body.valor);

        if (isNaN(valor) || valor <= 0) {
            return res.status(400).json({
                erro: "Valor inválido."
            });
        }

        const preference = {

            items: [
                {
                    id: "1",
                    title: "Corrida QMoveFood",
                    quantity: 1,
                    currency_id: "BRL",
                    unit_price: valor
                }
            ],

            back_urls: {
                "success": "https://qmovefood.github.io/QMoveFood/passageiro.html?pagamento=aprovado",
                "failure": "https://qmovefood.github.io/QMoveFood/passageiro.html?pagamento=erro",
                "pending": "https://qmovefood.github.io/QMoveFood/passageiro.html?pagamento=pendente"
            }

            // Se quiser usar auto_return depois,
            // adicione somente quando usar URLs válidas:
            // auto_return: "approved"

        };

        console.log("====================================");
        console.log("CRIANDO PAGAMENTO");
        console.log(preference);
        console.log("====================================");

        const response = await preferenceClient.create({
            body: preference
        });

        console.log("====================================");
        console.log("PREFERÊNCIA CRIADA");
        console.log(response);
        console.log("====================================");

        res.json({
            id: response.id,
            link: response.init_point,
            sandbox: response.sandbox_init_point
        });

    } catch (error) {

        console.log("====================================");
        console.log("ERRO MERCADO PAGO");
        console.log(error);

        if (error.cause) {
            console.log(error.cause);
        }

        console.log("====================================");

        res.status(500).json({
            erro: error.message,
            detalhes: error.cause || null
        });

    }

});

// =====================================
// SERVIDOR
// =====================================

const PORT = 3000;

app.listen(PORT, () => {

    console.log("====================================");
    console.log(`🚀 Servidor iniciado na porta ${PORT}`);
    console.log("====================================");

});