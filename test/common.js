var chai = require('chai');

chai.use(require('sinon-chai'));

global.should = chai.should();
global.sinon = require('sinon');


global.gutil = require('gulp-util');
global.nunjucks = require('nunjucks');