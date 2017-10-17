export const createIndexes = (to, from = 0) => {
	const array = []
	let index = from
	while (index !== to) {
		array.push(index)
		index++
	}
	return array
}
