const users = []

const addUser = ({ id, username, room }) => {
	// clean the data
	username = username.trim().toLowerCase()
	room = room.trim().toLowerCase()

	// validate the data
	if (!username || !room) {
		return {
			error: 'Username and Room are required.'
		}
	}

	// check for existing user
	const existingUser = users.find((user) => {
		return user.room === room && user.username === username
	})

	// validate username
	if (existingUser) {
		return {
			error: 'Username is already in use.'
		}
	}

	// store user
	const user = { id, username, room }
	users.push(user)
	return { user }
}

const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id)

	if (index != -1) {
		return users.splice(index, 1)[0]
	}
}

addUser({
	id: 22,
	username: 'harsha',
	room: 'Test'
})

console.log(users);

const removedUser = removeUser(22)

console.log(removedUser);
console.log(users);
