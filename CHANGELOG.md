# Changelog

### [4.1.1](https://github.com/cheminfo/well-plates/compare/v4.1.0...v4.1.1) (2021-01-25)


### Bug Fixes

* consistently check index in getIndex method ([b5567b4](https://github.com/cheminfo/well-plates/commit/b5567b48eae29610fc4238cec6a54b5a3a122bf4))

# [4.1.0](https://github.com/cheminfo/well-plates/compare/v4.0.0...v4.1.0) (2019-11-03)


### Features

* add getTransposedIndex and option for iteration order ([35ff1c3](https://github.com/cheminfo/well-plates/commit/35ff1c3458ffd0a194c7a6383ed33d996d9e23e9))



# [4.0.0](https://github.com/cheminfo/well-plates/compare/v3.3.3...v4.0.0) (2019-09-24)


* fix get range by column ([8903512](https://github.com/cheminfo/well-plates/commit/8903512))


### BREAKING CHANGES

* getPositionCodeRange no longer accepts a size as second argument. Instead it can accept indices as start end end argument



## [3.3.3](https://github.com/cheminfo/well-plates/compare/v3.3.2...v3.3.3) (2019-09-23)


### Bug Fixes

* remove ambiguity in return type of getPositionCodeRange ([9327f5f](https://github.com/cheminfo/well-plates/commit/9327f5f))



## [3.3.2](https://github.com/cheminfo/well-plates/compare/v3.3.1...v3.3.2) (2019-09-23)


### Bug Fixes

* fix transform of position into sequential code ([b051806](https://github.com/cheminfo/well-plates/commit/b051806))



## [3.3.1](https://github.com/cheminfo/well-plates/compare/v3.3.0...v3.3.1) (2019-09-23)



# [3.0.0](https://github.com/cheminfo/well-plates/compare/v2.0.0...v3.0.0) (2018-11-08)


* change PositionFormat enum to be a string ([ed40f5b](https://github.com/cheminfo/well-plates/commit/ed40f5b))


### BREAKING CHANGES

* positionFormat of the WellPlate class was a number and becomes a string



<a name="2.0.0"></a>
# [2.0.0](https://github.com/cheminfo/well-plates/compare/v1.1.0...v2.0.0) (2018-11-02)


### Features

* add getData and setData methods to WellPlate ([4d9518f](https://github.com/cheminfo/well-plates/commit/4d9518f))
* add iterator ([cf92309](https://github.com/cheminfo/well-plates/commit/cf92309))
* simplify constructor with config object ([6d7f103](https://github.com/cheminfo/well-plates/commit/6d7f103))


### BREAKING CHANGES

* There is now only one constructor overload, accepting a
config object.



<a name="1.0.0"></a>
# 1.0.0 (2018-08-26)



