import express from 'express';
import { addExpense, getExpenses, updateExpense, deleteExpense } from '../controllers/expensecontroller.js';

const router = express.Router();

router.post('/add', addExpense);
router.get('/:userId', getExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
