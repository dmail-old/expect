import { all } from "@dmail/action"

import { expectCalledExactly } from "../expectCalledExactly/expectCalledExactly.js"
import { expectCalledWith } from "../expectCalledWith/expectCalledWith.js"
import { createIndexes } from "../../helper.js"

export const expectCalledExactlyWith = (spy, expectedCallCount, ...expectedArgs) =>
	expectCalledExactly(spy, expectedCallCount).then(() =>
		all(
			createIndexes(expectedCallCount).map(index =>
				expectCalledWith(spy.track(index), ...expectedArgs)
			)
		)
	)
export const expectCalledOnceWith = (spy, ...expectedArgs) =>
	expectCalledExactlyWith(spy, 1, ...expectedArgs)
export const expectCalledTwiceWith = (spy, ...expectedArgs) =>
	expectCalledExactlyWith(spy, 2, ...expectedArgs)
