/*

parce que plus puissant, j'aimerai ça:

match(expectCallCount(spy), 10)
expectCallCount(spy, anyNumberAbove(10))
expectCallCount(spy, anyNumberBetween(0, 10))

mais dans ce cas lorsque 10, ou above 10 ne match pas le message de failure sera

idéalement il "faudrais"
anonymous spy call count mismatch: expect a number above 10 but got 5

expectChain(
	() => expectCallCount(spy, 10),
	() => expectFirstCall(spy, calledWith(above(10), true))
)
*/

import { createExpectation } from "../match.js"

export const expectCallCount = spy =>
	createExpectation({
		getName: () => `${spy} call count`,
		getValue: () => spy.getCallCount(),
	})
