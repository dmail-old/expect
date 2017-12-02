I'm planning to make the following changes :

More match helpers

* returnMatch(...matchers) Expects actual to be a function and apply matchers to its returned value
* aValueMatch(...matchers) expect a value inside actual to match. will use
	Object.values(actual).some(value => matchAll(...matchers)(value))
* matchAny(...matchers) expect actual to match anyOf matchers
* matchOne(...matchers) expect actual to match exactly one matchers
* rename matchAll, matchAny, matchOne into matchAllOf, matchAnyOf, matchOneOf ?

More matchers

* anyIterable() Check actual got the Symbol.iterator: it will use updated propertiesMatching passing
	{ [Symbol.iterator]: any() }
* valuesAreUnique() expect actual to be an object, array or function with unique values,
	valuesAreUnique()([true, true]), valuesAreUnique()([true, false])
* anyInteger()
* anyFloat()
* multipleOf(number)
* divisibleBy(number)
* decimalLengthMatch(...matchers) Not even sure it makes sense but it would read decimal count from
	0.001 and returns 3 and apply matchers on this value
* pattern(regexp) Expects String(actual) to match the regexp
* occurenceCountMatch(substring, ...matchers) Count how many times substring is present in actual
	and apply matchers on it
* anyStringContaining(substring) helper around occurenceCountMatching(substring, anyNumberAbove(0))
* anyStringStartingWith(substring)
* anyStringEndingWith(substring)
