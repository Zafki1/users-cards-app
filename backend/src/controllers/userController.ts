import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createUser, deleteUser, getUserById, listUsers, updateUser } from '../services/userService.js';

const cardSchema = z.object({
  accountNumber: z.string().trim().min(1).max(50),
  ownerNameLatin: z.string().trim().min(1).max(255).regex(/^[A-Za-z\s.'-]+$/),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cvc: z.string().regex(/^\d{3,4}$/)
});

const userSchema = z.object({
  fullName: z.string().trim().min(1).max(255),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  workPlace: z.string().trim().max(255).optional().nullable(),
  cards: z.array(cardSchema).min(1)
});

function parseId(req: Request) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function handleListUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listUsers());
  } catch (error) {
    next(error);
  }
}

export async function handleGetUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req);
    if (!id) {
      res.status(400).json({ message: 'Invalid user id' });
      return;
    }

    const user = await getUserById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function handleCreateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = userSchema.parse(req.body);
    const user = await createUser(payload);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req);
    if (!id) {
      res.status(400).json({ message: 'Invalid user id' });
      return;
    }

    const payload = userSchema.parse(req.body);
    const user = await updateUser(id, payload);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req);
    if (!id) {
      res.status(400).json({ message: 'Invalid user id' });
      return;
    }

    const deleted = await deleteUser(id);
    if (!deleted) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

