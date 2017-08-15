let kk = '0';

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.arr = [];
  }

  set kk(value) {
    kk = value;
  }

  get kk() {
    return kk;
  }

  add(a) {
    console.log('==============');
    console.log(`before:${this.arr}`);
    addary.call(this, a);
    console.log(`after:${this.arr}`);
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

function addary(value) {
  this.arr.push(value);
}
module.exports = Point;
