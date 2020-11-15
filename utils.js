const sw = require('stopword');
const {customStopWordsList} = require("./stopWordsList");

function removeStopWords(inputString){
    return sw
            .removeStopwords(
                inputString.split(' ').filter(x=> x.length > 1),
                [...sw.en, ...customStopWordsList]
                ).join(' ')
                    .replace(new RegExp('[#"?%.$:\\-\']', "gi"), '')
                    .replace(new RegExp("\\b\d+\\b", "gi"), '')
                    .replace("-", "")
}

module.exports = {
    removeStopWords
}