import express from 'express';
import * as controller from './controller';
export const authRouter = express.Router();

authRouter.route('/').post(controller.create);
