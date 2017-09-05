const router = require('koa-router')();
const debug = require('debug')('info_show');
const myDb = require('../../db');
const CONSTS = require('../../CONSTS');

function IsNum(s) {
  if (s != null && s !== '') {
    return !isNaN(s);
  }
  return false;
}


async function render(ctx, page, obj) {
  obj.prefix = '';
  await ctx.render(page, obj);
}

async function getRecentNews(days) {
  const start = new Date();
  let d = 1;
  if (IsNum(days)) {
    d = parseInt(days, 10);
  }
  const freshNews = await myDb.findAll({
    where: {
      bodytype: {
        $or: [CONSTS.INFOTYPE.NEWS, CONSTS.INFOTYPE.SUPPORTSHOW],
      },
      analyzed: true,
      updatedAt: {
        $gt: Date.now() - (1000 * 60 * 60 * 24 * d),
      },
    },
  });
  const ms = new Date() - start;
  console.log(`time consume is ${ms} ms`);
  return freshNews;
}

async function getRecentProducts(days) {
  let d = 1;
  if (IsNum(days)) {
    d = parseInt(days, 10);
  }
  const freshNews = await myDb.findAll({
    where: {
      bodytype: {
        $or: [CONSTS.INFOTYPE.PRODUCT],
      },
      analyzed: true,
      updatedAt: {
        $gt: Date.now() - (1000 * 60 * 60 * 24 * d),
      },
    },
  });
  return freshNews;
}


router.get('/', async (ctx, next) => {
  const freshNews = await getRecentNews(1);
  const freshPros = await getRecentProducts(1);
  // await ctx.render('info/home', {
  //   freshNews, freshPros,
  // });
  await render(ctx, 'info/home', {
    freshNews, freshPros,
  });
});

router.get('/recent/:days', async (ctx, next) => {
  const days = ctx.params.days;
  const freshNews = await getRecentNews(days);
  const freshPros = await getRecentProducts(days);
  await ctx.render('info/home', {
    freshNews, freshPros,
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
