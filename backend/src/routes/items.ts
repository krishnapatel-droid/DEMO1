// Items API routes
import { Router, type Request, type Response } from 'express';
import { itemSchema, itemUpdateSchema } from '../schemas/item.js';
import * as itemRepo from '../repositories/itemRepository.js';
import { AppError } from '../middleware/error.js';

const router = Router();

// GET /items - List all items with search, sort, pagination
router.get('/', (req: Request, res: Response) => {
  const params: itemRepo.ListParams = {
    q: req.query.q as string,
    sortBy: req.query.sortBy as itemRepo.ListParams['sortBy'],
    sortDir: req.query.sortDir as 'asc' | 'desc',
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
  };

  const result = itemRepo.listItems(params);
  res.json(result);
});

// GET /items/:id - Get single item
router.get('/:id', (req: Request, res: Response) => {
  const item = itemRepo.getItem(req.params.id as string);
  
  if (!item) {
    throw new AppError(404, 'NOT_FOUND', 'Item not found');
  }

  res.json({ data: item });
});

// POST /items - Create new item
router.post('/', (req: Request, res: Response) => {
  const input = itemSchema.parse(req.body);
  const item = itemRepo.createItem(input);
  
  res.status(201).json({ data: item });
});

// PUT /items/:id - Update item
router.put('/:id', (req: Request, res: Response) => {
  const input = itemUpdateSchema.parse(req.body);
  const item = itemRepo.updateItem(req.params.id as string, input);
  
  if (!item) {
    throw new AppError(404, 'NOT_FOUND', 'Item not found');
  }

  res.json({ data: item });
});

// DELETE /items/:id - Delete item
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = itemRepo.deleteItem(req.params.id as string);
  
  if (!deleted) {
    throw new AppError(404, 'NOT_FOUND', 'Item not found');
  }

  res.status(204).send();
});

export default router;
