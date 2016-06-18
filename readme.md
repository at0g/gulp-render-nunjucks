# gulp-render-nunjucks

A gulp plugin to render nunjucks templates with the following features:

- Render each nunjucks template from `gulp.src`, optionally with `gulp-data` and/or a shared data context
- Template `file.data` (via gulp-data) through one (or more) templates to create multiple outputs
- Use your preferred nunjucks version (1.x peer dependency) 
- 100% code coverage with a full suite of tests


## installation

`npm install gulp-render-nunjucks --save-dev`

While not required, `gulp-data` and `gulp-rename` are very useful with this plugin.

`npm install gulp-data gulp-rename --save-dev`


## api

```
// Render gulp.src as nunjucks template(s).
// Use "render" when each source file is a nunjucks template.
// A simple use-case is to render a static site using nunjucks features such
// as include, extends etc.
require('gulp-render-nunjucks').render( [data] );
```

```
// Render template.njk for each file in gulp.src
// Use "template" to pass the source files as data to the template.
// A simple use case is a gulp.src of json, where each file should be rendered using the same
// template.
require('gulp-render-nunjucks').template('template.njk')
```


## usage

### render([data])

**gulpfile.js**

```
var rename = require('gulp-rename');
var njk = require('gulp-render-nunjucks');

gulp.task('html', function(){
    return gulp.src(['tpl1.njk', 'tpl2.njk'])
        .pipe(njk.render())
        .pipe(rename({ extname: '.html' })
        .pipe(gulp.dest('dest'));
});
```

**output**
```
dest/tpl1.html
dest/tpl2.html
```

### template('template-name.njk')

**gulpfile.js**
```
var data        = require('gulp-data');
var rename      = require('gulp-rename');
var requireNew  = require('require-new');
var njk         = require('gulp-render-nunjucks');

gulp.task('html', function(){
    return gulp.src(['data/foo.js', 'data/bar.json'], { base: 'data', read: false })
        .pipe(data(function (file) {
            return requireNew(file.path);
        }))
        .pipe(njk.template('foobar.njk'))
        .pipe(rename({ extname: '.html' })
        .pipe(gulp.dest('dest'));
});
```
**output**
```
dest/foo.html
dest/bar.html
```

### template(function(file){...})
**gulpfile.js**
```
var data        = require('gulp-data');
var rename      = require('gulp-rename');
var requireNew  = require('require-new');
var njk        = require('gulp-render-nunjucks');

gulp.task('html', function () {
    return gulp.src(['data/foo.js', 'data/bar.json'], { base: 'data', read: false })
        .pipe(data(function (file) {
            return requireNew(file.path);
        }))
        .pipe(njk.template(function (file) {
            if(file.relative === 'foo.js'){
                return 'preview.njk';
            }
            return 'feature.njk';
        }))
        .pipe(rename({ extname: '.html' })
        .pipe(gulp.dest('dest'));
});
```

**output**
```
dest/foo.html   // rendered using preview.njk
dest/bar.html   // rendered using feature.njk
```

## notes

If using gulp-data and passing a data context to render(), a merged context will be passed to the template.
When merging the data, keys from `file.data` (from `gulp-data`) will overwrite the default data context passed to  render().
  
For example:

**gulpfile.js**
```
var data = require('gulp-data');
var rename = require('gulp-rename');
var njk = require('gulp-render-nunjucks');

gulp.task('html', function () {
    return gulp.src(['tpl1.njk', 'tpl2.njk'])
        .pipe(data(function (file) {
            return {
                // 1. 'message' will not be overwritten when data is merged  
                message: 'hello from ' + file.relative
            }
        }))
        // 2. 'message' will be overwritten with the value from gulp-data.
        .pipe(njk.render({ message: 'hello'))
        .pipe(rename({ extname: '.html' })
        .pipe(gulp.dest('dest'));
});
```

**output**
```
dest/tpl1.html  // message = 'hello from tpl1.html'
dest/tpl2.html  // message = 'hello from tpl2.html'
```


## tests

`npm test` (or `mocha`) - Runs all tests
`npm run coverage` - Check code coverage