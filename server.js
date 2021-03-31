require('dotenv').config({path: './configs/.env'});
const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use('/public', express.static('public'));

// Run when client connects
io.on('connection', (socket) => {
    console.log('New WS connnection...')
})

app.get('/', (req, res) => {
    res.sendFile('./public/index.html', { root: '.' })
})

app.get('/index.html', (req, res) => {
    res.sendFile('./public/index.html', { root: '.' })
})

app.get('/chat.html', (req, res) => {
    res.sendFile('./public/chat.html', { root: '.' })
})

const PORT = 3000 || process.env.SERVER_PORT

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}: 
    http://localhost:${PORT}`)
})