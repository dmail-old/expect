/*
const exactly = createMatcher(({ expected, actual, pass, fail }) => {
	if (actual.getValue() === expected.getValue()) {
		return pass()
	}
	return fail()
})

// exactly est un matcher
const exactly10 = exactly(10)
// exactly10 est une expectation
const result = exactly10(9)
// result est une assertion

voir si on peut pas éviter le actual/expected qui est wrap dans une trace
mais plutôt avoir actual et expected qui soit les valeurs
et avoir un objet trace genre {actual, expected, trace}
et trace donne les infos dont on a besoin

lorsqu'on nest en fait on modifie l'objet trace mais pas actual ou expected
en tous cas on est pas obligé de la modifier

quand un matcher est appelé avec actual, si actual n'est pas une trace
alors on la crée

il faudrais que l'objet trace ait un pointeur getActual et getExpected
*/

import { hasProperty } from "./helper.js"
import { isTrace, createNamedTrace } from "./trace/trace.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const getValueNameFromTrace = ({ getName, getParentTrace }) => {
	const name = getName()
	const parentTrace = getParentTrace()
	if (parentTrace === null) {
		// I want to improve failure message event more could improve log even more by transforming
		// "expect value 0 to be an object"
		// into
		// "expect anonymous spy first call first argument to be an object"
		// thanks to this trace api and maybe a bit more work I'll be able to do that
		// I must first end the other apis, especially the ones around spy
		// to see more clearly how we can transform "0" into "first argument"
		return name
	}
	// we do String(valueName) in case valueName is a symbol
	// to avoid Cannot convert a Symbol value to a string error
	return `${getValueNameFromTrace(parentTrace)} ${String(name)}`
}

export const createFailureMessage = ({ type, actual, expected, trace }) => {
	if (type === "unexpected-resolved-value") {
		return `expect ${getValueNameFromTrace(
			trace.getParentTrace(),
		)} to reject but it resolved with ${uneval(actual)}`
	}
	return `expect ${getValueNameFromTrace(trace)} to match ${uneval(expected)}`
}

const matchSymbol = Symbol()

export const isMatcher = value => hasProperty(value, matchSymbol)

// ça serait bien de se dire que createMatcher peut se produire en deux phases,
// en gros y'a la phase où on reçoit expected
// et la phase ou on reçoit actual,
// chacune de ces phases peut déclencher quelque chose

export const createMatcher = (fn, { defaultName = "value" } = {}) => {
	const matcher = expected => {
		const expectation = actual => {
			const trace = isTrace(actual)
				? actual
				: createNamedTrace(
						{
							actual,
							expected,
						},
						defaultName,
					)
			actual = trace.getValue().actual
			const action = createAction()
			const pass = (...args) => action.pass(...args)
			const fail = data =>
				action.fail({
					actual,
					expected,
					trace,
					...data,
				})

			const compose = expectation => pass(expectation(trace))
			const composeDiscovering = (name, value, expectation) => {
				if (isMatcher(expectation)) {
					expectation = expectation(expectation)
				}
				pass(
					expectation(
						trace.discover(
							{
								actual: value,
								expected: expectation,
							},
							name,
						),
					),
				)
			}

			fn({
				trace,
				expected,
				actual,
				pass,
				fail,
				compose,
				composeDiscovering,
			})

			return action.then(null, failure => {
				if (trace === failure.trace) {
					return createFailureMessage(failure)
				}
				return failure
			})
		}
		return expectation
	}
	matcher[matchSymbol] = true
	return matcher
}

// const createPropertiesFailureMessage = ({ type, trace, data }) => {
// 	if (type === "extra-recursion") {
// 		return `expect ${getValueNameFromTrace(trace)} to be ${prefixValue(
// 			trace.getExpected(),
// 		)} but got a circular reference`
// 	}
// 	if (type === "missing-recursion") {
// 		return `expect ${getValueNameFromTrace(trace)} to be a circular reference but got ${prefixValue(
// 			trace.getActual(),
// 		)}`
// 	}
// 	if (type === "extra") {
//		const actualReference = trace.actual.getReference()
//		if (actualReference) {
//			// retourne un autre message pour dire qu'on a une unexpected recursion
//			// mais en fait on s'en moque c'est juste une unexpected property ici
//		}
// 		return `unexpected ${trace.getName()} property on ${getValueNameFromTrace(
// 			trace.getParentTrace(),
// 		)}`
// 	}
// 	if (type === "missing") {
// 		return `expect ${trace.getName()} property on ${getValueNameFromTrace(
// 			trace.getParentTrace(),
// 		)} but missing`
// 	}
// 	if (type === "mismatch") {
// 		return `${getValueNameFromTrace(trace)} mismatch: ${data}`
// 	}
// }
