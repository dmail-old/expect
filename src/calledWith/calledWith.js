import {
	label,
	createMatcher,
	composeMatcher,
	emptyParamSignature,
	oneOrMoreParamSignature,
} from "../matcher.js"
import { propertiesMatchAllowingExtra } from "../propertiesMatch/propertiesMatch.js"

const getLabelNameForArgumentAt = (argValue, argIndex) => {
	if (argIndex === 0) {
		return `first argument`
	}
	return `argument n° ${argIndex}`
}
const matchTracker = () => {}

const getCallArguments = tracker => {
	return matchTracker(tracker).then(() =>
		label(
			tracker
				.createReport()
				.argValues.map((argValue, index) => label(getLabelNameForArgumentAt(argValue, index))),
			`${tracker} arguments`,
		),
	)
}

export const calledWith = oneOrMoreParamSignature({
	fn: (...args) =>
		createMatcher(actual => {
			getCallArguments(actual).then(composeMatcher(...args))
		}),
	createMessage: `calledWith() must be called with one or more argument, you may want to use calledWithoutArgument() instead`,
})

const hasLengthPropertyStrictEqualZero = propertiesMatchAllowingExtra({ length: 0 })
export const calledWithoutArgument = emptyParamSignature({
	fn: () =>
		createMatcher(actual => getCallArguments(actual).then(hasLengthPropertyStrictEqualZero)),
	createMessage: `calledWithoutArgument() must be called without argument, you may want to use calledWith() instead`,
})
