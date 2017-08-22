const router = require('koa-router')();

router.get('/', async (ctx, next) => {
  await ctx.render('layouts/blog', {
    title: 'Hello Koa 2!',
  });
});

router.get('/test/:name', async (ctx, next) => {
  const name = ctx.params.name;
  await ctx.render(`layouts/${name}`, {
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
