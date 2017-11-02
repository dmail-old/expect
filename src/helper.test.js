import { createIndexes } from "./helper.js"
import { createTest } from "@dmail/test"
import assert from "assert"

export default createTest({
	"createIndexes(3)": ({ pass }) => {
		assert.deepEqual(createIndexes(3), [0, 1, 2])
		pass()
	},
	"createIndexes(3, 1)": ({ pass }) => {
		assert.deepEqual(createIndexes(3, 1), [1, 2])
		pass()
	}
})
