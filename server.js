require('dotenv').config({path: './configs/.env'});
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')

const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const botName = 'ChatCord Bot'

// app.use('/public', express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', (socket) => {

    socket.on('joinRoom', ({username, room}) => {
        // Current User
        const user = userJoin(socket.id, username, room);

        // Join room
        socket.join(user.room)

        // Welcome the current user
        socket.emit('message', formatMessage(botName, `Welcome ${user.username} to ChatCord!`))

        // Broadcast when user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    })

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if (user) {
            // Broadcast when user leaves
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
            
            // Update room users when the user leaves
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    })
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