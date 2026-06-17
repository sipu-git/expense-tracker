// src/data/sampleData.ts
import { Expense, Budget } from '../types';
import { format, subDays } from 'date-fns';

const now = new Date();

function makeExpense(
  id: string,
  title: string,
  amount: number,
  category: Expense['category'],
  daysAgo: number,
  notes?: string
): Expense {
  const date = subDays(now, daysAgo);
  return {
    id,
    title,
    amount,
    category,
    date: format(date, 'yyyy-MM-dd'),
    notes,
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
  };
}

export const sampleExpenses: Expense[] = [
  makeExpense('1', 'Grocery shopping', 84.5, 'Food & Dining', 0),
  makeExpense('2', 'Uber to office', 12.0, 'Transportation', 0),
  makeExpense('3', 'Netflix subscription', 15.99, 'Entertainment', 0),
  makeExpense('4', 'Lunch at Chipotle', 13.5, 'Food & Dining', 1),
  makeExpense('5', 'Gas station fill-up', 52.3, 'Transportation', 1),
  makeExpense('6', 'Amazon Prime order', 67.99, 'Shopping', 1),
  makeExpense('7', 'Doctor co-pay', 30.0, 'Healthcare', 2),
  makeExpense('8', 'Coffee shop', 6.75, 'Food & Dining', 2),
  makeExpense('9', 'Electric bill', 98.4, 'Utilities', 2),
  makeExpense('10', 'Dinner out', 45.0, 'Food & Dining', 3),
  makeExpense('11', 'Spotify', 9.99, 'Entertainment', 3),
  makeExpense('12', 'Bus pass', 35.0, 'Transportation', 4),
  makeExpense('13', 'Gym membership', 49.99, 'Healthcare', 5),
  makeExpense('14', 'Online course', 29.99, 'Education', 5),
  makeExpense('15', 'Internet bill', 59.99, 'Utilities', 6),
  makeExpense('16', 'Restaurant dinner', 78.2, 'Food & Dining', 7),
  makeExpense('17', 'New shoes', 89.99, 'Shopping', 7),
  makeExpense('18', 'Movie tickets', 24.0, 'Entertainment', 8),
  makeExpense('19', 'Pharmacy', 22.5, 'Healthcare', 9),
  makeExpense('20', 'Flight tickets', 340.0, 'Travel', 10, 'Weekend trip'),
  makeExpense('21', 'Hotel booking', 189.0, 'Travel', 10),
  makeExpense('22', 'Rent', 1250.0, 'Housing', 12),
  makeExpense('23', 'Breakfast café', 14.25, 'Food & Dining', 13),
  makeExpense('24', 'Parking fee', 8.0, 'Transportation', 14),
  makeExpense('25', 'Textbook', 54.99, 'Education', 15),
  makeExpense('26', 'Water bill', 34.0, 'Utilities', 16),
  makeExpense('27', 'Clothing haul', 132.5, 'Shopping', 17),
  makeExpense('28', 'Thai takeout', 31.0, 'Food & Dining', 18),
  makeExpense('29', 'Concert tickets', 120.0, 'Entertainment', 20),
  makeExpense('30', 'Car maintenance', 210.0, 'Transportation', 22),
];

export const sampleBudgets: Budget[] = [
  { category: 'Food & Dining', limit: 400, period: 'monthly' },
  { category: 'Transportation', limit: 200, period: 'monthly' },
  { category: 'Shopping', limit: 300, period: 'monthly' },
  { category: 'Entertainment', limit: 150, period: 'monthly' },
  { category: 'Healthcare', limit: 200, period: 'monthly' },
  { category: 'Utilities', limit: 250, period: 'monthly' },
];