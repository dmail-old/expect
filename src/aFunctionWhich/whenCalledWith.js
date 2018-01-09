import { createFactory } from "@dmail/mixin"
import { pureBehaviour } from "../behaviour.js"

export const whenCalledWith = createFactory(pureBehaviour, (...argValues) => {
	const assert = ({ setArgValues }) => {
		setArgValues(argValues)
		return () => {}
	}
	return { assert }
})
