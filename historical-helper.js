const ax = require('axios')
const {removeStopWords}  = require("./utils")
const { getMaxId, getItemUrl} = require("./hackernewsapi-utils")


let latestCommentsChecked = {};
let latestMaxId = 0;

function getLatestN(start, count){
    res = []
    for (let i = start; i > start - count; i--) {
        res.push(ax.get(`${getItemUrl}${i}.json`))     
    }
    return res;
}

function updateLatestComments(newMaxId, maxConcurrency, totalNumber){
    if (newMaxId <= latestMaxId){
        return;
    }
    const result = []
    const total = Math.min((newMaxId - latestMaxId), totalNumber);
    
    const numberOfBatches = total / maxConcurrency;
    
    console.log(total)
    console.log(numberOfBatches)
    console.log(newMaxId)
    
    for (let b = 0; b < numberOfBatches; b++) {
        const latestReponseData = getLatestN(newMaxId, maxConcurrency);//.catch( e => { console.error("Error on GetLatestN") });
        console.log(latestReponseData.length);
        result.push(latestReponseData);
    }
    console.log(result.length);
    return result;
}

async function resolveReponses(responseData){
    let res = [] 
    console.log("latestReponseData");
    // console.log(responseData);
    
    let batchedPromises = responseData.map(async x=> await Promise.all(x))
    
    console.log(batchedPromises);
    
    
    // for (const currentBatch of batchedPromises){
    //     console.log(currentBatch);
    
    //     currentBatch.then(a=> {
    //         res.push(...a);
    //     }).catch(err=>{
    //         console.log("some error happened in this batch");
    //     })
    
    //     // res.push(...currentBatch);
    // }
    
    for (let index = 0; index < batchedPromises.length; index++) {
        try {
            const element = await batchedPromises[index];
            res.push(element);
        } catch (error) {
            console.log("some error happened in this batch");
        }
        
    }
    
    
    // let normalizedPromises =  batchedPromises.map(async x=>  x);
    
    
    let res2 = res.filter(c=> c.data && c.data.type == 'comment')
    .map(a=> {
        return a.data;
    });
    console.log(`resolveResponsesResult : ${res2.length}`);
    return res2;
}
const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e-6

async function processHistorical(){
    try {
        let res = []
        const time = process.hrtime();
        const maxIdResponse = await getMaxId().catch( e => { console.error("Error on GetMaxId") });
        let diff = process.hrtime(time);
        console.log(`Benchmark took ${ (diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS } milliseconds`);
        
        let currentMaxId = maxIdResponse && maxIdResponse.data || 25000000;
        
        const maxConcurrency = 50;
        const numberOfItemsToCheck = 1000;
        let responseData = updateLatestComments(currentMaxId, maxConcurrency, numberOfItemsToCheck);
        
        diff = process.hrtime(time);
        console.log(`updateLatestComments took ${ (diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS } milliseconds`);
        
        let commentsData = await resolveReponses(responseData).catch( e => { console.error("Error on resolve responses") });
        res = commentsData;
        
        diff = process.hrtime(time);
        console.log(`resolveReponses took ${ (diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS } milliseconds`);
        
        console.log(`res.length : ${res && res.length}`);
    } catch (error) {
        console.log("Some errors have occured");        
        console.log(error);        
    }
    
}

module.exports = {
    processHistorical
}