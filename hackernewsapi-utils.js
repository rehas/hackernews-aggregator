const ax = require('axios')
const newStoriesUrl = "https://hacker-news.firebaseio.com/v0/newstories.json";
const getItemUrl = "https://hacker-news.firebaseio.com/v0/item/";
const maxIdUrl = "https://hacker-news.firebaseio.com/v0/maxitem.json";

async function getLatest(){
    return await ax.get(newStoriesUrl);
}

async function getMaxId(){
    return await ax.get(maxIdUrl);
}

function getLatestItemUrls(maxIdResponse, latestMaxId, count){
    let res = []
    
    for (let index = 0; index < count; index++) {
        if((maxIdResponse - index) <= latestMaxId){
            break;
        }
        res.push(`${getItemUrl}${maxIdResponse-index}.json`);        
    }
    console.log(res.length);
    return res;
}

module.exports = {
    getLatest,
    getMaxId,
    getLatestItemUrls,
    getItemUrl
}