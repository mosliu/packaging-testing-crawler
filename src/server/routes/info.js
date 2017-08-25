const router = require('koa-router')();
const eebug = require('debug')('info_show');
const myDb = require('../../db');
const CONSTS = require('../../CONSTS');


router.get('/', async (ctx, next) => {
  const freshNews = await myDb.findAll({
    where: {
      bodytype: {
        $or: [CONSTS.INFOTYPE.NEWS, CONSTS.INFOTYPE.SUPPORTSHOW],
      },
      analyzed: true,
      updatedAt: {
        $gt: Date.now() - 1000 * 60 * 60 * 24 * 7,
      },
    },
  });

  // const products = freshNews.map(
  //   ele => ({
  //     id: ele.id,
  //     url: ele.url,
  //     title: ele.bodytitle || ele.title,
  //     websiteflag: ele.websiteflag,
  //   }),
  // );
  await ctx.render('info/home', {
    freshNews,
  });
});

router.get('/product', async (ctx, next) => {
  await ctx.render('info/products_main', {
  });
});
router.post('/product', async (ctx, next) => {
  const key = ctx.request.body.key || '';
  const url = encodeURI(`product/${key}`);
  ctx.response.redirect(url);
  // next(`info/product/${key}`);
  // await ctx.render('info/products_main', {
  // });
});

router.get('/product/:name', async (ctx, next) => {
  const name = ctx.params.name;
  const allProduct = await myDb.findAll({
    where: {
      bodytype: CONSTS.INFOTYPE.PRODUCT,
      analyzedbody: {
        $like: `%${name}%`,
      },
    },
  });
  const objs = allProduct.map(
    ele => ({
      id: ele.id,
      url: ele.url,
      title: ele.bodytitle || ele.title,
      websiteflag: ele.websiteflag,
    }),
  );
  await ctx.render('info/products', {
    keyword: name,
    objs,
  });
});

router.get('/news', async (ctx, next) => {
  await ctx.render('info/news_main', {
  });
});
router.post('/news', async (ctx, next) => {
  const key = ctx.request.body.key || '';
  const url = encodeURI(`news/${key}`);
  ctx.response.redirect(url);
  // next(`info/product/${key}`);
  // await ctx.render('info/products_main', {
  // });
});
router.get('/news/:name', async (ctx, next) => {
  const name = ctx.params.name;
  const allNews = await myDb.findAll({
    where: {
      bodytype: {
        $or: [CONSTS.INFOTYPE.NEWS, CONSTS.INFOTYPE.SUPPORTSHOW],
      },
      analyzedbody: {
        $like: `%${name}%`,
      },
    },
    order: [
      ['bodydate', 'DESC'],
      ['id'],
    ],
  });
  const objs = allNews.map(
    ele => ({
      id: ele.id,
      url: ele.url,
      title: ele.bodytitle || ele.title,
      websiteflag: ele.websiteflag,
      bodydate: ele.bodydate,
    }),
  );
  await ctx.render('info/news', {
    keyword: name,
    objs,
  });
});

module.exports = router;
