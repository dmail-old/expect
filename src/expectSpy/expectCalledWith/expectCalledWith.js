import { all } from "@dmail/action"
import { expectCalledWithArity } from "../expectCalledWithArity/expectCalledWithArity.js"
import { expectMatch } from "../../expectMatch/expectMatch.js"

export const expectCalledWith = (tracker, ...expectedArgs) =>
	expectCalledWithArity(tracker, expectedArgs.length).then(() => {
		const { argValues } = tracker.createReport()
		return all(
			argValues.map((argValue, index) =>
				expectMatch(argValue, expectedArgs[index]).then(null, failureMessage => {
					if (index === 0) {
						return `${tracker} first argument mismatch: ${failureMessage}`
					}
					if (index === 1) {
						return `${tracker} second argument mismatch: ${failureMessage}`
					}
					if (index === 2) {
						return `${tracker} third argument mismatch: ${failureMessage}`
					}
					return `${tracker} argument n°${index} mismatch: ${failureMessage}`
				})
			)
		)
	})
