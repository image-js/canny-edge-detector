'use strict';

var Image = require('image-js');

const defaultOptions = {
    lowThreshold: 10,
    highThreshold: 30,
    blur: 1.1
};


/**
 * Find edges in an image using the Canny algorithm
 * @param {Image} image : a greyscale image
 * @param {object} options
 * @param {number} [options.lowThreshold=10] : first threshold for the hysteresis procedure.
 * @param {number} [options.highThreshold=30] : second threshold for the hysteresis procedure.
 * @param {number} [options.blur=1.1] : sigma parameter for gaussian filter step.
 * @param {number} [options.brightness] : values assigned to each edge pixel on the result image.
 * @return {Image} : an image with the edges at options.brightness value.
 */
function cannyEdgeDetector(image, options) {
    image.checkProcessable("Canny edge detector", {
        bitDepth: 8,
        channels: 1,
        components: 1
    });

    options = Object.assign({}, defaultOptions, options);

    var width = image.width, height = image.height;
    var brightness = image.maxValue;

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
        sigma: options.blur,
        radius: 3
    };

    var gf = image.gaussianFilter(gfOptions);

    var convOptions = {
        bitDepth: 32,
        mode: 'periodic'
    };

    var gradientX = gf.convolution(Gy, convOptions);
    var gradientY = gf.convolution(Gx, convOptions);

    var G = gradientY.hypotenuse(gradientX);

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

    // Non-Maximum supression
    for (var i = 1; i < width - 1; i++) {
        for (var j = 1; j < height - 1; j++) {

            var dir = (Math.round(Math.atan2(gradientY.getValueXY(i, j, 0), gradientX.getValueXY(i, j, 0)) * (5.0 / Math.PI)) + 5) % 4;

            if (
                !((dir === 0 && (G.getValueXY(i, j, 0) <= G.getValueXY(i, j - 1, 0) || G.getValueXY(i, j, 0) <= G.getValueXY(i, j + 1, 0)))
                || (dir === 1 && (G.getValueXY(i, j, 0) <= G.getValueXY(i - 1, j + 1, 0) || G.getValueXY(i, j, 0) <= G.getValueXY(i + 1, j - 1, 0)))
                || (dir === 2 && (G.getValueXY(i, j, 0) <= G.getValueXY(i - 1, j, 0) || G.getValueXY(i, j, 0) <= G.getValueXY(i + 1, j, 0)))
                || (dir === 3 && (G.getValueXY(i, j, 0) <= G.getValueXY(i - 1, j - 1, 0) || G.getValueXY(i, j, 0) <= G.getValueXY(i + 1, j + 1, 0))))
            ) {
                nms.setValueXY(i, j, 0, G.getValueXY(i, j, 0));
            }
        }
    }

    for (i = 0; i < width * height; ++i) {
        var currentNms = nms.data[i];
        var currentEdge = 0;
        if (currentNms > options.highThreshold) {
            currentEdge++;
            finalImage.data[i] = brightness;
        }
        if (currentNms > options.lowThreshold) {
            currentEdge++;
        }

        edges.data[i] = currentEdge;
    }


    // Hysteresis: first pass
    var currentPixels = [];
    for (i = 1; i < width - 1; ++i) {
        for (j = 1; j < height - 1; ++j) {
            if (edges.getValueXY(i, j, 0) !== 1) {
                continue;
            }

            var end = false;
            outer: for (var k = i - 1; k < i + 2; ++k) {
                for (var l = j - 1; l < j + 2; ++l) {
                    if (edges.getValueXY(k, l, 0) === 2) {
                        currentPixels.push([i, j]);
                        finalImage.setValueXY(i, j, 0, brightness);
                        end = true;
                        break outer;
                    }
                }
            }
        }
    }

    // Hysteresis: second pass
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
                    if (edges.getValueXY(row, col, 0) === 1 && finalImage.getValueXY(row, col, 0) === 0) {
                        newPixels.push([row, col]);
                        finalImage.setValueXY(row, col, 0, brightness);
                    }
                }
            }
        }
        currentPixels = newPixels;
    }

    return finalImage;

}

module.exports = cannyEdgeDetector;
