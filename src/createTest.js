import { fromFunctionWithAllocableMs, aroundAction } from "@dmail/action"

const createFunctionCallingFirst = (fn, fnCalledAfter) => (...args) => {
	fn(...args)
	return fnCalledAfter(...args)
}

// this is basically the same than sequence
// but a sequence that would collect instead of fail first
// add call allocateMs on each of its action
export const composeTests = (iterable, createTest) => {
	const runTest = ({ allocatedMs = 100 } = {}) =>
		fromFunctionWithAllocableMs(
			createFunctionCallingFirst(
				({ allocateMs }) => allocateMs(allocatedMs),
				({ fail, pass, getRemainingMs }) => {
					const iterator = iterable[Symbol.iterator]()
					const compositeReport = []
					let someHasFailed = false

					const iterate = index => {
						const { done, value } = iterator.next()
						if (done) {
							if (someHasFailed) {
								return fail(compositeReport)
							}
							return pass(compositeReport)
						}

						const test = fromFunctionWithAllocableMs(
							createFunctionCallingFirst(
								({ allocateMs }) => allocateMs(getRemainingMs()),
								createTest(value)
							)
						)
						test.then(
							result => {
								const passedReport = {
									state: "passed",
									result
								}
								compositeReport[index] = passedReport
								iterate(index + 1)
							},
							result => {
								someHasFailed = true
								const failedReport = {
									state: "failed",
									result
								}
								compositeReport[index] = failedReport
								iterate(index + 1)
							}
						)
					}
					iterate(0)
				}
			)
		)
	return runTest
}

const createExpectationsFromObject = expectationsObject =>
	Object.keys(expectationsObject).map(description => {
		return {
			description,
			fn: expectationsObject[description]
		}
	})

export const createTest = expectationsObject => {
	const expectations = createExpectationsFromObject(expectationsObject)
	const runTest = ({ beforeEach = () => {}, afterEach = () => {} } = {}) => {
		composeTests(expectations, ({ description, fn }) =>
			aroundAction(() => beforeEach(description), fn, (result, passed) =>
				afterEach(description, result, passed)
			)
		)
	}

	runTest["@@autorun"] = () =>
		runTest({
			beforeEach: description => {
				console.log(description)
			},
			afterEach: (description, result, passed) => {
				if (passed) {
					console.log(`passed${result ? `: ${result}` : ""}`)
				} else {
					console.log(`failed${result ? `: ${result}` : ""}`)
				}
			}
		})

	return runTest
}
