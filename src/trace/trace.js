import { createFactory, isFactoryOf } from "@dmail/mixin"

const createTrace = createFactory(
	({ getParentTrace, getPreviousTrace, name, value, lastValueOf }) => {
		const isFirst = () => getPreviousTrace() === null
		const getDepth = () => (getParentTrace ? getParentTrace.getDepth() + 1 : 0)
		const getName = () => name
		const getValue = () => value
		let lastPropertyTrace
		const discoverProperty = name => {
			const parentTrace = lastValueOf()
			const previousPropertyTrace = lastPropertyTrace

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
	},
)

export const isTrace = value => isFactoryOf(createTrace, value)

export const createNamedTrace = (value, name) => {
	return createTrace({
		getPreviousTrace: () => null,
		name,
		value,
	})
}

export const createAnonymousTrace = value => {
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
	while (previousTrace) {
		previousTracePointer.push(previousTrace)
		if ((compare(getter(previousTrace)), value)) {
			return previousTracePointer
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
		if (pointerATrace.getDepth() !== pointerBTrace.getDepth()) {
			return false
		}
		return true
	})
}
