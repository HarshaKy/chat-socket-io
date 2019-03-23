const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
	console.log('new websocket connection.')

	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room })

		if (error) {
			return callback(error)
		}

		socket.join(user.room)

		socket.emit('message', generateMessage(`Welcome ${user.username}`))
		socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the chat.`))

		callback()
	})

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter()

		if (filter.isProfane(message)) {
			return callback('No bad words pls lol.')
		}

		io.to('test').emit('message', generateMessage(message))
		callback()
	})

	socket.on('sendLocation', (coords, callback) => {
		io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.lat},${coords.lng}`))
		callback()
	})

	socket.on('disconnect', () => {
		const user = removeUser(socket.id)

		if (user) {
			io.to(user.room).emit('message', generateMessage(`${user.username} has left the chat.`))
		}
	})
})

server.listen(port, () => {
	console.log(`Server is up on port ${port}`);
})