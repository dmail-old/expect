export const createIndexes = (to, from = 0) => {
	const array = []
	let index = from
	while (index !== to) {
		array.push(index)
		index++
	}
	return array
}

export const curry = (fn, ...curriedArgs) => (...args) => fn(...[...curriedArgs, ...args])

export const canHaveProperty = (value) => {
	if (value === null) {
		return false
	}
	if (value === undefined) {
		return false
	}
	return true
}

export const canSetOwnProperty = (value) => {
	if (canHaveProperty(value)) {
		return typeof value === "object" || typeof value === "function"
	}
	return false
}

export const hasOwnProperty = (value, propertyName) => {
	if (canHaveProperty(value) === false) {
		return false
	}
	// using Object.prototype.hasOwnProperty.call to support Object.create(null)
	return Object.prototype.hasOwnProperty.call(value, propertyName)
}

export const hasProperty = (value, propertyName) => {
	if (canHaveProperty(value) === false) {
		return false
	}
	if (hasOwnProperty(value, propertyName)) {
		return true
	}
	const valuePrototype = Object.getPrototypeOf(value)
	return hasProperty(valuePrototype, propertyName)
}

export const getOwnPropertyNamesAndSymbols = (value) => {
	if (canHaveProperty(value)) {
		return Object.getOwnPropertyNames(value).concat(Object.getOwnPropertySymbols(value))
	}
	return []
}

export const defineProperty = (object, nameOrSymbol, attributes) => {
	const descriptor = Object.getOwnPropertyDescriptor(object, nameOrSymbol)
	let desiredDescriptor

	if (descriptor) {
		if (Object.keys(attributes).every((name) => descriptor[name] === attributes[name])) {
			return object
		}
		desiredDescriptor = { ...descriptor, ...attributes }
	} else {
		desiredDescriptor = { ...attributes }
	}

	const objectWithModifiedProperty = { ...object }

	Object.defineProperty(objectWithModifiedProperty, nameOrSymbol, desiredDescriptor)

	return objectWithModifiedProperty
}

export const isPrimitive = (value) => {
	if (value === null) {
		return true
	}
	if (value === undefined) {
		return true
	}
	const type = typeof value
	if (type === "string" || type === "number" || type === "boolean" || type === "symbol") {
		return true
	}
	return false
}
