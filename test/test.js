'use strict';

const cannyEdgeDetector = require('..');
const Image = require('image-js');

describe('canny-edge-detector test', function () {
    this.timeout(20000);
    it('Main test', function () {
        var promises = [Image.load('./test/img/test1.jpg'), Image.load('./test/img/test2.jpg'), Image.load('./test/img/testres.jpg')];

        return Promise.all(promises).then(function (images) {
            var params = {
                blur: 1.1
            };
            var edges1 = cannyEdgeDetector(images[0].grey(), params), edges2 = cannyEdgeDetector(images[1].grey(), params);
            var expectedOutput = images[2].grey();
            expectedOutput.colorModel = 'GREY';

            expectedOutput.getSimilarity(edges1).should.be.above(0.7);
            expectedOutput.getSimilarity(edges2).should.be.above(0.7);
        }).catch(function (result) {
            throw new RangeError(result);
        });
    });
});
