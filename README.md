# 🎓 University Batch Fund System

An open-source, full-stack financial management platform designed exclusively for university batches, clubs, and student organizations. The system streamlines the process of collecting dues, tracking expenses, and maintaining a transparent master ledger for all students and administrators.

![BatchFund Banner](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200&h=400)

## ✨ Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and capabilities for both **Admins** (Batch Reps/Treasurers) and general **Students**.
- **Fund Collections Manager:** Create and govern batch-wide funding requests (e.g., "Exhibition Contribution", "Batch Trip Fee") with automated due dates and status tracking.
- **Smart Payment Tracking:** 
  - Dynamic payment statuses (`Pending`, `Partial`, `Paid`).
  - Automated calculation of remaining balances.
- **Expense Logging:** Track every outgoing transaction with descriptions, categories, and dates.
- **Master Ledger:** A comprehensive, fully transparent financial ledger accessible to all students to track cash inflow, outflow, and the current batch fund balance.
- **Real-Time Dashboards:** Built with data-driven insights, live balance updates, and progress bars mapping collection fulfillments.
- **Secure Authentication:** Integrated with Supabase Auth for robust student login and session persistence.

## 🚀 Tech Stack

- **Frontend:** [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Data Fetching & State:** [TanStack React Query v5](https://tanstack.com/query)
- **Backend as a Service:** [Supabase](https://supabase.com/)
- **Database:** PostgreSQL (with Row Level Security)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🛠️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and your preferred package manager (npm, yarn, or pnpm) installed. You will also need a [Supabase](https://supabase.com/) account for the backend.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/batch-fund.git
cd batch-fund
```

### 2. Install dependencies
```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Setup Supabase
1. Create a new project in your Supabase dashboard.
2. Run the SQL schema required for the database (SQL script can be found in the database setup guide).
3. Enable Email/Password Authentication in Supabase Auth settings.
4. Rename `.env.example` to `.env.local` and add your project keys:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server
```bash
npm run dev
# or
pnpm dev
```
The application will be available at `http://localhost:5173`.

## 🗄️ Database Schema Overview

The Supabase backend relies on a structured PostgreSQL schema optimized for financial integrity:
* `profiles` - Extended user data mapped to Supabase Auth (`student_id`, `role`, `department`).
* `collections` - Track required batch funding operations (`amount_per_person`, `due_date`, `status`).
* `contributions` - Individual payment records linking a student to a collection (`amount_paid`, `status`).
* `expenses` - Outgoing batch fund expenses.
* `master_ledger` - Automatically constructed views/joins calculating total flow and current balances.

*Note: Ensure Row Level Security (RLS) policies are correctly mirrored from the setup guide to protect sensitive financial records.*

## 🤝 Contributing

Contributions are always welcome! Whether you are fixing a bug, adding a new feature, or improving documentation, your help makes this project better for everyone.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ for University Students & Treasurers.
