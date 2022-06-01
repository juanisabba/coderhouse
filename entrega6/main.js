const express = require("express")
const { Server: HttpServer } = require("http")
const { Server: IOServer } = require("socket.io")
const path = require("path")
const {archivoJson, apiChat} = require("./api")

const PORT = process.env.PORT || 8080
const mensajes=[]

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + "/public"))

app.get("/", (req, res) => {
    res.render("index")
})

const server = httpServer.listen(PORT, () => {
    console.log(`Server on port: ${server.address().port}`)
})

server.on("error", (err) => {
    console.error(err)
})


io.on("connection",async socket => {
    console.log("NuevoCliente concectado", socket.id)
    socket.emit("bienvenida", await apiChat.getAll())
    socket.emit("bdProductos", await archivoJson.getAll())

    socket.on("newProduct",async data=>{
        await archivoJson.save(data)
        io.sockets.emit("bdProductos", await archivoJson.getAll())
    })
    
    socket.on("mensajeCliente",async data => {
        await apiChat.save(data)
        io.sockets.emit("mensajeProvedor", data)
    })
}) 