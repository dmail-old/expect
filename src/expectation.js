import { createFactory } from "@dmail/mixin"
import { createAction } from "@dmail/action"
import { createAnonymousTrace } from "./trace/trace"

export const createExpectation = createFactory(({ expected, compare = () => {} }) => {
	let nextExpectation

	const chain = arg => {
		nextExpectation = arg
	}

	const match = (actual, trace) => {
		const action = createAction()
		if (trace === undefined) {
			trace = createAnonymousTrace({
				actual,
				expected,
			})
		}

		compare({
			actual,
			expected,
			fail: action.fail,
			pass: action.pass,
		})

		return action.then(
			value => {
				if (nextExpectation) {
					const nextTrace = trace.discover({
						actual: value,
						expected: nextExpectation.getExpected(),
					})
					return nextExpectation.match(value, nextTrace)
				}
				return {
					trace,
					value,
				}
			},
			value => ({
				trace,
				value,
			}),
		)
	}

	const getExpected = () => expected

	return {
		chain,
		match,
		getExpected,
	}
})

/*
expectExactly(10)

const createExpectationFunction = (properties) => (expected) => {
  return createExpectation({
    expected,
    ...properties
  })
}

const expectExactly = createExpectationFunction({
  compare: ({ actual, expected, fail, pass }) => {
    if (actual === expected) {
      return pass()
    }
    return fail()
  }
})
*/

/*
expectResolve(expectExactly(10))

const expectResolve = (expected) => {
  return createExpectation({
    expected,
    name: 'thenable',
    compare: ({ actual, pass }) => {
      actual.then(
        (value) => {
          pass({
            status: 'resolved',
            value,
          })
        },
        (reason) => {
          pass({
            status: 'rejected',
            value: reason
          })
        }
      )
    }
  }).chain(expectProperties({
    status: expectExactly('resolved'),
    value: expected
  }))
}
*/

/*
expectProperties({ foo: expectExactly(true) })

const expectProperties = (expected) => {
  // le concept de trace continue d'exister
  // il faut voir comment on l'implémente ici
  const expectedNames = Object.getOwnPropertyNames(expected).concat(Object.getOwnPropertySymbols(expected))
  // ici il faut utiliser chain pour qu'on puisse inspecter trace et trouver une éventuelle
  // précédente trace utilisant actual ou expected
  // donc on va créer des property expectation sur la valeur de expected
  // puis si on trouve des pointeurs dans la trace expected bien indiquer qu'on s'attends
  // à trouver un pointeur

  reutrn expectAll(
    ...expectedNames(name => createExpectation({
      compare: ({ actual, expected, fail, pass }) => {

      }
    })
  )
*/

/*
callExpecting(expectExactly(10))

const findCallExpectations = (value) => {
  // en gros il faut que chaque expectation expose qui elle est
  // ou en tous cas qu'on puisse savoir s'il s'agit d'une callExpectation
  // ça c'est facile
  // ensuite il faut que expectAll, expectSome, expectOneOf
  // permette de lister les expectations qui sont dedans afin de pouvoir les collecter
  // ensuite on a juste a bouclé sur tout ça
  // le premier argument de callExpecting doit être
  // un de expectAll, expectSome, expectOneOf, expectNot ou directement une callExpectation
  // faire quelque chose comme callExpecting(expectExactly(undefined))
  // a pas trop de sens
  // pour le moment cela ignorerais tout simplement les expectation qui ne sont pas des callExpectation
}

const callExpecting = (expected) => {
  const callExpectations = findCallExpectations(expected)

  return createExpectation({ actual, expected, pass, fail }) => {
    const callSideEffectMetas = callExpectations.map(
      ({ setupSideEffect }) => setupSideEffect()
    )
    actual()
    const callSideEffects = callExpectations.map(
      ({ collectSideEffect }, index) => collectSideEffect(callSideEffectMetas[index])
    )
    return pass(callSideEffects)
  }).chain(expectProperties(callExpectations))
})
*/

export const assert = (actual, expectation) => expectation.match(actual)
