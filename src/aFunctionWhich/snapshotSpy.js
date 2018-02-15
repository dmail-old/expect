export const createSpySnapshot = (spy) => {
	const callCount = spy.getCallCount()
	const getCallCount = () => callCount

	return {
		getCallCount,
	}
}

export const getCallsFromSnapshot = ({ getCallCount }, spy) => {
	const callCountSnapshot = getCallCount()
	const callCount = spy.getCallCount()
	const calls = []
	let callIndex = callCountSnapshot

	while (callIndex !== callCount) {
		calls.push({
			spy,
			tracker: spy.track(callIndex),
		})
		callIndex++
	}

	return calls
}
