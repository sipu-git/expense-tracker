// src/data/sampleData.ts
import { Budget } from '@/types';
import { Expense } from '@/types/expense.type';
import { format, subDays } from 'date-fns';

const now = new Date();

function makeExpense(
  id: string,
  name: string,
  amount: number,
  type: Expense['type'],
  daysAgo: number,
  notes?: string
): Expense {
  const bought_at = subDays(now, daysAgo);
  return {
    id,
    name,
    amount,
    type,
    bought_at: format(bought_at, 'yyyy-MM-dd'),
    // notes,
  };
}

export const sampleExpenses: Expense[] = [
  makeExpense('1', 'Grocery shopping', 84.5, 'FOOD', 0),
  makeExpense('2', 'Uber to office', 12.0, 'TRANSPORTATION', 0),
  makeExpense('3', 'Netflix subscription', 15.99, 'ENTERTAINMENT', 0),
  makeExpense('4', 'Lunch at Chipotle', 13.5, 'FOOD', 1),
  makeExpense('5', 'Gas station fill-up', 52.3, 'TRANSPORTATION', 1),
  makeExpense('6', 'Amazon Prime order', 67.99, 'SHOPPING', 1),
  makeExpense('7', 'Doctor co-pay', 30.0, 'HEALTHCARE', 2),
  makeExpense('8', 'Coffee shop', 6.75, 'FOOD', 2),
  makeExpense('9', 'Electric bill', 98.4, 'UTILITIES', 2),
  makeExpense('10', 'Dinner out', 45.0, 'FOOD', 3),
  makeExpense('11', 'Spotify', 9.99, 'ENTERTAINMENT', 3),
  makeExpense('12', 'Bus pass', 35.0, 'TRANSPORTATION', 4),
  makeExpense('13', 'Gym membership', 49.99, 'HEALTHCARE', 5),
  makeExpense('14', 'Online course', 29.99, 'EDUCATION', 5),
  makeExpense('15', 'Internet bill', 59.99, 'UTILITIES', 6),
  makeExpense('16', 'Restaurant dinner', 78.2, 'FOOD', 7),
  makeExpense('17', 'New shoes', 89.99, 'SHOPPING', 7),
  makeExpense('18', 'Movie tickets', 24.0, 'ENTERTAINMENT', 8),
  makeExpense('19', 'Pharmacy', 22.5, 'HEALTHCARE', 9),
  makeExpense('20', 'Flight tickets', 340.0, 'TRAVEL', 10, 'Weekend trip'),
  makeExpense('21', 'Hotel booking', 189.0, 'TRAVEL', 10),
  makeExpense('22', 'Rent', 1250.0, 'HOUSING', 12),
  makeExpense('23', 'Breakfast café', 14.25, 'FOOD', 13),
  makeExpense('24', 'Parking fee', 8.0, 'TRANSPORTATION', 14),
  makeExpense('25', 'Textbook', 54.99, 'EDUCATION', 15),
  makeExpense('26', 'Water bill', 34.0, 'UTILITIES', 16),
  makeExpense('27', 'Clothing haul', 132.5, 'SHOPPING', 17),
  makeExpense('28', 'Thai takeout', 31.0, 'FOOD', 18),
  makeExpense('29', 'Concert tickets', 120.0, 'ENTERTAINMENT', 20),
  makeExpense('30', 'Car maintenance', 210.0, 'TRANSPORTATION', 22),
];

export const sampleBudgets: Budget[] = [
  { category: 'FOOD', limit: 400, period: 'monthly' },
  { category: 'TRANSPORTATION', limit: 200, period: 'monthly' },
  { category: 'SHOPPING', limit: 300, period: 'monthly' },
  { category: 'ENTERTAINMENT', limit: 150, period: 'monthly' },
  { category: 'HEALTHCARE', limit: 200, period: 'monthly' },
  { category: 'UTILITIES', limit: 250, period: 'monthly' },
];