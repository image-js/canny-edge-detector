'use strict';

const cannyEdgeDetector = require('..');
const Image = require('image-js');

Image.load('./img/billboard.jpg').then(function(image) {
    var grey = cannyEdgeDetector(image);
    grey.save('test.jpg');
}).catch(function (result) {
    throw new RangeError(result);
});

var im = [
    [0,   0,   0,   0,   0,   0,   0,   0,   0, 0],
    [0, 255, 255, 255, 255, 255, 255, 255, 255, 0],
    [0, 255, 255, 255, 255, 255, 255, 255, 255, 0],
    [0, 255, 255, 0, 0, 0, 0, 255, 255, 0],
    [0, 255, 255, 0, 0, 0, 0, 255, 255, 0],
    [0, 255, 255, 0, 0, 0, 0, 255, 255, 0],
    [0, 255, 255, 0, 0, 0, 0, 255, 255, 0],
    [0, 255, 255, 255, 255, 255, 255, 255, 255, 0],
    [0, 255, 255, 255, 255, 255, 255, 255, 255, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

var test = new Image(10, 10, {
    kind: 'GREY'
});

for(var i = 0; i < im.length; ++i) {
    for(var j = 0; j < im[0].length; ++j) {
        test.setPixelXY(i, j, [im[i][j]]);
    }
}

test.save("crazy.jpg");