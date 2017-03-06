'use strict';

var Image = require('image-js');

const defaultOptions = {
    lowThreshold: 10,
    highThreshold: 90,
    blur: 1,
    brightness: 255
};

function cannyEdgeDetector(image, options) {
    options = Object.assign({}, defaultOptions, options);

    var width = image.width, height = image.height;

    image = image.grey({
        algorithm: 'luma601'
    });

    var tMin = options.lowThreshold;
    var tMax = options.highThreshold;
    var blur = options.blur;
    var brightness = options.brightness;


    var Gx = [
        [-1, 0, +1],
        [-2, 0, +2],
        [-1, 0, +1]
    ];

    var Gy = [
        [-1, -2, -1],
        [0, 0, 0],
        [+1, +2, +1]
    ];

    var gfOptions = {
        sigma: blur,
        radius: 3
    };

    var gf = image.gaussianFilter(gfOptions);

    var convOptions = {
        bitDepth: 32,
        mode: 'periodic'
    };

    var gradientX = gf.convolution(Gy, convOptions);
    var gradientY = gf.convolution(Gx, convOptions);

    var G = new Image(width, height, {
        kind: 'GREY',
        bitDepth: 16
    });

    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            G.setPixelXY(i, j, [Math.abs(gradientY.getPixelXY(i, j)[0]) + Math.abs(gradientX.getPixelXY(i, j)[0])]);
        }
    }

    G.save("gradient.jpg");


    var nms = new Image(width, height, {
        kind: 'GREY',
        bitDepth: 32
    });
    var edges = new Image(width, height, {
        kind: 'GREY',
        bitDepth: 32
    });
    var finalImage = new Image(width, height, {
        kind: 'GREY'
    });

    // non-maximum supression
    for (i = 1; i < width - 1; i++) {
        for (j = 1; j < height - 1; j++) {

            var dir = (Math.round(Math.atan2(gradientY.getPixelXY(i, j)[0], gradientX.getPixelXY(i, j)[0]) * (5.0 / Math.PI)) + 5) % 5;
            dir %= 4;

            if (
                !((dir === 0 && (G.getPixelXY(i, j)[0] <= G.getPixelXY(i, j - 1)[0] || G.getPixelXY(i, j)[0] <= G.getPixelXY(i, j + 1)[0]))
                || (dir === 1 && (G.getPixelXY(i, j)[0] <= G.getPixelXY(i - 1, j + 1)[0] || G.getPixelXY(i, j)[0] <= G.getPixelXY(i + 1, j - 1)[0]))
                || (dir === 2 && (G.getPixelXY(i, j)[0] <= G.getPixelXY(i - 1, j)[0] || G.getPixelXY(i, j)[0] <= G.getPixelXY(i + 1, j)[0]))
                || (dir === 3 && (G.getPixelXY(i, j)[0] <= G.getPixelXY(i - 1, j - 1)[0] || G.getPixelXY(i, j)[0] <= G.getPixelXY(i + 1, j + 1)[0])))
            ) {
                nms.setPixelXY(i, j, G.getPixelXY(i, j))
            }
        }
    }

    for (i = 0; i < width * height; ++i) {
        var currentNms = nms.getPixel(i)[0];
        var currentEdge = 0;
        if (currentNms > tMax) {
            currentEdge++;
            finalImage.setPixel(i, [brightness]);
        }
        if (currentNms > tMin) {
            currentEdge++;
        }

        edges.setPixel(i, [currentEdge])
    }


    // Hysteresis
    var currentPixels = [];
    for (i = 1; i < width - 1; ++i) {
        for (j = 1; j < height - 1; ++j) {
            if (edges.getPixelXY(i, j)[0] !== 1) {
                continue;
            }

            var end = false;
            for (var k = i - 1; k < i + 2; ++k) {
                for (var l = j - 1; l < j + 2; ++l) {
                    if (edges.getPixelXY(k, l)[0] === 2) {
                        currentPixels.push([i, j]);
                        finalImage.setPixelXY(i, j, [brightness]);
                        end = true;
                        break;
                    }
                }
                if (end) {
                    break;
                }
            }
        }
    }

    while (currentPixels.length > 0) {
        var newPixels = [];
        for (i = 0; i < currentPixels.length; ++i) {
            for (j = -1; j < 2; ++j) {
                for (k = -1; k < 2; ++k) {
                    if (j === 0 && k === 0) {
                        continue;
                    }
                    var row = currentPixels[i][0] + j;
                    var col = currentPixels[i][1] + k;
                    if (edges.getPixelXY(row, col)[0] === 1 && finalImage.getPixelXY(row, col)[0] === 0) {
                        newPixels.push([row, col]);
                        finalImage.setPixelXY(row, col, [brightness]);
                    }
                }
            }
        }
        currentPixels = newPixels;
    }

    return finalImage;

}

module.exports = cannyEdgeDetector;
