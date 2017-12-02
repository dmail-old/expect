/*

il ne "faut pas" séparer valueTrace de matcherTrace

matcherTrace permettra de tracer le nom de expected (qui est sync avec actual en fait)
et le nom des matchers utilisé pour arriver là (pas besoin de ça pour le moment)

et donc on utilisera matcherTrace pour combiner le matcher en disant ok je suis avec tel
combinaison de actual/expected et je veux check des truc

ou alors au lieu de matcherTrace
je considère juste que lorsqu'un matcher est appelé avec un matcher en argument
cela le compose le résultat en sortie
il ne s'agit de compose les matchers avec un matchAll, matchOne
mais bien de composer l'éxécution des matchers sur une valeur

si on est sur le premier matcher cette éxécution n'existe pas donc on en crée une
sinon on chain le matcher précédent avec celle-ci

de sorte qu'en sortie on a un arbre de matcher avec le résultat de chacun

je pense que ducoup properties.js va consister en une première partie qui va décomposer
l'objet qu'on passe en entrée en un truc qui va
s'attendre à la présence d'une propriété ainsi que vérifier qu'elle match
si expected contient un truc circulaire on aura un matcher qui attends que ce soit circulaire etc
ce sera moins dynamique (et tant mieux)

*/

import { hasProperty } from "./helper.js"
import { createAnonymousValueTrace } from "./trace/trace.js"

const matchSymbol = Symbol()
export const isMatcher = value => hasProperty(value, matchSymbol)

const traceSymbol = Symbol()
const isTrace = value => hasProperty(value, traceSymbol)
const createTrace = ({ parentTrace, actualTrace, expectedTrace }) => {
	const trace = { [traceSymbol]: true }
	const getDepth = () => (parentTrace ? parentTrace.getDepth() + 1 : 0)
	const getParentTrace = () => parentTrace
	const match = matcher => matcher(trace)
	const nest = ({ name, actual, expected }) => {
		return createTrace({
			parentTrace: trace,
			name,
			actualTrace: actualTrace.nest(actual, name),
			expected: expectedTrace.nest(expected, name),
		})
	}

	Object.assign(trace, {
		getDepth,
		getParentTrace,
		actualTrace,
		expectedTrace,
		match,
		nest,
	})

	return trace
}

const createTopLevelTrace = (actual, expected) => {
	return createTrace({
		parentTrace: null,
		actualTrace: createAnonymousValueTrace(actual),
		expectedTrace: createAnonymousValueTrace(expected),
	})
}

// const getValueNameFromTrace = trace => {
// 	const { getName, getParentTrace } = trace
// 	const valueName = getName()
// 	const parentTrace = getParentTrace()
// 	if (parentTrace === null) {
// 		// I want to improve failure message event more could improve log even more by transforming
// 		// "expect value 0 to be an object"
// 		// into
// 		// "expect anonymous spy first call first argument to be an object"
// 		// thanks to this trace api and maybe a bit more work I'll be able to do that
// 		// I must first end the other apis, especially the ones around spy
// 		// to see more clearly how we can transform "0" into "first argument"
// 		return valueName
// 	}
// 	// we do String(valueName) in case valueName is a symbol
// 	// to avoid Cannot convert a Symbol value to a string error
// 	return `${getValueNameFromTrace(parentTrace)} ${String(valueName)}`
// }

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

export const createMatcher = fn => {
	const matcher = expected => {
		return actual => {
			// euh atta, en fait lorsqu'on apelle avec une trace
			// il faut que si on avait déjà une trace elle se retrouve composé l'une avec l'autre
			if (isTrace(actual)) {
				return fn(actual)
			}
			return fn(createTopLevelTrace(actual, expected))
		}
	}
	matcher[matchSymbol] = true
	Object.defineProperty(matcher, "constructor", {
		enumerable: false,
		/* istanbul ignore next */
		value: function Matcher() {},
	})
	return matcher
}

// export const composeMatcher = mapping =>
// 	createMatcher(actual => {
// 		return sequence(Object.keys(mapping), key => {
// 			return createMatcherFrom(mapping[key])(actual[key])
// 		})
// 	})
