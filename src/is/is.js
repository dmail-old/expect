import { createFactory } from "@dmail/mixin"
import { pureContract } from "../contract.js"

export const is = createFactory(
	pureContract,
	(expected) => ({ expected }),
	({ setValidator }) => {
		setValidator(({ actual, expected }) => {
			return actual === expected
		})
	},
)
