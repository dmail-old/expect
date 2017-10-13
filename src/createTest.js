import {
	passed,
	failed,
	fromFunctionWithAllocableMs,
	aroundAction,
	sequence,
	all
} from "@dmail/action"

const createFunctionCallingFirst = (fn, fnCalledAfter) => (...args) => {
	fn(...args)
	return fnCalledAfter(...args)
}

// should be modified to handle input iterable and output an other iterable
// instead of considering iterable is always an array
// const mapIterable = (iterable, fn) => iterable.map(fn)

const createCompositeAction = (
	iterable,
	{ createActionFromValue = v => v, how = "sequentially" } = {}
) => {
	const mapAction = value =>
		passed(createActionFromValue(value)).then(
			result => ({ state: "passed", result }),
			// transform failed into passed so that sequence & all does not stop on first failure
			result => passed({ state: "failed", result })
		)
	// but once sequence/all are done, refails it when needed
	const failWhenSomeIsFailed = reports =>
		reports.some(({ state }) => state === "failed") ? failed(reports) : passed(reports)

	if (how === "sequentially") {
		return sequence(iterable, mapAction).then(failWhenSomeIsFailed)
	}
	return all(iterable, mapAction).then(failWhenSomeIsFailed)
}

const createCompositeActionWithAllocableMs = (
	iterable,
	{ createActionFromValue = v => v, how = "sequentially", allocatedMs = Infinity } = {}
) => {
	return fromFunctionWithAllocableMs(
		createFunctionCallingFirst(
			({ allocateMs }) => allocateMs(allocatedMs),
			({ getRemainingMs }) =>
				createCompositeAction(iterable, {
					createActionFromValue: value => {
						fromFunctionWithAllocableMs(
							createFunctionCallingFirst(
								({ allocateMs }) => allocateMs(getRemainingMs()),
								// donc là, la fonction à x temps pour se faire
								// sauf qu'en fait on veut appeler createActionFromvalue dessus
								// mais
								createActionFromValue(value)
							)
						)
					},
					how
				})
		)
	)
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
		createCompositeActionWithAllocableMs(expectations, ({ description, fn }) =>
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
