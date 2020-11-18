const ax = require('axios')
const {removeStopWords, filterChars, filterWordsStartingWithNumbers}  = require("../utils/utils")
const { getMaxId,getLatestItemUrls ,getItemUrl} = require("../utils/hackernewsapi-utils")

const PromisePool = require('@supercharge/promise-pool');

let checkedComments = {};
let latestMaxId = 0;
let commentWordCounts = {}

async function getComments(maxIdResponse, latestMaxId, count){
    let res = getLatestItemUrls(maxIdResponse, latestMaxId, count);
    
    const { results, errors } = await PromisePool
    .for(res)
    .withConcurrency(10)
    .process(async data => {
        let result = await ax.get(data);
        
        return result.data 
    })
    if(errors.length > 0){
        console.log("Error on getComments(maxIdResponse, latestMaxId, count)")
        console.log(errors);
    }
    return results;
}


function updateCheckedComments(comments){
    comments.forEach(x=>{
        const key = Object.keys(x)[0];
        const frequencyMap = {}
        x[key].split(' ')
            .filter(w=> filterChars(w))
            .filter(w=> filterWordsStartingWithNumbers(w))
            .forEach(element => {
                frequencyMap[element] = (frequencyMap[element] || 0) +1;
        });
        checkedComments[key] = frequencyMap
    })
}

function udpateWordCounts(newComments){
    newComments.forEach(comment=> {
        let commentId = Object.keys(comment)[0]
        Object.keys(checkedComments[commentId]).forEach(k=>{
            commentWordCounts[k] = (commentWordCounts[k] || 0) + checkedComments[commentId][k];
        })
    })
}

function getTopPopularWords(commentWordCounts, top){
    let result = []
    Object.keys(commentWordCounts).forEach(x=>{
        result.push([x, commentWordCounts[x]])
    })
    return result.sort((a,b) => b[1] - a[1]).slice(0,top);
}


async function processHistorical(){
    try {
        const maxIdResponse = await getMaxId().catch( e => { console.error("Error on GetMaxId") });
        
        let currentMaxId = maxIdResponse && maxIdResponse.data || 25000000;
        
        const numberOfItemsToCheck = 100;

        let commentList = await getComments(currentMaxId, latestMaxId, numberOfItemsToCheck);
        
        latestMaxId = currentMaxId;
        
        let commentTexts = commentList.filter(x=> x && x.text && x.type == 'comment').map(x=>{
            let id = x.id;
            let text = removeStopWords( x.text.toLowerCase());
            return {[id]: text}
        });
        
        updateCheckedComments(commentTexts);
        
        udpateWordCounts(commentTexts);
        
        let resultArray = getTopPopularWords(commentWordCounts, 25);
        
        let result = {};
        
        resultArray.forEach(x=>{
            result[x[0]] = x[1];
        });
      
        return result;
    } catch (error) {
        console.log("Some errors have occured");        
        console.log(error);        
    }
}

module.exports = {
    processHistorical
}