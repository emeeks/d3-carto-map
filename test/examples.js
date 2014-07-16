"use strict";

var fs = require("fs"),
  exampleDir = "./dist/examples/",
  examples = fs.list(exampleDir)
    .filter(function(file){ return /\.html$/.test(file); });

describe("The example", function() {
  before(function() {
    casper.start(exampleDir);
  });

  examples.forEach((function(file){
    describe(file, function(){
      var errors = [];
      it("should run without errors for 5 seconds", function(done){
        casper.thenOpen(exampleDir + file, function(){
          this.wait(5000, function() {
            errors.should.deep.equal([]);
            done();
          });
        });
        casper.on("page.error", function(msg, trace){
          this.log(msg);
          errors.push(msg + "\n" + JSON.stringify(trace, null, 2));
        });
      });
    });
  }).bind(this));
});
