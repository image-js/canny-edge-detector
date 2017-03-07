'use strict';

const cannyEdgeDetector = require('..');
const Image = require('image-js');

describe('canny-edge-detector test', function () {
    this.timeout(20000);
    it('Main test', function () {
        return Image.load('./test/img/billboard.jpg').then(function (image) {
            var grey = cannyEdgeDetector(image);
            grey.save('./test/img/result.jpg');
        }).catch(function (result) {
            throw new RangeError(result);
        });
    });
});
