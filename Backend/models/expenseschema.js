import mongoose from 'mongoose';

const expenseSchema = mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
