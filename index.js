var _ = require('lodash');
var gutil = require('gulp-util');
var nunjucks = require('nunjucks');
var through = require('through2');
var pkg = require('./package.json');



function onRender(file, scope, cb){
    return function(err, result){
        if(err){
            this.emit('error', new gutil.PluginError(pkg.name, err) );
            return;
        }

        file.contents = new Buffer(result);
        this.push(file);
        cb();

    }.bind(scope);
}

exports.template = function(tpl) {

    if(!tpl){
        throw new Error('You must supply the name of a template');
    }

    return through.obj(function(file, enc, cb){
        var name;

        if(typeof(tpl) === 'function'){
            name = tpl.call(this, file);
        }
        else {
            name = tpl;
        }

        nunjucks.render(name, file.data, onRender(file, this, cb));
    });

};


exports.render = function(context){

    context = context || {};

    return through.obj(function(file, enc, cb){
        var data = _.merge(context, file.data || {});
        nunjucks.renderString(file.contents.toString(), data, onRender(file, this, cb));
    });

};

exports.configure = nunjucks.configure;
