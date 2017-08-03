const should = require('should');
const Tools = require('../../src/crawlers/tools');

describe('Tools', () => {
  describe('#processGotHref()', () => {
    it('should return null when crosssite accourd', () => {
      const base = 'http://baidu.com';
      const url = 'https://google.com';
      should(Tools.parseGotHref(base, url)).equal(null);
      // (1).should.equal(1);
    });
    it('should return parsed', () => {
      const base = 'http://baidu.com';
      const url = 'newsShow.asp?id=3631';
      should(Tools.parseGotHref(base, url).href).equal('http://baidu.com/newsShow.asp?id=3631');
      // (1).should.equal(1);
    });
  });
  describe('#URLfyHref()', () => {
    it('should Urlfy return null if not correct url set', () => {
      // const base = 'http://baidu.com';
      // const url = 'https://google.com';
      should(Tools.URLfyHref('12323')).equal(null);
      should(Tools.URLfyHref('asd')).equal(null);
    });
    it('should Urlfy return right Url if correct url set', () => {
      const base = 'http://baidu.com';
      should(Tools.URLfyHref(base).href).equal('http://baidu.com/');
    });
  });

  describe('#formatHref()', () => {
    it('should formatHref return null if not correct url set', () => {
      // const base = 'http://baidu.com';
      // const url = 'https://google.com';
      should(Tools.formatHref('12323')).equal(null);
      should(Tools.formatHref('asd')).equal(null);
    });
    it('should formatHref return right Url if correct url set', () => {
      const base = 'https://a:b@liuxuan.net:8080?abc=dff#foo';
      const content = Tools.formatHref(base);
      should(content).equal('https://liuxuan.net:8080/?abc=dff');
    });
  });
});
