import { test } from "./test.js"
import { createTest } from "./createTest.js"

test("ensure.js", ({ ensure: it, assert }) => {
	// faut tester que: la fonction run à allocatedMs pour se résoudre
	// chaque expectation "hérite" de remainingMs
	// chaque expectation est run en série
	// lorsqu'une expectation fail la suivante est quand même run
	// le résultat de run est un report de chaque expectation indiquant fail/passed
	// beforeEach, afterEach est applé avant/après chaque expectation
	// la fonctionnalité @@autorun

	it("return a function to run expectations", () => {
		const firstExpectation = () => {}

		const run = createTest(
			{
				"first expectation description": firstExpectation
			},
			{ allocatedMs: 10 }
		)
	})
})
