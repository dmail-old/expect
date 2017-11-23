import { failed, passed } from "@dmail/action"

export const expectCalled = tracker => {
	const { called } = tracker.createReport()
	if (called === false) {
		return failed(`expect ${tracker} to be called`)
	}
	return passed()
}
