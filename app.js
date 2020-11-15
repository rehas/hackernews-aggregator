const Koa = require('koa');
const Router = require('@koa/router');
const {getLatest250, getTitles, processRecent}  = require('./recent-helper');

const app = module.exports = new Koa();
const router = new Router();

const port = 3000;

router.get('/recent', async (ctx, next)=>{

    let result = await processRecent();

    ctx.body = result;
});

app
.use(router.routes())
.use(router.allowedMethods());

if (!module.parent) {
    app.listen(port);
    console.log(`Listening on port: ${port}`)
}