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
                    .replace(new RegExp("<[^>]*>", ''))
                    .replace(new RegExp("<[^>]*>", ''))
                    .replace("-", "")
}

function filterChars(word){
    
    let charArr = ['&', '(', ')', ',', '<', '>', ';', '!', "\\n", '“', '’', '”', '='];
    var res = true;
    charArr.forEach(c=> res = res && word.indexOf(c) <0 );
    return res;
}

function filterWordsStartingWithNumbers(word){
    return !(word[0] >='0' && word[0] <='9')
}

module.exports = {
    removeStopWords,
    filterChars,
    filterWordsStartingWithNumbers
}