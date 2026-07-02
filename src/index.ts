import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import router from './routes';
import { swaggerSpec } from './swagger';
import { authMiddleware } from './middlewares/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 인증 없이 접근 가능한 경로 (/api 이후 경로 기준)
const PUBLIC_PATHS = ['/auth/signup', '/auth/login'];

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// PUBLIC_PATHS 제외한 모든 /api 경로에 인증 미들웨어 적용
app.use('/api', (req, res, next) => {
  if (PUBLIC_PATHS.includes(req.path)) {
    return next();
  }
  return authMiddleware(req, res, next);
});

app.use('/api', router);

app.get('/', (_req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});
