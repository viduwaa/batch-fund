# 🎓 University Batch Fund System

An open-source, full-stack financial management platform designed exclusively for university batches, clubs, and student organizations. The system streamlines the process of collecting dues, tracking expenses, and maintaining a transparent master ledger for all students and administrators.

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

## 👥 Generate Student Auth Users (CSV -> SQL)

Use the Python generator to create Supabase user creation SQL and a credentials export file.

### Prerequisites

- Python 3.10+ available in your terminal.
- `student_data_updated.csv` present at the project root.

### Generate artifacts

```bash
python scripts/generate_supabase_users.py
```

Generated files:

- `scripts/output/create_users.sql` - SQL to create `auth.users` and linked `public.profiles` rows.
- `scripts/output/create_users_part_001.sql`, `..._002.sql`, etc. - chunked SQL files for SQL Editor size limits.
- `scripts/output/generated_user_credentials.csv` - `email,password` export for email delivery.
- `scripts/output/rejected_rows.csv` - rows skipped due to validation errors.
- `scripts/output/generation_summary.json` - generation counters and output paths.

### Notes

- SQL generation is re-run safe: each user block checks `auth.users` by email and skips existing accounts.
- If Supabase SQL Editor says query is too large, run the generated `create_users_part_*.sql` files in order.
- Passwords are random and strong (minimum 14 chars with symbols).
- If `generated_user_credentials.csv` already exists, previous passwords are reused for matching emails.
- The credentials file contains plain-text passwords. Store it securely and delete it after emails are sent.

### Optional flags

```bash
python scripts/generate_supabase_users.py --dry-run
python scripts/generate_supabase_users.py --input student_data_updated.csv --output-dir scripts/output --password-length 16
```

## ✉️ Send Credentials via SMTP (Python)

Use the SMTP sender script to email generated credentials from `scripts/output/generated_user_credentials.csv`.

### 1. Set environment variables

PowerShell example:

```powershell
$env:SMTP_HOST="smtp.your-provider.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="itt2022085@tec.rjt.ac.lk"
$env:SMTP_PASSWORD="your-app-password"
$env:SMTP_USE_TLS="true"
$env:SMTP_USE_SSL="false"
$env:FROM_EMAIL="itt2022085@tec.rjt.ac.lk"
$env:FROM_NAME="Batch Fund Coordinator"
$env:REPLY_TO="itt2022085@tec.rjt.ac.lk"
```

`FROM_NAME` controls the display name recipients see in their inbox.

### 2. Preview before sending

```bash
python scripts/send_credentials_smtp.py --dry-run
```

### 3. Send a single test email

```bash
python scripts/send_credentials_smtp.py --test-email your-address@example.com
```

### 4. Send to all recipients

```bash
python scripts/send_credentials_smtp.py
```

Generated logs:

- `scripts/output/email_sent_log.csv` - send status per email.
- `scripts/output/email_failed.csv` - failed deliveries for retry.

## 🗄️ Database Schema Overview

The Supabase backend relies on a structured PostgreSQL schema optimized for financial integrity:

- `profiles` - Extended user data mapped to Supabase Auth (`student_id`, `role`, `department`).
- `collections` - Track required batch funding operations (`amount_per_person`, `due_date`, `status`).
- `contributions` - Individual payment records linking a student to a collection (`amount_paid`, `status`).
- `expenses` - Outgoing batch fund expenses.
- `master_ledger` - Automatically constructed views/joins calculating total flow and current balances.

_Note: Ensure Row Level Security (RLS) policies are correctly mirrored from the setup guide to protect sensitive financial records._

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
