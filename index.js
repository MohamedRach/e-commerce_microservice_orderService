require('dotenv').config()
const express = require("express")
const amqp = require("amqplib")
const app = express()
const mongoose = require("mongoose")
const OrderController = require("./controllers/OrderController")
//const routes = require("./routes/routes")
mongoose.connect( process.env.dbURI)
    .then(() => {
        console.log("db connected successfully")
        app.listen("8080" , () => {
            console.log("listening on port 7070")
        })
    }).catch((err) => console.log(err))

app.use(express.json())
var channel, connection;
async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("ORDER");
}
connect().then(() => {
    channel.consume("ORDER", (data) => {
        console.log("Consuming ORDER service");
        const { products, userEmail } = JSON.parse(data.content);
        const newOrder = OrderController.createOrder(products, userEmail);
        channel.ack(data);
        console.log(newOrder)
    });
})