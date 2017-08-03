function test(a, b = 'u') {
  console.log(b);
}

test(3, 4);
test(3);
test(3, null);
