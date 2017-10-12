import { fromFunction } from "@dmail/action"
import { fromFunctionWithAllocableMs } from "./fromFunctionWithAllocableMs.js"

const composeParams = (inputParams, params) => Object.assign({}, inputParams, params)
export const createFunctionComposingParams = (
	params = {},
	fnCalledWithComposedParams
) => inputParams => fnCalledWithComposedParams(composeParams(inputParams, params))
export const createFunctionComposingDynamicParams = (
	fnCreatingDynamicParams,
	fnCalledWithComposedParams
) => inputParams =>
	fnCalledWithComposedParams(composeParams(inputParams, fnCreatingDynamicParams(inputParams)))
export const createFunctionCalledBefore = (fn, fnCalledAfter) => (...args) => {
	fn(...args)
	return fnCalledAfter(...args)
}

export const ensure = (expectations, { allocatedMs = 100 } = {}) => {
	const runTest = ({ beforeEach, afterEach, allocateMs, getRemainingMs } = {}) => {
		return fromFunction(({ fail, pass }) => {
			// give the allocateMs for ensure to fail/pass
			allocateMs(allocatedMs)

			const expectationDescriptions = Object.keys(expectations)
			const compositeReport = {}
			let passedOrFailedCount = 0
			let someHasFailed = false

			const checkEnded = () => {
				passedOrFailedCount++
				if (passedOrFailedCount === expectationDescriptions.length) {
					if (someHasFailed) {
						fail(compositeReport)
					} else {
						pass(compositeReport)
					}
				}
			}

			// les expectations sont run en parallèle, why not
			// je pense que ce serais mieux en sérié quand même
			// pour que ça fail tjrs dans le même ordre
			// on pourrait aussi réordonne les failures mais
			// en cas de race condition ça reste risqué
			expectationDescriptions.forEach(description => {
				beforeEach(description)
				fromFunctionWithAllocableMs(
					// give expectation the ensure allocatedMs to fail/pass
					createFunctionCalledBefore(
						({ allocateMs }) => allocateMs(getRemainingMs()),
						expectations[description]
					)
				).then(
					result => {
						const passedReport = {
							state: "passed",
							result
						}
						compositeReport[description] = passedReport
						afterEach(description, passedReport)
						checkEnded()
					},
					result => {
						someHasFailed = true
						const failedReport = {
							state: "failed",
							result
						}
						compositeReport[description] = failedReport
						afterEach(description, failedReport)
						checkEnded()
					}
				)
			})
		})
	}

	runTest["@@autorun"] = () =>
		fromFunctionWithAllocableMs(
			createFunctionComposingParams(
				{
					beforeEach: description => {
						console.log(description)
					},
					afterEach: (description, report) => {
						if (report.state === "passed") {
							console.log(`passed${report.result ? `: ${report.result}` : ""}`)
						} else {
							console.log(`failed${report.result ? `: ${report.result}` : ""}`)
						}
					}
				},
				runTest
			)
		)

	return runTest
}
