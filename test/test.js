import Image from 'image-js';
import cannyEdgeDetector from '../src';

describe('canny-edge-detector test', () => {
    it('Main test', async () => {
        const promises = [Image.load('./test/img/test1.png'), Image.load('./test/img/test2.png'), Image.load('./test/img/testres.png')];
        const images = await Promise.all(promises);
        const params = {
            gaussianBlur: 1.1
        };
        const edges1 = cannyEdgeDetector(images[0].grey(), params);
        const edges2 = cannyEdgeDetector(images[1].grey(), params);
        const expectedOutput = images[2];
        expectedOutput.colorModel = 'GREY';

        expect(expectedOutput.getSimilarity(edges1)).toBeGreaterThan(0.7);
        expect(expectedOutput.getSimilarity(edges2)).toBeGreaterThan(0.7);
    });
});
