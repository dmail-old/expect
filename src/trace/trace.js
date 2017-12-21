import { createFactory, isProducedBy } from "@dmail/mixin"

const createTrace = createFactory(({ getParentTrace, getPreviousTrace, name, value, valueOf }) => {
	const isFirst = () => getPreviousTrace() === null
	const getDepth = () => {
		const parentTrace = getParentTrace()
		return parentTrace ? parentTrace.getDepth() + 1 : 0
	}
	const getName = () => name
	const getValue = () => value
	let lastPropertyTrace
	const discoverProperty = (name) => {
		const parentTrace = valueOf()
		const previousPropertyTrace = lastPropertyTrace || parentTrace

		lastPropertyTrace = createTrace({
			getParentTrace: () => parentTrace,
			getPreviousTrace: () => previousPropertyTrace,
			name,
			value: value[name],
		})

		return lastPropertyTrace
	}

	return {
		isFirst,
		getDepth,
		getName,
		getValue,
		discoverProperty,
	}
})

export const isTrace = (value) => isProducedBy(createTrace, value)

export const createNamedTrace = (value, name) => {
	return createTrace({
		getParentTrace: () => null,
		getPreviousTrace: () => null,
		name,
		value,
	})
}

export const createAnonymousTrace = (value) => {
	return createNamedTrace(value, "value")
}

export const getPointerFromTrace = (
	trace,
	value = trace.getValue(),
	getter = ({ getValue }) => getValue(),
	compare = (a, b) => a === b,
) => {
	const previousTracePointer = []

	let previousTrace = trace.getPreviousTrace()
	let siblingTrace = trace
	while (previousTrace) {
		const previousTraceMatch = compare(getter(previousTrace), value)

		if (previousTraceMatch) {
			previousTracePointer.push(previousTrace)
			return previousTracePointer
		}
		if (previousTrace.getDepth() < siblingTrace.getDepth()) {
			siblingTrace = previousTrace
			previousTracePointer.push(previousTrace)
		}
		previousTrace = previousTrace.getPreviousTrace()
	}

	return null
}

export const comparePointer = (pointerA, pointerB) => {
	if (pointerA.length !== pointerB.length) {
		return false
	}
	return pointerA.every((pointerATrace, index) => {
		const pointerBTrace = pointerB[index]
		if (pointerATrace.getName() !== pointerBTrace.getName()) {
			return false
		}
		// if (pointerATrace.getDepth() !== pointerBTrace.getDepth()) {
		// 	return false
		// }
		return true
	})
}
