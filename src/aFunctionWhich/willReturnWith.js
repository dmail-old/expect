import { createFactory } from "@dmail/mixin"
import { pureBehaviour } from "../behaviour.js"
import { createAssertionFrom } from "../createAssertionFrom/createAssertionFrom.js"

export const willReturnWith = createFactory(pureBehaviour, (value) => {
	const assertReturnedValue = createAssertionFrom(value)
	const assert = ({ observeResultValue }) => {
		const getResultValue = observeResultValue()

		return () => assertReturnedValue(getResultValue())
	}

	return {
		value,
		assert,
	}
})
