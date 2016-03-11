// considering you have Google Chrome Driver in PATH, test suite can be run with: `npm install && npm test`
// webdriverio reference guide: http://webdriver.io/api.html
// mochajs reference guide: https://mochajs.org/
// q reference guide: https://github.com/kriskowal/q/wiki/API-Reference

var webdriverio = require('webdriverio'), // selenium wrapper
    mocha       = require('mocha'),       // testing framework
    assert      = require('assert'),      // node native assertion
    q           = require('q'),           // pomise library (for creating more complex promises)
    _           = require('underscore'),  // pretty obvious :)
    client      = {};

client = webdriverio.remote(
    {
        desiredCapabilities: {browserName: 'chrome'}//,
        // logLevel: 'verbose'
    }
);

describe('IMDb test suite', function() {
    before(function(done) {
        client.init(done);
    });

    it('should return at least one result on each sorting option', function() {
        var promise = q();

        return client
            .url('http://www.imdb.com/chart/top')
            .waitForVisible('.lister-sort-by', 10000)
            .elements('.lister-sort-by option') // select the sorting options dropdown
            .then(function(result) {
                // console.log(result);
                _(result.value.length).times(function(i) { // loop on the number of options
                    promise = promise.then(function() {
                        return client
                            .selectByIndex('.lister-sort-by', i)
                            .pause(3000) // explicitly wait 3 seconds for list to update
                            .saveScreenshot('topRatedIndexSort' + i + '.png')
                            .elements('.lister-list tr')
                            .then(function(result) {
                                // console.log(result.value);
                                assert(result.value.length > 0, 'Result list is empty');
                            });
                    });
                });
                return promise;
            });
    });

    it('should check the \'Western\' genre for at least one result', function() {
        return client
            .waitForEnabled('.subnav_item_main a')
            .element('.quicklinks') // select the quicklink sidebar
            .click('*=Western')     // click the option containing the partial text 'Western'
            .waitForVisible('.results', 5000)
            .saveScreenshot('westernList.png')
            .elements('.results .detailed')
            .then(function(result) {
                // console.log(result.value);
                assert(result.value.length > 0, 'Result list is empty');
            });
    });

    // it('should be simple to add more cases', function() {
        // to add more cases just make sure you return the 'client' object and keep chaining promises:
        // return client
        //     .pause(3000);
    // });

    after(function(done) {
        client.end(done);
    });
});
