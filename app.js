const Koa = require('koa');
const Router = require('@koa/router');
const {processRecent}  = require('./recent-helper');
const {processHistorical}  = require('./historical-helper2')

const app = module.exports = new Koa();
const router = new Router();

const port = 3000;

router.get('/recent', async (ctx, next)=>{

    let result = await processRecent();

    ctx.body = result;
});

router.get('/historical', async (ctx, next)=>{

    let result = await processHistorical();

    ctx.body = result;
});

app
.use(router.routes())
.use(router.allowedMethods());

if (!module.parent) {
    app.listen(port);
    console.log(`Listening on port: ${port}, node version ${process.version}`)
}

