const Koa = require('koa');
const Router = require('@koa/router');
const app = module.exports = new Koa();
const router = new Router();
const port = 3000;

router.get('/recent', (ctx, next)=>{
    ctx.response.status = 202;
    ctx.body = `Hello from Koa Router, my node version is: ${process.version}`
});

app
.use(router.routes())
.use(router.allowedMethods());

if (!module.parent) {
    app.listen(port);
    console.log(`Listening on port: ${port}`)
}