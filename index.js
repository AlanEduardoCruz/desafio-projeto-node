const express = require("express");

const uuid = require("uuid");

const app = express();

// Configurando o Express para usar JSON no corpo das requisições
app.use(express.json());

const porta = 3000;

const clients = [];

// Criando middleware para checar os Id

const checkOrderId = (request, response, next) => {
  const { id } = request.params;

  const index = clients.findIndex((client) => client.id === id);

  if (index < 0) {
    return response.status(404).json({ error: "Cliente não encontrado" });
  }

  request.clientIndex = index;
  request.clientId = id;

  next();
};

// Criando middleware para checar metoto utilizado e url

const checkOrderUrl = (request, response, next) => {
  const method = request.method;
  const url = request.url;

  console.log(
    ` \n Método de requisição: [${method}] \n Url utilizada: [${url}] \n`
  );

  next();
};

// Criando requisição do tipo POST

app.post("/order", checkOrderUrl, (request, response) => {
  const { order, clientName, price, status } = request.body;

  const client = {
    id: uuid.v4(),
    order: order,
    clientName: clientName,
    price: price,
    status: "Em preparação",
  };

  clients.push(client);

  return response.status(201).json(client);
});

// Criando rota do tipo GET

app.get("/order", checkOrderUrl, (request, response) => {
  return response.json(clients);
});

// Criando rota do tipo PUT

app.put("/order/:id", checkOrderId, checkOrderUrl, (request, response) => {
  const { order, clientName, price, status } = request.body;

  const index = request.clientIndex;
  const id = request.clientId;

  const updateOrder = { id, order, clientName, price, status };

  clients[index] = updateOrder;

  return response.json(clients);
});

// Criando rota do tipo DELETE
app.delete("/order/:id", checkOrderId, checkOrderUrl, (request, response) => {
  const index = request.clientIndex;

  clients.splice(index, 1);

  return response.status(204).json();
});

// Rota GET para verificar o Id e retornar o pedido

app.get("/order/:id", checkOrderId, checkOrderUrl, (request, response) => {
  const { id } = request.params;

  const findAOrder = clients.find((client) => client.id === id);

  return response.status(201).json(findAOrder);
});

// Criando rota para alterar status do pedido

app.patch("/order/:id", checkOrderId, checkOrderUrl, (request, response) => {
  const { id } = request.params;

  const index = clients.findIndex((client) => client.id === id);

  const { order, clientName, price, status } = request.body;

  const readyOrder = {
    id,
    order: clients[index].order,
    clientName: clients[index].clientName,
    price: clients[index].price,
    status: "Pronto",
  };

  clients[index] = readyOrder;

  return response.status(201).json(readyOrder);
});

app.listen(porta, () => {
  console.log(`Servidor está rodando na porta ${porta}`);
});
