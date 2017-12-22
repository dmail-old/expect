import { mixin } from "@dmail/mixin"
import { pureBehaviour } from "../behaviour.js"
import { createAssertionFrom } from "../createAssertionFrom/createAssertionFrom.js"

export const willReturnWith = (value) =>
	mixin(pureBehaviour, () => ({
		factory: willReturnWith,
		value,
		assert: ({ observeResultValue }) => {
			const getResultValue = observeResultValue()
			const assertReturnValue = createAssertionFrom(value)

			return () => {
				return assertReturnValue(getResultValue())
			}
		},
	}))
