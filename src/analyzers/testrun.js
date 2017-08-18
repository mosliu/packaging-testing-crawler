const Organizer = require('./organizer');

const app = new Organizer();
// logger
async function f4(context, next) {
  // 响应开始时间
  const start = new Date();
  // 响应间隔时间
  let ms;
  try {
    // 开始进入到下一个中间件
    ms = new Date() - start;
    console.log(`Start time ${ms} ms`);
    await next();
    ms = new Date() - start;
    console.log(`End time ${ms} ms`);
    // 记录响应日志
  } catch (error) {
    ms = new Date() - start;
    // 记录异常日志
    console.log(`Error time ${ms}`);
  }
  return 'log';
}


async function f1(context, next) {
  console.log(`f1: pre next： ${context.a}`);
  // eslint-disable-next-line
  context.a = 'foo';
  await next();
  console.log(`f1: post next: ${context.b}`);
  return 'f1';
}

async function f2(context, next) {
  console.log(`  f2: pre next：${context.a}`);
  await next();
  context.b = 'bar';
  console.log(`  f2: post next: ${context}`);
  return 'f2';
}

async function f3(context, next) {
  console.log(`    f3: pre next： ${context}`);
  await next();
  console.log(`    f3: post next: ${context}`);
  return 'f3';
}

async function fend(next) {
  await next();
}
// const f = compose([f4, f1, f2]);
// const d = compose([f4, f3]);
// const k = compose([f, d]);
// k('aaa').then(e => console.log(e));

app.use(f4);
app.use(f1);
app.use(f2);
app.use(f3);
app.analyze({ a: 'ccc' });


// f('aaa').then(d('cc'));

const href = 'http://www.gbtest.cn/zh-CN/products.html?fid=60863&proTypeID=60863&proTypeName=%E6%92%95%E8%A3%82%E5%BA%A6%E6%B5%8B%E8%AF%95%E4%BB%AA';

const url = require('url');

const a = url.parse(href);

console.dir(a)
;