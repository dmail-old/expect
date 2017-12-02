const createValueTrace = ({ parentTrace, name, value, history }) => {
	const trace = {}
	const getDepth = () => (parentTrace ? parentTrace.getDepth() + 1 : 0)
	const getParentTrace = () => parentTrace
	const getName = () => name
	const getValue = () => value
	const getFirstTraceFor = searchedValue =>
		history.find(({ getValue }) => getValue() === searchedValue)
	const getAllTraceFor = searchedValue =>
		history.filter(({ getValue }) => getValue() === searchedValue)
	const nest = (value, name) => {
		return createValueTrace({
			parentTrace: trace,
			name,
			value,
			history,
		})
	}
	const readProperty = name => nest(value[name], name)

	history.push(trace)
	Object.assign(trace, {
		getDepth,
		getParentTrace,
		getName,
		getValue,
		getFirstTraceFor,
		getAllTraceFor,
		readProperty,
	})

	return trace
}

export const createAnonymousValueTrace = value => {
	return createValueTrace({
		parentTrace: null,
		name: "value",
		value,
		history: [],
	})
}

export const createNamedValueTrace = (value, name) => {
	return createValueTrace({
		parentTrace: null,
		name,
		value,
		history: [],
	})
}
