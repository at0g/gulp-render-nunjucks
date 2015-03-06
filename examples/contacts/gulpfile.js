var gulp        = require('gulp'),
    connect     = require('gulp-connect'),
    data        = require('gulp-data'),
    del         = require('del'),
    es          = require('event-stream'),
    fs          = require('fs'),
    nunjucks    = require('nunjucks'),
    nunj        = require('gulp-render-nunjucks'),
    path        = require('path'),
    rename      = require('gulp-rename'),
    requireNew  = require('require-new')
;


// configure nunjucks environment
nunjucks.configure('./src/templates');


function requireFileAsData(file){
    // "require" the file with require-new, so that changes to the file are not cached during watch
    return requireNew(file.path);
}


function requireAllContacts(file, done){
    var targetDir = './src/data/contacts';
    var mapContact = function(file){
        var data = requireNew(targetDir + '/' + file);
        data.url = '/contacts/' + path.basename( file, path.extname(file)) + '/';
        return data;
    };

    fs.readdir(targetDir, function(err, files){
        done(err, { contacts: files.map(mapContact)});
    });
}



gulp.task('clean', function(cb){
    del('build', cb);
});

gulp.task('html', ['clean'], function(){

    // Select each contact data file
    var contactsStream = gulp.src('src/data/contacts/**/*', { base: 'src/data', read: false })
        .pipe( data(requireFileAsData) )
        // render each data object using the contact.nunj template
        .pipe( nunj.template('contact.nunj') )
        // rename the file: harry.js -> harry/index.html
        .pipe( rename({ suffix: '/index', extname: '.html'}) )
    ;

    // Create a home page
    var homeStream = gulp.src('src/templates/home.nunj', { base: 'src/templates'})
        // Get a list of contacts as summary data
        .pipe( data(requireAllContacts) )
            // Render the template(s) in gulp.src
        .pipe( nunj.render() )
        .pipe( rename({ basename: 'index', extname: '.html' }))
    ;

    // Merge the streams and pipe the output
    return es.merge(contactsStream, homeStream)
        .pipe( gulp.dest('build') )
        .pipe( connect.reload() )
    ;

});

gulp.task('watch', function(){
    gulp.watch(['src/data/contacts/**/*', 'src/templates/**/*'], ['html']);
});

gulp.task('server', function(){
    connect.server({
        port: 3000,
        root: './build',
        livereload: true
    })
});

gulp.task('default', ['server', 'watch', 'html']);