import { createFactory, isFactoryOf } from "@dmail/mixin"

const createTrace = createFactory(({ getParentTrace, name, value, history, lastValueOf }) => {
	const getDepth = () => {
		const parentTrace = getParentTrace()
		return parentTrace ? parentTrace.getDepth() + 1 : 0
	}
	const getName = () => name
	const getValue = () => value
	const getHistory = () => history
	const discover = (value, name) => {
		return createTrace({
			getParentTrace: () => lastValueOf(),
			name,
			value,
			history,
		})
	}
	const discoverProperty = name => discover(value[name], name)

	history.push({
		getValue,
		lastValueOf,
	})

	return {
		getDepth,
		getName,
		getValue,
		getHistory,
		discover,
		discoverProperty,
	}
})

export const isTrace = value => isFactoryOf(createTrace, value)

export const createAnonymousTrace = value => {
	return createTrace({
		getParentTrace: () => null,
		name: "value",
		value,
		history: [],
	})
}

export const createNamedTrace = (value, name) => {
	return createTrace({
		getParentTrace: () => null,
		name,
		value,
		history: [],
	})
}

export const createAnonymousTraceFrom = arg => {
	if (isTrace(arg)) {
		return arg
	}
	return createAnonymousTrace(arg)
}

export const createNamedTraceFrom = (arg, name) => {
	if (isTrace(arg)) {
		return arg
	}
	return createNamedTrace(arg, name)
}

export const getTraceReference = (
	trace,
	getter = ({ getValue }) => getValue(),
	compare = (a, b) => a === b,
) => {
	const history = trace.getHistory()
	const value = getter(trace)
	const found = history.find(previousTrace => compare(getter(previousTrace), value))
	return found ? found.lastValueOf() : null
}

export const getTracePath = trace => {
	const path = []
	let traceAncestor = trace.getParentTrace()
	while (traceAncestor) {
		path.push(traceAncestor.getName())
		traceAncestor = traceAncestor.getParentTrace()
	}
	return path
}
