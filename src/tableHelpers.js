var isEntity = /^([a-z\-\xC0-\xF6\xF8-\xFF\xB5\xAE\x99]+)((\s*)([a-z\-\xC0-\xF6\xF8-\xFF]))*$/i
var isNumber = /^([0-9,\.]+)$/gi
var isPlusMinusNumber = /^\xB1([0-9,\.]+)$/gi
var isPercent = /^([0-9,\.]+)(\s*)\%$/gi
var isPercentVar = /^([0-9,\.]+)(\s*)\%(\s*)([a-z]+)$/gi
var isDollarPrice = /^\$(\s*)([0-9,\.]+)$/gi
var isDollarRange = /^\$(\s*)([0-9,\.]+)(\s*)(\-)+(\s*)(\$*)(\s*)([0-9,\.]+)$/i

var isAngleDegree = /^([0-9,\.]+)(\s*)°((?!.*F|C|K)+)$/gi
var isTempDegree = /^([0-9,\.]+)(\s*)°(\s*)(F|C|K+)$/gi

// use hex column for values at https://www.meridianoutpost.com/resources/articles/ASCII-Extended-Code-reference-chart.php
var isYenPrice = /^\xA5(\s*)([0-9,\.]+)$/gi
var isEuroPrice = /^\x80(\s*)([0-9,\.]+)$/gi
var isPoundPrice = /^\xA3(\s*)([0-9,\.]+)$/gi
var phoneNumTest = /^(?:\d{3}|\(\d{3}\))([-\/\.])\d{3}\1\d{4}$/;

var isNumberMoreThan = /^\$(\s*)([0-9,\.]+)(\s*)(\+|\>)+(\s*)$/i
var isNumberLessThan = /^\$(\s*)([0-9,\.]+)(\s*)(\-|\<)+(\s*)$/i
var isNumberRangeDash = /^([0-9,\.]+)(\s*)(\-)+(\s*)([0-9,\.]+)$/
var isNumberRangeVar = /^([0-9,\.]+)(\s*)(\<|\>)+(\s*)([a-z]+)(\s*)(\<|\>)+(\s*)([0-9,\.]+)$/
var isNumberWithUnit = /^([0-9]+)(\s*)([a-z\xB5]+)(\.*)(\s*)$/i


module.exports ={
    isEntity:isEntity,
    isNumber:isNumber,
    isPlusMinusNumber:isPlusMinusNumber,
    isPercent:isPercent,
    isPercentVar:isPercentVar,
    isDollarPrice:isDollarPrice,
    isDollarRange:isDollarRange,
    isAngleDegree:isAngleDegree,
    isTempDegree:isTempDegree,


    isYenPrice:isYenPrice,
    isEuroPrice:isEuroPrice,
    isPoundPrice:isPoundPrice,
    phoneNumTest:phoneNumTest,
    isNumberMoreThan:isNumberMoreThan,
    isNumberLessThan:isNumberLessThan,
    isNumberRangeDash:isNumberRangeDash,
    isNumberRangeVar:isNumberRangeVar,
    isNumberWithUnit:isNumberWithUnit,

}