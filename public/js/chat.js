const socket = io()

socket.on('message', (message) => {
	console.log(message)
})

document.querySelector('#messageForm').addEventListener('submit', (e) => {
	e.preventDefault()

	const message = document.querySelector('input').value

	socket.emit('sendMessage', message)
})

// socket.on('countUpdated', (count) => {
// 	console.log('Count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
// 	socket.emit('increment')
// })