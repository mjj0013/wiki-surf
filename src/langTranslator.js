//https://cloud.google.com/translate/docs/basic/translating-text
const {translate} = require('bing-translate-api');



var langAbbrevs = {
    "German": "de",
    "Hebrew":"he",
    "English":"en",
    "Italian":"it",
    "Japanese":"ja",
    "Chinese":"zh",
    "French":"fr",
    "Greek":"el",
    "Korean":"ko",
    "Latin":"la",
    "Polish":"pl",
    "Russian":"ru",
    "Sanskrit":"sa"
}


function translateText(text, target) {

    translate(text, null, target, true)
    .then(result=> {
        console.log("translate result:  ", result)
    })
}

module.exports = {
    translateText: translateText,
    langAbbrevs:langAbbrevs
}