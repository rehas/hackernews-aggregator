const ax = require('axios')
const {removeStopWords, filterChars}  = require("./utils")
const {getLatest, getLatestItemUrls,getItemUrl} = require("./hackernewsapi-utils")

const PromisePool = require('@supercharge/promise-pool');


let checkedTitles = {};
let titleWordCounts = {};

async function getTitles(idList){
    let result = []
    const idsNotInCache = idList.filter(x=> !checkedTitles[x])
    console.log(`${idsNotInCache.length} new items arrived`);
    const l = idsNotInCache.length;
    
    // for (let i = 0; i < 5; i++) {
    //     let t = idsNotInCache.slice(i*(l/5), (i+1)*(l/5) ).map(x=> {
    //         return ax.get(`${getItemUrl}${x}.json`);
    //     });
    //     result = [...result, ...t]
    // }

    let urls = idsNotInCache.map(x=> `${getItemUrl}${x}.json`)

    const { results, errors } = await PromisePool
    .for(urls)
    .withConcurrency(10)
    .process(async data => {
        // console.log(data);
        let result = await ax.get(data);
        
        return result 
    })
    console.log(errors);
    return results;

    
    // return Promise.all(result);
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
        x[key].split(' ').filter(w=> filterChars(w)).forEach(element => {
            frequencyMap[element] = (frequencyMap[element] || 0) +1;
        });
        checkedTitles[key] = frequencyMap
    })
}

function udpateWordCounts(newTitles){
    newTitles.forEach(title=> {
        console.log("new title coming")
        console.log(title)
        let titleId = Object.keys(title)[0]
        if (!checkedTitles[titleId]){
            return;
        }
        Object.keys(checkedTitles[titleId]).forEach(k=>{
            // console.log(k)
            titleWordCounts[k] = (titleWordCounts[k] || 0) + checkedTitles[titleId][k]
        })
    })
}

function getTopPopularWords(titleWordCounts, top){
    let result = []
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
        
        console.log(latest250.length)
        let titlesReponseData = await getTitles(latest250);
        console.log(titlesReponseData);
        let titles = sanitizeTitles(titlesReponseData);
        console.log(titles)
        updateCheckedTitles(titles);
        
        udpateWordCounts(titles);
        
        let resultArray =  getTopPopularWords(titleWordCounts, 25);
        
        let result = {}
        
        resultArray.forEach(x=>{
            result[x[0]] = x[1]
        });
        console.log("TITLES", titles.length)
        console.log("Result", result.length)
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