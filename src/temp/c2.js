const a = { a: 'dd', b: ['aa', 'bb', 'cc'] };
const b = [...a.b];

console.log(a);
console.log(b);
b.shift();
console.log(a);
console.log(b);
