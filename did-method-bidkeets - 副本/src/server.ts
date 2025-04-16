import express from 'express';
import cors from 'cors';
import { Bidkee } from './bidkee.js';
import logger from './logger.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/demo', (req, res) => {
    logger.info('Received /api/demo request', { query: req.query });
    try {
        const did = req.query.did as string | undefined;
        logger.info('Creating BID', { did });
        const bid = Bidkee.create(did || 'did:bidkee:kaspa:example');
        logger.info('Verifying BID', { did: bid.did });
        const isValid = Bidkee.verify(bid);
        const result = { bid, isValid };
        logger.info('Sending response', { result });
        res.json(result);
    } catch (error: any) {
        logger.error('Error in /api/demo', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    logger.info(`后端服务器运行在 http://localhost:${port}`);
});
