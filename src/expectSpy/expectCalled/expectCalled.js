import { fromFunction } from "@dmail/action"

export const expectCalled = tracker =>
	fromFunction(({ fail, pass }) => {
		if (tracker.createReport().called === false) {
			return fail(`expect ${tracker} to be called`)
		}
		return pass()
	})
