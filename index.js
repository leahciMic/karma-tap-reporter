var TAPReporter = function(baseReporterDecorator, config) {
  var tapReporterConfig = config.tapReporter || {},
    _this = this,
    output = '',
    path = require('path'),
    fs = require('fs'),
    numbers, outputFile;

  /**
   * save all data that is coming in to the `data` variable for later use and
   * proxy input to `this.write`
   */
  function write(data) {
    output = output + data;
    _this.write(data);
  }

  if (tapReporterConfig.outputFile) {
    outputFile = path.resolve(config.basePath, tapReporterConfig.outputFile)
  }

  baseReporterDecorator(this);

  this.onRunStart = function() {
    numbers = new Object();
  };

   this.onBrowserStart = function(browser) {
     numbers[browser.id] = 0;
  };

  this.specSuccess = function(browser, result) {
    write("ok " + ++numbers[browser.id] + " " + result.suite.join(' ').replace(/\./g, '_') + " " + result.description + "\n");
  };

  this.specFailure = function(browser, result) {
    write("not ok " + ++numbers[browser.id] + " " + result.suite.join(' ').replace(/\./g, '_') + " " + result.description + "\n");
  };

  this.specSkipped = function(browser, result) {
    write("ok " + ++numbers[browser.id] + " " + "# skip " + result.suite.join(' ').replace(/\./g, '_') + " " + result.description + "\n");
  };

  this.onRunComplete = function(browsers, results) {
    var total = 0;
    browsers.forEach(function(browser, id) {
      total += browser.lastResult.total;
    });
    write("1.." + total + "\n");

    if (outputFile) {
      fs.writeFileSync(outputFile, output);
    }
  };
};

TAPReporter.$inject = ['baseReporterDecorator', 'config', 'logger'];

module.exports = {
  'reporter:tap': ['type', TAPReporter]
};
