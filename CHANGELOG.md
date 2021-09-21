# Changelog

### [6.0.3](https://www.github.com/cheminfo/well-plates/compare/v6.0.2...v6.0.3) (2021-09-21)


### Bug Fixes

* make sure formatted position becomes normalized when passed a string as input ([394ab4e](https://www.github.com/cheminfo/well-plates/commit/394ab4e19cf1cac4dbf8a874716b435f77e004d0))

### [6.0.2](https://www.github.com/cheminfo/well-plates/compare/v6.0.1...v6.0.2) (2021-09-01)


### Bug Fixes

* use ES2020 target ([79e124a](https://www.github.com/cheminfo/well-plates/commit/79e124a8dc016509d3b89b043630855243e3b71e))

### [6.0.1](https://www.github.com/cheminfo/well-plates/compare/v6.0.0...v6.0.1) (2021-08-11)


### Bug Fixes

* correct peer dependency issue ([e4157ae](https://www.github.com/cheminfo/well-plates/commit/e4157aeb26892607a30b19c75d31f6675731c6ce))
* throw error if sequential well plate receives non-integer ([117e00a](https://www.github.com/cheminfo/well-plates/commit/117e00aea16e4da7a7c60000fd4b038cd903d395))

## [6.0.0](https://www.github.com/cheminfo/well-plates/compare/v5.0.0...v6.0.0) (2021-03-22)


### ⚠ BREAKING CHANGES

* SubsetMode option names have changed

### Features

* improve typing for setData and getData ([e83d80a](https://www.github.com/cheminfo/well-plates/commit/e83d80adb362cba261a10c6cd3309a51254a5edb))
* rename SubsetMode options ([0424241](https://www.github.com/cheminfo/well-plates/commit/042424110162b9f001c6e08d47983e8bca606276))

## [5.0.0](https://www.github.com/cheminfo/well-plates/compare/v4.1.1...v5.0.0) (2021-03-11)


### ⚠ BREAKING CHANGES

* remove getTransposedIndex and rename IPosition to RowColumnPosition
* getPositionCodeRange and getPositionCodeZone no longer exist and are replaced by getPositionSubset
* getIndex and getPositionCode no longer exist and getPosition takes an additional parameter to choose the output encoding
* getIndex now returns a result that depends on the iterationOrder property, and position passed by index in methods are also interpreted based on the iteration order

### Features

* apply iterationOrder to how indices are calculated ([ebf1e39](https://www.github.com/cheminfo/well-plates/commit/ebf1e39796746ca41502b67bb402f55fcad4ebbe)), closes [#8](https://www.github.com/cheminfo/well-plates/issues/8)
* make size a public readonly property ([609db4b](https://www.github.com/cheminfo/well-plates/commit/609db4b230d25d93b2c6ed314dbaea74e15728fa))
* remove getTransposedIndex ([d11432d](https://www.github.com/cheminfo/well-plates/commit/d11432d42b71bb5170c6a075fdd2f07393ef7c3d)), closes [#10](https://www.github.com/cheminfo/well-plates/issues/10)
* unify getPosition, getIndex and getPositionCode into one method ([cd241ac](https://www.github.com/cheminfo/well-plates/commit/cd241acf327d51f22b289959ae9f0d16c9968572))
* unify getPositionCodeRange and getPositionCodeZone into one new method getPositionSubset ([d6831fe](https://www.github.com/cheminfo/well-plates/commit/d6831fe57a4a60e3a3b9c75834053a9ebcee4623))

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
