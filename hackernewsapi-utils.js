const ax = require('axios')
const newStoriesUrl = "https://hacker-news.firebaseio.com/v0/newstories.json";
const getItemUrl = "https://hacker-news.firebaseio.com/v0/item/";


async function getLatest(){
    return await ax.get(newStoriesUrl);
}

module.exports = {
    getLatest,
    getItemUrl
}