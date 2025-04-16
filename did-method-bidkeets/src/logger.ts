import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({
            filename: 'C:\\Users\\Administrator\\AppData\\Local\\Temp\\visualstudio-js-debugger.txt',
        }),
        new winston.transports.Console(),
    ],
});

export default logger;
