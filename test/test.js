'use strict';

const cannyEdgeDetector = require('..');
const Image = require('image-js');

describe('canny-edge-detector test', function () {
    this.timeout(15000);
    it('Something to test', function () {
        return Image.load('./img/billboard.jpg').then(function(image) {
            var grey = cannyEdgeDetector(image);
            grey.save('test.jpg');
        }).catch(function (result) {
            throw new RangeError(result);
        });
    });
});
