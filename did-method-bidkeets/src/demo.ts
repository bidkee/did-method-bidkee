import { Bidkee } from './bidkee.js';
import logger from './logger.js';
import { DemoResult } from './types.js';

export function runDemo(): DemoResult {
    logger.info('Running BID demo');
    const bidkee = new Bidkee();
    const bid = bidkee.create();
    const isValid = bidkee.verify(bid);
    return { bid, isValid };
}