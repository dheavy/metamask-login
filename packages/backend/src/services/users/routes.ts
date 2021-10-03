import express from 'express';
import jwt from 'express-jwt';
import { config } from '../../config';
import * as controller from './controller';
export const userRouter = express.Router();

userRouter.route('/').get(controller.find);
userRouter.route('/:userId').get(jwt(config), controller.get)
userRouter.route('/').post(controller.create);
userRouter.route('/:userId').patch(jwt(config), controller.patch);
