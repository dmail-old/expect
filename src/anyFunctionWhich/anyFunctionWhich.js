import { createMatcher, createMatcherFromFunction } from "../matcher.js"
import { sequence } from "@dmail/action"

/*
let throwed = false
let throwedValue

try {
	actual.getValue()
} catch (e) {
	throwed = true
	throwedValue = e
}
*/

export const throwsWith = createMatcherFromFunction(({ expected, actual, fail }) => {
	const { status } = actual
	if (status === "returned") {
		return fail(`missing throw`)
	}
	return expected(actual)
})

export const aFunctionWhich = (...args) => {
	// ici il faut s'assure que args
	// c'est seulement returnsWith, throwsWith, calls, neverCalls etc
	return createMatcher({
		match: ({ actual, fail }) => {
			// vérifier que actual est une fonction
			// puis installer plein de truc dont args auront besoin pour s'assurer du comportement
			// de la fonction lorsqu'elle est appelée
			// puis on apelle la fonction
			// puis on collecte les métas nécéssaire
			// et on apelle chaque arg avec les métas qu'on a récup
			const metas = []
			return sequence(args)((arg, index) => arg([metas[index]]))
		},
	})
}
