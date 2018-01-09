import { createFactory } from "@dmail/mixin"
import { pureBehaviour } from "../behaviour.js"
import { createAssertionFrom } from "../createAssertionFrom/createAssertionFrom.js"

export const willReturnWith = createFactory(pureBehaviour, (value) => {
	const assertReturnedValue = createAssertionFrom(value)

	const createValueDescription = ({ fn, ...param }) =>
		`${fn} return ${assertReturnedValue.createValueDescription({ param })}`

	const createExpectedDescription = assertReturnedValue.createExpectedDescription
	const createActualDescription = assertReturnedValue.createActualDescription

	const assert = ({ observeResultValue }) => {
		const getResultValue = observeResultValue()

		return () => assertReturnedValue(getResultValue())
	}

	return {
		value,
		assert,
		createValueDescription,
		createExpectedDescription,
		createActualDescription,
	}
})
