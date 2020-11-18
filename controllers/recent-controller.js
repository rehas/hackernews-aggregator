const ax = require('axios')
const {removeStopWords, filterChars, filterWordsStartingWithNumbers}  = require("../utils/utils");
const {getLatest, getLatestItemUrls,getItemUrls ,getItemUrl} = require("../utils/hackernewsapi-utils");

const PromisePool = require('@supercharge/promise-pool');


let checkedTitles = {};
let titleWordCounts = {};

async function getTitles(idList){
    const idsNotInCache = idList.filter(x=> !checkedTitles[x])
    console.log(`${idsNotInCache.length} new items arrived`);
    
    let urls = getItemUrls(idsNotInCache);

    const { results, errors } = await PromisePool
    .for(urls)
    .withConcurrency(10)
    .process(async data => {
        let result = await ax.get(data);
        return result 
    });

    if(errors.length > 0){
        console.log("Errors on getTitles(idList)");
        console.log(errors);
    }
    return results;
}

function sanitizeTitles(titlesReponseData){
    
    return titlesReponseData.map(x=> {
        let id = x.data && x.data.id;
        let title = x.data && removeStopWords(x.data.title.toLowerCase())
        return {
            [id] : title
        }
    });
}

function updateCheckedTitles(titles){
    titles.forEach(x=>{
        const key = Object.keys(x)[0];
        const frequencyMap = {}
        if (!x[key]){
            return;
        }
        x[key].split(' ')
            .filter(w=> filterChars(w))
            .filter(w=> filterWordsStartingWithNumbers(w))
            .forEach(element => {
                frequencyMap[element] = (frequencyMap[element] || 0) +1;
        });
        checkedTitles[key] = frequencyMap
    })
}

function udpateWordCounts(newTitles){
    newTitles.forEach(title=> {
        let titleId = Object.keys(title)[0]
        if (!checkedTitles[titleId]){
            return;
        }
        Object.keys(checkedTitles[titleId]).forEach(k=>{
            titleWordCounts[k] = (titleWordCounts[k] || 0) + checkedTitles[titleId][k];
        })
    })
}

function getTopPopularWords(titleWordCounts, top){
    let result = [];
    Object.keys(titleWordCounts).forEach(x=>{
        result.push([x, titleWordCounts[x]])
    })
    // console.log(result)
    return result.sort((a,b) => b[1] - a[1]).slice(0,top);
}

async function processRecent(){
    try {
        let responseData = await getLatest();
        let latest250 = responseData.data.slice(0, 250)
        
        let titlesReponseData = await getTitles(latest250);

        let titles = sanitizeTitles(titlesReponseData);

        updateCheckedTitles(titles);
        
        udpateWordCounts(titles);
        
        let resultArray =  getTopPopularWords(titleWordCounts, 25);
        
        let result = {}
        
        resultArray.forEach(x=>{
            result[x[0]] = x[1]
        });
        console.log("TITLES", titles.length)
        console.log("CHECKEDTITLES", Object.keys( checkedTitles).length)
        return result;
    } catch (error) {
        console.log("Error on recent");
        console.log(error);        
    }
}

module.exports = {
    getTitles,
    processRecent
}