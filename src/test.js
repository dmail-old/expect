import assert from "assert"

export const test = (name, fn) => {
	let someHasFailed = false
	const ensure = (description, fn) => {
		process.stdout.write(`${description}: `)
		const returnValue = fn()
		if (returnValue === false) {
			someHasFailed = true
			process.stdout.write("failed\n")
		} else {
			process.stdout.write("passed\n")
		}
	}

	const exit = () => {
		process.exit(someHasFailed ? 1 : 0)
	}
	let waiting = false
	const waitUntil = (allocatedMs = 100) => {
		waiting = true
		const timer = setTimeout(() => {
			exit()
		}, allocatedMs)
		return () => {
			clearTimeout(timer)
			exit()
		}
	}

	console.log(`test ${name}`)
	fn({
		ensure,
		assert,
		waitUntil
	})
	if (waiting === false) {
		exit()
	}
}
