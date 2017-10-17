import { mapFailed } from "@dmail/action"

import { expectCalled } from "../expectCalled/expectCalled.js"
import { expectMatch } from "../../expectMatch/expectMatch.js"
import { matchProperties } from "../../expectMatch/index.js"

export const expectCalledWith = (tracker, ...expectedArgs) =>
	expectCalled(tracker).then(() =>
		mapFailed(
			expectMatch(tracker.createReport().argValues, matchProperties(expectedArgs)),
			failureMessage => `${tracker} arguments mismatch: ${failureMessage}`
		)
	)
