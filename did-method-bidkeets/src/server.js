import express from 'express';
import cors from 'cors';
import logger from './logger';
import { runDemo } from './demo';
const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/demo', async (req, res) => {
    logger.info('���յ� /api/demo ����');
    try {
        const result = await runDemo();
        logger.info('������ʾ���', { result });
        res.json(result);
    }
    catch (error) {
        logger.error('���� /api/demo ����ʧ��', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});
app.use((req, res) => {
    const error = `·�ɲ�����: ${req.method} ${req.url}`;
    logger.error(error);
    res.status(404).json({ error });
});
app.listen(3001, () => {
    logger.info('��˷����������� http://localhost:3001');
});
