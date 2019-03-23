const socket = io()

const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')

// templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessageTemplate').innerHTML

socket.on('message', (message) => {
	console.log(message)

	const html = Mustache.render(messageTemplate, {
		message
	})
	$messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (url) => {
	console.log(url)
	const html = Mustache.render(locationMessageTemplate, {
		url
	})
	$messages.insertAdjacentHTML('beforeend', html)
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