import Expense from '../models/expenseschema.js';

export const addExpense = async (req, res) => {
  const { userId, amount, category, description } = req.body;
  try {
    const expense = await Expense.create({ userId, amount, category, description });
    res.status(201).json({ message: 'Expense added', expense });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
};

export const getExpenses = async (req, res) => {
  const { userId } = req.params;
  try {
    const expenses = await Expense.find({ userId });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
};

export const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { amount, category, description } = req.body;
  try {
    await Expense.findByIdAndUpdate(id, { amount, category, description });
    res.status(200).json({ message: 'Expense updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
};

export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    await Expense.findByIdAndDelete(id);
    res.status(200).json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
};
