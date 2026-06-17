# 💸 SpendWise — SaaS Expense Tracker

A modern, production-grade expense tracking dashboard built with React, TypeScript, Redux Toolkit, and Tailwind CSS.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Install & Run

```bash
# 1. Navigate to project
cd expense-tracker

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
expense-tracker/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── CategoryPieChart.tsx     # Donut pie chart
│   │   │   ├── MonthlyLineChart.tsx     # Area/line trend chart
│   │   │   └── SpendingBarChart.tsx     # Bar chart for daily spend
│   │   ├── dashboard/
│   │   │   ├── Analytics.tsx            # Full analytics view
│   │   │   ├── Budgets.tsx              # Budget tracking & alerts
│   │   │   ├── Dashboard.tsx            # Main dashboard
│   │   │   └── Settings.tsx             # App settings
│   │   ├── expenses/
│   │   │   ├── DeleteModal.tsx          # Confirm delete modal
│   │   │   ├── ExpenseModal.tsx         # Add/edit expense modal
│   │   │   ├── ExpenseRow.tsx           # Expense list row
│   │   │   └── ExpensesList.tsx         # Grouped expense list
│   │   ├── layout/
│   │   │   ├── Header.tsx               # Top navigation bar
│   │   │   └── Sidebar.tsx              # Collapsible sidebar
│   │   └── ui/
│   │       └── StatCard.tsx             # Reusable metric card
│   ├── data/
│   │   └── sampleData.ts               # 30 sample expenses + budgets
│   ├── hooks/
│   │   └── redux.ts                    # Typed useAppSelector/Dispatch
│   ├── store/
│   │   ├── slices/
│   │   │   ├── budgetsSlice.ts         # Budget state + selectors
│   │   │   ├── expensesSlice.ts        # Expense CRUD + memoized selectors
│   │   │   └── uiSlice.ts             # Theme, sidebar, modal state
│   │   └── index.ts                    # Redux store config
│   ├── types/
│   │   └── index.ts                    # TypeScript interfaces
│   ├── utils/
│   │   └── index.ts                    # formatCurrency, exportCSV, etc.
│   ├── App.tsx                          # Root component + routing
│   ├── index.css                        # Tailwind + CSS design tokens
│   └── main.tsx                         # ReactDOM entry
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## ✨ Features

### Core
- ✅ **Add / Edit / Delete** expenses with rich form
- ✅ **Category system** — 10 categories with icons & colors
- ✅ **Date-based grouping** — expenses grouped by day with totals
- ✅ **LocalStorage persistence** — data survives page refreshes

### Dashboard
- ✅ **4 stat cards** — Today, Month, Avg/day, Top category
- ✅ **Bar chart** — 14-day daily spending
- ✅ **Area/line chart** — spending trend over time
- ✅ **Donut pie chart** — category percentage breakdown
- ✅ **Category progress bars** — visual breakdown table

### Analytics
- ✅ Full category comparison (horizontal bar chart)
- ✅ Monthly trend area chart
- ✅ Category report table with percentages

### Budgets
- ✅ Set monthly budget limits per category
- ✅ Visual progress bars with color coding
- ✅ Over-budget 🔴 and near-limit 🟡 alerts

### UX/UI
- ✅ **Dark / Light mode** — auto-detects system preference
- ✅ **Responsive** — mobile-first, works on all screen sizes
- ✅ **Collapsible sidebar** — icon-only mode on desktop
- ✅ **Smooth animations** — modal entrance, progress bars
- ✅ **CSV export** — downloads all filtered expenses

### Tech
- ✅ **Redux Toolkit** — slices, createSelector, thunks
- ✅ **Memoized selectors** — no unnecessary re-renders
- ✅ **TypeScript strict** — full type safety
- ✅ **Recharts** — accessible, composable chart library

---

## 🎨 Design System

The app uses CSS custom properties for theming, switchable at runtime:

| Token | Light | Dark |
|-------|-------|------|
| `--color-background` | `#f1f5f9` | `#0f172a` |
| `--color-card` | `#ffffff` | `#1e293b` |
| `--color-accent` | `#6366f1` | `#818cf8` |
| `--color-text` | `#0f172a` | `#f1f5f9` |
| `--color-muted` | `#64748b` | `#94a3b8` |

Font: **Plus Jakarta Sans** (Google Fonts)

---

## 🧩 Redux Store Shape

```typescript
{
  expenses: {
    items: Expense[],        // All expenses (localStorage-backed)
    filters: ExpenseFilters, // Active search/category filters
  },
  budgets: {
    items: Budget[],         // Monthly budgets per category
  },
  ui: {
    theme: 'light' | 'dark',
    sidebarOpen: boolean,
    modal: { type, expenseId? },
    activeView: 'dashboard' | 'expenses' | 'analytics' | 'budgets' | 'settings',
  }
}
```

---

## 📊 Sample Data

30 realistic expenses are pre-loaded across the past 22 days, covering all 10 categories. Six budget limits are also pre-configured. To reset to sample data: **Settings → Reset to Sample Data**.

---

## 🔧 Extending the App

### Add a new category
1. Add to `CATEGORIES` array in `src/types/index.ts`
2. Add icon to `CATEGORY_ICONS`
3. Add color to `CATEGORY_COLORS`

### Add a new chart
Create a component in `src/components/charts/` using Recharts and import in a view.

### Add authentication
Add a `authSlice.ts` and wrap `App.tsx` with a login gate checking `state.auth.isAuthenticated`.
