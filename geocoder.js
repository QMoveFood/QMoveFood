export async function buscarEndereco(lat, lng) {

    const url =
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

    const resposta = await fetch(url);

    const dados = await resposta.json();

    if (!dados.address)
        return "Endereço não encontrado";

    const a = dados.address;

    // Rua
    const rua =
        a.road ||
        a.pedestrian ||
        a.residential ||
        a.cycleway ||
        "";

    // Número
    const numero =
        a.house_number || "";

    // Bairro
    const bairro =
    a.neighbourhood ||
    a.suburb ||
    a.city_district ||
    a.quarter ||
    "";

    // Cidade
    const cidade =
        a.city ||
        a.town ||
        a.village ||
        "";

    // Estado
    const estado =
        a.state || "";

    const endereco = [
        rua + (numero ? ", " + numero : ""),
        bairro,
        cidade,
        estado
    ]
    .filter(Boolean)
    .join(" - ");
console.log(dados.address);
    return endereco;

}