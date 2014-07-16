var fs = require("fs"),
  examples = fs.list([fs.workingDirectory, "examples"].join(fs.separator))
    .filter(function(file){ return /\.html$/.test(file); });

describe("The example", function() {
  before(function() {
    casper.start('./examples/')
  });

  examples.forEach((function(file){
    describe(file, function(){
      var errors = [];
      it("should run without errors for 5 seconds", function(done){
        casper.thenOpen("./examples/" + file, function(){
          this.wait(5000, function() {
            errors.should.deep.equal([]);
            done();
          });
        });
        casper.on("page.error", function(msg, trace){
          errors.push(msg + "\n" + JSON.stringify(trace, null, 2));
        });
      });
    });
  }).bind(this));
});
