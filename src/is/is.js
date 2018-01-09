import { createFactory } from "@dmail/mixin"
import { pureClause } from "../clause.js"
import { uneval } from "@dmail/uneval"

/*

is va retourner un objet permettant de savoir qu'on rempli ou pas ce contrat
de sorte qu'on peut ensuite s'en servir pour savoir un tas de chose sur ce contrat

*/

export const is = createFactory(
	pureClause,
	(expected) => {
		return { expected }
	},
	({ expected, control }) => {
		const createExpectedDescription = () => uneval(expected)
		const createActualDescription = ({ actual }) => uneval(actual)

		const isFiled = (actual) => {
			return control(actual, () => {
				if (actual === expected) {
					return true
				}
				return false
			})
		}

		return { createExpectedDescription, createActualDescription, isFiled }
	},
)
