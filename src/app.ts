import express from 'express';
import { BASE_PATH } from '@/utils/constants';

export const app = express();
export const router = express.Router();

router.use(express.json());

app.enable('trust proxy');
app.use(BASE_PATH, router);
