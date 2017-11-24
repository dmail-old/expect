import { createExpectation } from "../match.js"

export const expectCallAtArguments = (spy, index) =>
	createExpectation({
		getName: () => `${spy.track(index)} arguments`,
		getValue: () => spy.track(index).createReport().argValues,
	})
export const expectFirstCallArguments = spy => expectCallAtArguments(spy, 0)
export const expectSecondCallArguments = spy => expectCallAtArguments(spy, 1)

// hum faudrais faire une sorte de all sur expectCallAtArguments, chiant et on s'en sers pas pour le moment
// export const expectEveryCallArguments = spy =>
