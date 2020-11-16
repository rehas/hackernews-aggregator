const ax = require('axios')
const {removeStopWords}  = require("./utils")
const {getLatest, getItemUrl} = require("./hackernewsapi-utils")

async function getLatestComments(idList){
    let result = []
    console.log(idList);

    idList.slice(0, 10).forEach(element => {
        result.push(ax.get(`${getItemUrl}${element}.json`))
    });

    return Promise.all(result)
}


async function processHistorical(){
    let responseData = await getLatest();
    let latest500 = responseData.data;

    let commentsData = await getLatestComments(latest500)

    console.log(commentsData.map(x=> x.data))

}

module.exports = {
    processHistorical
}