import { Router } from 'express';
import {
  handleCreateUser,
  handleDeleteUser,
  handleGetUser,
  handleListUsers,
  handleUpdateUser
} from '../controllers/userController.js';

export const usersRouter = Router();

usersRouter.get('/', handleListUsers);
usersRouter.get('/:id', handleGetUser);
usersRouter.post('/', handleCreateUser);
usersRouter.put('/:id', handleUpdateUser);
usersRouter.delete('/:id', handleDeleteUser);

