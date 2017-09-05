// const url = 'http://wx1.sinaimg.cn/mw690/9d0d09abgy1fj0wcs7aewj20ij0sn12y.jpg';
const url = 'http://ww3.sinaimg.cn/large/0060lm7Tly1fj8dcbq7bcj30f0076jr7.jpg';
const picid = url.replace(/.+\/(\w{32})\.[^.]+$/gm, '$1');
const hash = picid.substr(0, 8);
console.log(hash);
const dict = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
let out = 0;
const radix = hash.startsWith('00') ? 62 : 16;
for (let i = 0; i < hash.length; i++) {
  out += dict.indexOf(hash.substr(i, 1)) * Math.pow(radix, hash.length - i - 1);
}
console.log(out);
console.log(`http://weibo.com/u/${out}`);
