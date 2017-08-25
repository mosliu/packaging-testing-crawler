const router = require('koa-router')();

router.get('/', async (ctx, next) => {
  // await ctx.render('layouts/blog', {
  await ctx.render('index', {
    title: 'Hello Koa 2!',
  });
});

router.get('/test/:name', async (ctx, next) => {
  const name = ctx.params.name;
  await ctx.render(`demos/${name}`, {
    title: 'Hello Koa 2!',
  });
});

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string';
});

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json',
  };
});

module.exports = router;
