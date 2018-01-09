import { mixin, pure, isProductOf, replicate, createFactory } from "@dmail/mixin"
/*

la particuliarité avec les contrats c'est que lorsqu'ils fails
il faut pouvoir tracer comment il fail afin d'obtenir le nom de la valeur
qui était en train d'être testées

pour avoir un beau message d'erreur

et ça on peut et IL FAUT le faire en amont
genre quand on dit exactProperties({})
il faut déjà créer la structure et tout ce qu'il faut pour n'avoir plus qu'à
faire exactProperties().validate(value)
et qu'on détecte en amont des trucs chelous

dans cet objectif il faut donc prévoir une api permettant ça

y'aurais le concept de contrat
puis un truc qui permet d'enchainer les contrats (then)
et un truc permettant d'en éxécuter une liste (all)

*/

// const createExpectedDescription = () => uneval(expected)
// 	const createActualDescription = ({ actual }) => uneval(actual)
// 	const createFailureDescription = (param) => {
//     return `${createValueDescription(param)} mismatch
// actual:
// ${createActualDescription(param)}

// expected:
// ${createExpectedDescription(param)}
// `

export const createContract = createFactory(
	pure,
	() => {},
	({ getComposite }) => {
		const nextContracts = []
		const chain = (nextContract) => {
			nextContracts.push(nextContract)
			return getComposite()
		}

		let description = "this must describe what contract expects"
		const getDescription = () => description
		const setDescription = (value) => {
			description = value
		}

		let rule
		const setRule = (value) => {
			rule = value
		}

		const execute = (value) => {
			if (rule(value)) {
				// si on des contrats suivant échoue
				// on échoue le contrat parent avec le contrat enfant
				nextContracts.forEach((nextContract) => {
					nextContract.execute(value)
				})
			} else {
			}
		}

		return {
			getDescription,
			setDescription,
			chain,
			execute,
			setRule,
		}
	},
)

export const isContract = (value) => isProductOf(createContract, value)

// http://sinonjs.org/releases/v4.1.4/mocks/#expectations

const expectFooString = () => {
	const contract = createContract()
	contract.setDescription(`the string "foo"`)
	contract.setRule((value) => value === "foo")
	return contract
}

const expectProperty = (name, propertyContract) => {
	const contract = createContract()
	contract.setSubject(`property ${name}`)
	contract.setDescription(contract.getDescription())
	contract.setRule((value) => value.hasOwnProperty(name))
	return contract.chain(() => propertyContract)
}

expectProperty("foo", expectFooString())

/*



*/

// const value = {
// 	foo: "bar",
// 	item: {
// 		name: "sword"
// 	},
// }
// const contract = createContract(
// 	propertyClause("foo", "bar"),
// 	propertyClause("item", allContract(
// 		propertyClause("name", 'sword'),
// 		hasExactPropertiesClause("name")
// 	)),
// 	hasExactPropertiesClause("foo", "item"),
// )

/*
cela suppose les choses suivantes
les contrats peuvent attendre plusieurs arguments
l'api d'un contrat c'est jusqu'ensuite on l'apelle sur quelque chose

contract.validate(something)

et ça retourne la liste des clauses qui sont valides ou non valides

[
	propertyClause{valid: true/false, reason: "missing"/"invalid"}
]

*/
