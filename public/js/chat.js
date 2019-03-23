const socket = io()

const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')

// templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessageTemplate').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
	// new message element
	const $newMessage = $messages.lastElementChild

	// height of new message
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

	// visible height
	const visibleHeight = $messages.offsetHeight

	// height of messages container
	const containerHeight = $messages.scrollHeight

	// scroll distance
	const scrollOffset = $messages.scrollTop + visibleHeight

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight
	}
}

socket.on('message', (message) => {
	console.log(message)

	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()
})

socket.on('locationMessage', (url) => {
	console.log(url)
	const html = Mustache.render(locationMessageTemplate, {
		username: url.username,
		url: url.url,
		createdAt: moment(url.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()
})

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	})
	document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
	e.preventDefault()

	// disable send button until message is sent
	$messageFormButton.setAttribute('disabled', 'disabled')

	const message = e.target.elements.message.value

	socket.emit('sendMessage', message, (error) => {

		// re-enable send button after message is sent
		$messageFormButton.removeAttribute('disabled')
		$messageFormInput.value = ''
		$messageFormInput.focus()


		if (error) {
			return console.log(error)
		}

		console.log('Message delivered.')
	})
})

$sendLocationButton.addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Geolocation is not supported by this browser.')
	}

	// disable send location button until location is shared
	$sendLocationButton.setAttribute('disabled', 'disabled')

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit('sendLocation', {
			lat: position.coords.latitude,
			lng: position.coords.longitude
		}, () => {
			console.log('Location shared.')

			// re-enable send location button once location is sent
			$sendLocationButton.removeAttribute('disabled')
		})
	})
})

socket.emit('join', { username, room }, (error) => {
	if (error) {
		alert(error)
		location.href = '/'
	}
})