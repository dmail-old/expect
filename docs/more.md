I'm planning to make the following changes :

* propertiesMatching() will now accept to be called on null, undefined, true, false and will
	accordingly tests properties of thoose values. For null and undefined it will just say "hey they
	canot have property at all". For other primitives they will just say the primitive is missing the
	property or it does not match. propertiesMatching now accepts a property to be available in the
	prototype chain. It means if property exists on the prototype chain it's not missing. It means
	we'll recursively use Object.getPrototypeOf() on primitives and use in operator for objects when
	checking property presence.

More match helpers

* returnMatching(...matchers) Expects actual to be a function and apply matchers to its returned
	value
* aValueMatching(...matchers) expect a value inside actual to match. will use
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
* decimalLengthMatching(...matchers) Not even sure it makes sense but it would read decimal count
	from 0.001 and returns 3 and apply matchers on this value
* pattern(regexp) Expects String(actual) to match the regexp
* partCountMatching(substring, ...matchers) Count how many times substring is present in actual and
	apply matchers on it
* anyStringContaining(substring) helper around partCountMatching(substring, anyNumberAbove(0))
* anyStringStartingWith(substring)
* anyStringEndingWith(substring)
