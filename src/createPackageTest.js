import fs from "fs"
import nodepath from "path"
import { glob } from "glob-gitignore"
import ignore from "ignore"
import {
	fromPromise,
	fromNodeCallbackRecoveringWhen,
	composeSequenceWithAllocatedMs,
	mutateAction,
	reduce,
	failed
} from "@dmail/action"

const getOptionalFileContent = fromNodeCallbackRecoveringWhen(
	fs.readFile,
	error => error.code === "ENOENT",
	""
)
const getOptionalFileContentAsString = path => getOptionalFileContent(path).then(String)

const sourceFileInclude = ["dist/**"]
const testFileInclude = ["dist/**/*.test.*"]

const sourceFileExclude = ["dist/**/*.map", testFileInclude]
const testFileExclude = ["dist/**/*.map"]

export const findSourceFiles = (location = process.cwd()) => {
	const absoluteLocation = nodepath.resolve(process.cwd(), location)
	return fromPromise(
		glob(sourceFileInclude, {
			nodir: true,
			cwd: absoluteLocation,
			ignore: ignore().add(sourceFileExclude)
		})
	)
}

export const findFilesForTest = (location = process.cwd()) => {
	const absoluteLocation = nodepath.resolve(process.cwd(), location)
	return getOptionalFileContentAsString(
		nodepath.join(absoluteLocation, ".testignore")
	).then(ignoreRules =>
		fromPromise(
			glob(testFileInclude, {
				nodir: true,
				cwd: absoluteLocation,
				ignore: ignore()
					.add(testFileExclude)
					.add(ignoreRules)
			})
		)
	)
}

export const createPackateTest = ({
	location = process.cwd(),
	allocatedMs = 100,
	beforeEachFile = () => {},
	beforeEachTest = () => {},
	afterEachTest = () => {},
	afterEachFile = () => {}
}) =>
	reduce([
		() => findSourceFiles(location),
		sourceFiles =>
			sourceFiles.forEach(sourceFile => {
				const sourcePath = nodepath.resolve(location, sourceFile)
				require(sourcePath) // eslint-disable-line import/no-dynamic-require
			}),
		() => findFilesForTest(location),
		testFiles =>
			// we are running tests in sequence and not in parallel because they are likely going to fail
			// when they fail we want the failure to be reproductible, if they run in parallel we introduce
			// race condition, non determinism, etc: bad idea
			composeSequenceWithAllocatedMs(
				testFiles,
				(action, testFile) => {
					beforeEachFile(testFile)
					return mutateAction(action, () => {
						const absoluteLocation = nodepath.resolve(location, testFile)
						const fileExports = require(absoluteLocation) // eslint-disable-line import/no-dynamic-require
						if ("default" in fileExports === false) {
							return failed("missing default export")
						}
						const defaultExport = fileExports.default
						if (typeof defaultExport !== "function") {
							return failed("file export default must be a function")
						}
						return defaultExport({
							beforeEach: beforeEachTest,
							afterEach: afterEachTest
						})
					}).then(
						result => afterEachFile(testFile, result, true),
						result => afterEachFile(testFile, result, false)
					)
				},
				allocatedMs
			)
	])
