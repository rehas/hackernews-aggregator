const ax = require('axios')
const {removeStopWords}  = require("./utils")
const {getLatest, getItemUrl} = require("./hackernewsapi-utils")


let checkedTitles = {};
let titleWordCounts = {};

function getTitles(idList){
    let result = []
    const idsNotInCache = idList.filter(x=> !checkedTitles[x])
    console.log(`${idsNotInCache.length} new items arrived`);
    const l = idsNotInCache.length;

    for (let i = 0; i < 5; i++) {
        let t = idsNotInCache.slice(i*(l/5), (i+1)*(l/5) ).map(x=> {
            return ax.get(`${getItemUrl}${x}.json`);
        });
        result = [...result, ...t]
    }
    
    return Promise.all(result);
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
        x[key].split(' ').forEach(element => {
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
}

module.exports = {
    getTitles,
    processRecent
}