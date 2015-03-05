
describe('gulp-render-nunjucks', function(){

    before(function(){
        this.plugin = require('../');
        nunjucks.configure(process.cwd() + '/test/fixtures');
        this.package = require('../package.json');
    });

    describe('render()', function(){

        it('should return a function', function(){
            this.plugin.render().should.be.a.Function;
        });

        describe('output', function() {

            beforeEach(function(){
                var fs = require('fs');
                var hello = fs.readFileSync( __dirname + '/fixtures/hello.nunj');
                this.fakeFile = new gutil.File({
                    contents: new Buffer(hello)
                });
            });

            it('should render a file with no context', function(done){
                var stream = this.plugin.render();
                stream.once('data', function(file){
                    file.contents.toString().should.equal('Hello mysterious');
                    done();
                });
                stream.write(this.fakeFile);
                stream.end();
            });

            it('should use context supplied as argument', function(done){
                var stream = this.plugin.render({ message: 'hello' });
                stream.once('data', function(file){
                    file.contents.toString().should.equal('Hello hello');
                    done();
                });
                stream.write(this.fakeFile);
                stream.end();
            });

            it('should use context from file.data', function(done){
                this.fakeFile.data = { message: 'from gulp-data' };
                var stream = this.plugin.render();
                stream.once('data', function(file){
                    file.contents.toString().should.equal('Hello from gulp-data');
                    done();
                });
                stream.write(this.fakeFile);
                stream.end();
            });

            it('should merge context from file.data and argument', function(done){
                this.fakeFile.data = { message: 'from gulp-data' };
                var stream = this.plugin.render({ message: 'from argument'});
                stream.once('data', function(file){
                    file.contents.toString().should.equal('Hello from gulp-data');
                    done();
                });
                stream.write(this.fakeFile);
                stream.end();
            });

        });

    });


    describe('template()', function(){

        it('should be a function', function(){
            this.plugin.template.should.be.a.Function;
        });

        it('should throw an error if no arguments are supplied', function(){
            (function(){
                this.plugin.template();
            }.bind(this)).should.throw('You must supply the name of a template');
        });

        it('should halt on render errors', function(done){
            var spy = sinon.spy();
            var stream = this.plugin.template('not/a/real/path');
            stream.once('error', function(err){
                err.should.not.be.null;
                err.message.should.equal('template not found: not/a/real/path');
                err.plugin.should.equal(this.package.name);
                done();
            }.bind(this));
            stream.once('data', spy);
            stream.write(new gutil.File());
            stream.end();

            spy.should.not.be.called;
        });

        describe('arguments', function(){
            it('should call a function supplied as an argument to get the template', function(done){
                var fakeFile = new gutil.File();
                var stream = this.plugin.template( function(file){
                    file.should.equal(fakeFile);
                    return 'hello.nunj';
                });
                stream.once('data', function(file){
                    file.contents.toString().should.equal('Hello mysterious');
                    done();
                });
                stream.write(fakeFile);
                stream.end();
            });
        });

        describe('output', function(){
            beforeEach(function(){
                this.stream = this.plugin.template('hello.nunj');
            });

            describe('single file', function(){
                it('should render without file.data', function(done){
                    var fakeFile = new gutil.File();
                    this.stream.once('data', function(file){
                        should.not.exist(fakeFile.data);
                        file.contents.toString().should.equal('Hello mysterious');
                        done();
                    });
                    this.stream.write(fakeFile);
                    this.stream.end();
                });

                it('should use file.data for the render context', function(done){
                    var fakeFile = new gutil.File({ path: 'hello' });
                    fakeFile.data = { message: 'world' };

                    this.stream.once('data', function(file){
                        file.contents.toString().should.equal('Hello world');
                        done();
                    });
                    this.stream.write(fakeFile);
                    this.stream.end();
                });
            });

            describe('multiple files', function(){

                beforeEach(function(){
                    this.file1 = new gutil.File({ path: 'world' });
                    this.file1.data = { message: 'world' };
                    this.file2 = new gutil.File( { path: 'there' });
                    this.file2.data = { message: 'there!' };
                });

                it('should render the template for each data context', function(done){
                    this.stream.on('finish', done);
                    this.stream.once('data', function(file){
                        file.contents.toString().should.equal('Hello world');
                        file.path.should.equal('world');
                        this.stream.once('data', function(file){
                            file.contents.toString().should.equal('Hello there!');
                            file.path.should.equal('there');
                        });
                        this.stream.write(this.file2);
                        this.stream.end();
                    }.bind(this));
                    this.stream.write(this.file1);
                });

                it('should render different templates', function(done){
                    var stream = this.plugin.template(function(file){
                        var tpl;
                        if(file.path === 'world'){
                            tpl = 'goodbye.nunj';
                        }
                        else {
                            tpl = 'hello.nunj'
                        }
                        return tpl;
                    });

                    stream.on('finish', done);
                    stream.once('data', function(file){
                        file.contents.toString().should.equal('Goodbye cruel world');
                        file.path.should.equal('world');
                        stream.once('data', function(file){
                            file.contents.toString().should.equal('Hello there!');
                            file.path.should.equal('there');
                        });
                        stream.write(this.file2);
                        stream.end();
                    }.bind(this));
                    stream.write(this.file1);
                });
            })

        });

    });

});