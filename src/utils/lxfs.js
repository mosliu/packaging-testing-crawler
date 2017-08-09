const fs = require('fs');
const path = require('path');

// const targetDir = 'path/to/dir';

/**
 * mkdir -p 
 * 
 * @param {any} dir 
 */
function mkdirP(dir) {
  const targetDir = path.normalize(dir);
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(parentDir, childDir);
    if (!fs.existsSync(curDir)) {
      fs.mkdirSync(curDir);
    }

    return curDir;
  }, initDir);
}


/**
 * first: mkdir -p path/to/dir 
 * second: touch path/to/dir/filename
 * 
 * @param {any} filepath 'path/to/dir/filename';
 */
function createFile(filepath) {
  const operatefile = path.normalize(filepath);
  const dir = path.dirname(operatefile);
  mkdirP(dir);
  fs.closeSync(fs.openSync(operatefile, 'a'));
}

module.exports = {
  mkdirP,
  createFile,
};
