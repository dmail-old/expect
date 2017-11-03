import { expectCalled } from "../expectCalled/expectCalled.js"
import { sequence, failed, passed } from "@dmail/action"

const expectCalledBefore = (tracker, otherTracker) => {
	const trackerOrder = tracker.createReport().absoluteOrder
	const otherTrackerOrder = otherTracker.createReport().absoluteOrder
	if (otherTrackerOrder < trackerOrder) {
		return failed(`${tracker} must be called before ${otherTracker}`)
	}
	return passed()
}

export const expectCalledInOrder = (...spies) =>
	sequence(
		spies.map(spy => spy.track(0)).map((tracker, index, trackers) => {
			if (index === 0) {
				return expectCalled(tracker)
			}
			return expectCalled(tracker).then(() => expectCalledBefore(trackers[index - 1], tracker))
		})
	)
