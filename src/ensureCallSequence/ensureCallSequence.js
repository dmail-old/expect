import { createExpectation, match } from "../match.js"
import { passed, reduce } from "@dmail/action"
import { anyNumberAbove } from "../anyNumberAbove/anyNumberAbove.js"

const expectFirstCallAbsoluteOrder = (spy, index) =>
	createExpectation({
		getName: `${spy.track(index)} absolute order`,
		getValue: spy.track(index).createReport().absoluteOrder,
	})

export const ensureCallSequence = (...spies) =>
	reduce(
		spies,
		(previousOrder, spy) =>
			match(expectFirstCallAbsoluteOrder(spy), anyNumberAbove(previousOrder), absoluteOrder =>
				passed(absoluteOrder),
			),
		-1,
	)
