import type {
  Profile,
  Collection,
  Contribution,
  ContributionWithUser,
  ContributionWithCollection,
  Expense,
  LedgerEntry,
} from '@/lib/types';

// ─── Mock Profiles ──────────────────────────────────────────

export const mockProfiles: Profile[] = [
  {
    id: 'u1',
    full_name: 'Kamal Perera',
    student_id: 'EG/2021/3845',
    email: 'admin@batchfund.lk',
    department: 'ITT',
    is_admin: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u2',
    full_name: 'Nimali Fernando',
    student_id: 'EG/2021/3901',
    email: 'nimali@batchfund.lk',
    department: 'MTT',
    is_admin: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u3',
    full_name: 'Ruwan Silva',
    student_id: 'EG/2021/4012',
    email: 'ruwan@batchfund.lk',
    department: 'EET',
    is_admin: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u4',
    full_name: 'Tharushi Jayawardena',
    student_id: 'EG/2021/3756',
    email: 'tharushi@batchfund.lk',
    department: 'FDT',
    is_admin: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u5',
    full_name: 'Ashan De Silva',
    student_id: 'EG/2021/3688',
    email: 'ashan@batchfund.lk',
    department: 'BPT',
    is_admin: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u6',
    full_name: 'Dilini Rajapaksha',
    student_id: 'EG/2021/4100',
    email: 'dilini@batchfund.lk',
    department: 'ITT',
    is_admin: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u7',
    full_name: 'Sachith Bandara',
    student_id: 'EG/2021/3920',
    email: 'sachith@batchfund.lk',
    department: 'MTT',
    is_admin: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u8',
    full_name: 'Maleesha Wijesekara',
    student_id: 'EG/2021/3575',
    email: 'maleesha@batchfund.lk',
    department: 'EET',
    is_admin: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

// ─── Mock Collections ───────────────────────────────────────

export const mockCollections: Collection[] = [
  {
    id: 'c1',
    title: 'EXTRU 2026 Exhibition Contribution',
    description: 'Annual engineering exhibition booth setup, materials, and logistics.',
    amount_per_person: 2000,
    status: 'active',
    created_by: 'u1',
    due_date: '2026-04-15T00:00:00Z',
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'c2',
    title: 'Semester 3 Core Fund',
    description: 'General batch fund for semester 3 activities and essentials.',
    amount_per_person: 1500,
    status: 'active',
    created_by: 'u1',
    due_date: '2026-03-30T00:00:00Z',
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'c3',
    title: 'Sports Meet T-Shirts',
    description: 'Custom batch t-shirts for the university sports meet.',
    amount_per_person: 800,
    status: 'closed',
    created_by: 'u1',
    due_date: '2026-02-20T00:00:00Z',
    created_at: '2026-01-25T00:00:00Z',
  },
];

// ─── Mock Contributions ─────────────────────────────────────

export const mockContributions: Contribution[] = [
  // c1 - EXTRU 2026
  { id: 'ct1', collection_id: 'c1', user_id: 'u2', amount: 2000, paid_amount: 2000, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-03-10T14:30:00Z', created_at: '2026-03-01T00:00:00Z' },
  { id: 'ct2', collection_id: 'c1', user_id: 'u3', amount: 2000, paid_amount: 1000, status: 'partial', confirmed_by: 'u1', confirmed_at: '2026-03-11T10:00:00Z', created_at: '2026-03-01T00:00:00Z' }, // Partial example
  { id: 'ct3', collection_id: 'c1', user_id: 'u4', amount: 2000, paid_amount: 2000, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-03-12T09:15:00Z', created_at: '2026-03-01T00:00:00Z' },
  { id: 'ct4', collection_id: 'c1', user_id: 'u5', amount: 2000, paid_amount: 0, status: 'overdue', confirmed_by: null, confirmed_at: null, created_at: '2026-03-01T00:00:00Z' },
  { id: 'ct5', collection_id: 'c1', user_id: 'u6', amount: 2000, paid_amount: 2000, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-03-15T11:00:00Z', created_at: '2026-03-01T00:00:00Z' },
  { id: 'ct6', collection_id: 'c1', user_id: 'u7', amount: 2000, paid_amount: 0, status: 'pending', confirmed_by: null, confirmed_at: null, created_at: '2026-03-01T00:00:00Z' },
  { id: 'ct7', collection_id: 'c1', user_id: 'u8', amount: 2000, paid_amount: 2000, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-03-18T16:45:00Z', created_at: '2026-03-01T00:00:00Z' },

  // c2 - Semester 3 Core Fund
  { id: 'ct8', collection_id: 'c2', user_id: 'u2', amount: 1500, paid_amount: 1500, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-01-15T10:00:00Z', created_at: '2026-01-10T00:00:00Z' },
  { id: 'ct9', collection_id: 'c2', user_id: 'u3', amount: 1500, paid_amount: 1500, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-01-20T14:00:00Z', created_at: '2026-01-10T00:00:00Z' },
  { id: 'ct10', collection_id: 'c2', user_id: 'u4', amount: 1500, paid_amount: 1500, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-01-22T09:30:00Z', created_at: '2026-01-10T00:00:00Z' },
  { id: 'ct11', collection_id: 'c2', user_id: 'u5', amount: 1500, paid_amount: 1500, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-02-05T11:00:00Z', created_at: '2026-01-10T00:00:00Z' },
  { id: 'ct12', collection_id: 'c2', user_id: 'u6', amount: 1500, paid_amount: 1500, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-02-10T15:00:00Z', created_at: '2026-01-10T00:00:00Z' },
  { id: 'ct13', collection_id: 'c2', user_id: 'u7', amount: 1500, paid_amount: 0, status: 'overdue', confirmed_by: null, confirmed_at: null, created_at: '2026-01-10T00:00:00Z' },
  { id: 'ct14', collection_id: 'c2', user_id: 'u8', amount: 1500, paid_amount: 1500, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-02-15T10:30:00Z', created_at: '2026-01-10T00:00:00Z' },

  // c3 - Sports Meet T-Shirts (all paid — closed collection)
  { id: 'ct15', collection_id: 'c3', user_id: 'u2', amount: 800, paid_amount: 800, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-02-01T09:00:00Z', created_at: '2026-01-25T00:00:00Z' },
  { id: 'ct16', collection_id: 'c3', user_id: 'u3', amount: 800, paid_amount: 800, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-02-01T09:00:00Z', created_at: '2026-01-25T00:00:00Z' },
  { id: 'ct17', collection_id: 'c3', user_id: 'u4', amount: 800, paid_amount: 800, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-02-03T10:00:00Z', created_at: '2026-01-25T00:00:00Z' },
  { id: 'ct18', collection_id: 'c3', user_id: 'u5', amount: 800, paid_amount: 800, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-02-05T14:00:00Z', created_at: '2026-01-25T00:00:00Z' },
  { id: 'ct19', collection_id: 'c3', user_id: 'u6', amount: 800, paid_amount: 800, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-02-08T08:30:00Z', created_at: '2026-01-25T00:00:00Z' },
  { id: 'ct20', collection_id: 'c3', user_id: 'u7', amount: 800, paid_amount: 800, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-02-10T11:00:00Z', created_at: '2026-01-25T00:00:00Z' },
  { id: 'ct21', collection_id: 'c3', user_id: 'u8', amount: 800, paid_amount: 800, status: 'paid', confirmed_by: 'u1', confirmed_at: '2026-02-12T16:00:00Z', created_at: '2026-01-25T00:00:00Z' },
];

// ─── Mock Expenses ──────────────────────────────────────────

export const mockExpenses: Expense[] = [
  {
    id: 'e1',
    description: 'Decorations for EXTRU 2026 booth',
    amount: 4500,
    collection_id: 'c1',
    receipt_url: 'invoice_001.pdf',
    created_by: 'u1',
    created_at: '2026-03-25T10:00:00Z',
  },
  {
    id: 'e2',
    description: 'AWS Server Hosting (3 months)',
    amount: 3600,
    collection_id: 'c2',
    receipt_url: 'aws_receipt.png',
    created_by: 'u1',
    created_at: '2026-03-20T09:00:00Z',
  },
  {
    id: 'e3',
    description: 'Sports Meet batch t-shirt printing (50 pcs)',
    amount: 12500,
    collection_id: 'c3',
    receipt_url: 'tshirt_invoice.pdf',
    created_by: 'u1',
    created_at: '2026-02-14T10:00:00Z',
  },
  {
    id: 'e4',
    description: 'Domain name renewal — batchfund.lk',
    amount: 1200,
    collection_id: 'c2',
    receipt_url: null,
    created_by: 'u1',
    created_at: '2026-02-01T08:00:00Z',
  },
  {
    id: 'e5',
    description: 'Poster printing for career fair',
    amount: 2800,
    collection_id: 'c1',
    receipt_url: 'poster_receipt.jpg',
    created_by: 'u1',
    created_at: '2026-01-28T14:00:00Z',
  },
];

// ─── Computed / Helper Data ─────────────────────────────────

export function getProfileById(id: string): Profile | undefined {
  return mockProfiles.find((p) => p.id === id);
}

export function getCollectionById(id: string): Collection | undefined {
  return mockCollections.find((c) => c.id === id);
}

export function getContributionsForCollection(collectionId: string): ContributionWithUser[] {
  return mockContributions
    .filter((c) => c.collection_id === collectionId)
    .map((c) => {
      const user = getProfileById(c.user_id);
      return {
        ...c,
        user: {
          full_name: user?.full_name ?? 'Unknown',
          student_id: user?.student_id ?? '',
          email: user?.email ?? '',
          department: user?.department ?? 'ITT',
        },
      };
    });
}

export function getContributionsForUser(userId: string): ContributionWithCollection[] {
  return mockContributions
    .filter((c) => c.user_id === userId)
    .map((c) => {
      const collection = getCollectionById(c.collection_id);
      return {
        ...c,
        collection: {
          title: collection?.title ?? 'Unknown Collection',
          amount_per_person: collection?.amount_per_person ?? 0,
          due_date: collection?.due_date ?? '',
        },
      };
    });
}

export function getCollectionStats(collectionId: string) {
  const contributions = mockContributions.filter((c) => c.collection_id === collectionId);
  const total = contributions.length;
  const fullyPaidCount = contributions.filter((c) => c.status === 'paid').length;
  // Let "paid" here also include partials for the summary, or we can just say "fullyPaid". We'll refer to it as fullyPaid in the dashboard.
  const partialCount = contributions.filter((c) => c.status === 'partial').length;
  const pendingCount = contributions.filter((c) => c.status === 'pending').length;
  const overdueCount = contributions.filter((c) => c.status === 'overdue').length;
  
  const amountCollected = contributions.reduce((sum, c) => sum + c.paid_amount, 0);
  const totalExpected = contributions.reduce((sum, c) => sum + c.amount, 0);

  return { 
    total, 
    paid: fullyPaidCount, 
    partial: partialCount,
    pending: pendingCount, 
    overdue: overdueCount, 
    amountCollected, 
    totalExpected 
  };
}

// ─── Dashboard Stats ────────────────────────────────────────

export function getDashboardStats() {
  const totalCollected = mockContributions.reduce((sum, c) => sum + c.paid_amount, 0);

  const totalPending = mockContributions.reduce((sum, c) => sum + (c.amount - c.paid_amount), 0);

  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);

  const balance = totalCollected - totalExpenses;

  return { totalCollected, totalPending, totalExpenses, balance };
}

// ─── Ledger Entries ─────────────────────────────────────────

export function buildLedgerEntries(): LedgerEntry[] {
  const entries: LedgerEntry[] = [];

  // Add all paid amounts greater than 0 as income
  mockContributions
    .filter((c) => c.paid_amount > 0 && c.confirmed_at)
    .forEach((c) => {
      const user = getProfileById(c.user_id);
      const collection = getCollectionById(c.collection_id);
      entries.push({
        id: c.id,
        date: c.confirmed_at!,
        type: 'income',
        description: `${collection?.title ?? 'Collection'} — contribution received`,
        amount: c.paid_amount,
        running_balance: 0, // calculated below
        reference_name: user?.full_name ?? 'Unknown',
        student_id: user?.student_id,
        department: user?.department,
        collection_id: c.collection_id,
      });
    });

  // Add expenses
  mockExpenses.forEach((e) => {
    const collection = getCollectionById(e.collection_id);
    entries.push({
      id: e.id,
      date: e.created_at,
      type: 'expense',
      description: e.description,
      amount: e.amount,
      running_balance: 0,
      reference_name: collection?.title ?? 'Unknown Collection',
      collection_id: e.collection_id,
    });
  });

  // Sort by date ascending and compute running balance
  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let balance = 0;
  entries.forEach((entry) => {
    if (entry.type === 'income') {
      balance += entry.amount;
    } else {
      balance -= entry.amount;
    }
    entry.running_balance = balance;
  });

  // Reverse for newest-first display
  return entries.reverse();
}

// ─── Mock Auth Credentials ──────────────────────────────────

export const MOCK_CREDENTIALS = {
  admin: { email: 'admin@batchfund.lk', password: 'admin123' },
  user: { email: 'nimali@batchfund.lk', password: 'user123' },
};

export function generateCollectionReportExport(collectionId: string): string {
  const collection = getCollectionById(collectionId);
  if (!collection) return '<h1>Error: Collection not found.</h1>';

  const stats = getCollectionStats(collectionId);
  const expenses = mockExpenses.filter((e) => e.collection_id === collectionId);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = stats.amountCollected - totalSpent;

  const contributions = getContributionsForCollection(collectionId);

  // Group outstanding members by department
  const outstandingByDept: Record<string, typeof contributions> = {};
  // Count fully paid by department
  const fullyPaidCountByDept: Record<string, number> = {};

  contributions.forEach(c => {
    const dept = c.user.department || 'Unknown';
    const isFullyPaid = c.status === 'paid' || c.paid_amount >= c.amount;

    if (isFullyPaid) {
      fullyPaidCountByDept[dept] = (fullyPaidCountByDept[dept] || 0) + 1;
    } else {
      if (!outstandingByDept[dept]) outstandingByDept[dept] = [];
      outstandingByDept[dept].push(c);
    }
  });

  const dateStr = new Date().toLocaleString('en-LK', { dateStyle: 'full', timeStyle: 'short' });

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Financial Report - ${collection.title}</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px; line-height: 1.6; }
        .container { max-width: 900px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; }
        .header { background: #1e293b; color: white; padding: 30px 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em; }
        .header p { margin: 10px 0 0 0; color: #94a3b8; font-size: 14px; }
        .content { padding: 40px; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
        .stat-card.net { background: #eff6ff; border-color: #bfdbfe; }
        .stat-card h3 { margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-card p { margin: 10px 0 0 0; font-size: 24px; font-weight: 700; font-family: monospace; color: #0f172a; }
        .stat-card.net p { color: #1d4ed8; }
        h2 { font-size: 20px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0; margin-bottom: 20px; }
        .dept-section { margin-bottom: 30px; }
        .dept-title { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 15px; border-radius: 6px; font-weight: 600; color: #334155; border-left: 4px solid #3b82f6; margin-bottom: 15px; }
        table { w-full; border-collapse: collapse; width: 100%; margin-bottom: 20px; font-size: 14px; }
        th { text-align: left; padding: 12px 15px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; }
        td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        .amount { font-family: monospace; font-weight: 600; text-align: right; }
        th.right { text-align: right; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .badge.partial { background: #fef3c7; color: #d97706; }
        .badge.pending { background: #fee2e2; color: #dc2626; }
        .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; max-width: 100%; border-radius: 0; }
            .header { border-bottom: 2px solid #1e293b; background: white; color: #1e293b; padding: 20px 0;}
            .header h1 { color: #1e293b; }
            .header p { color: #475569; }
            .content { padding: 20px 0; }
            .footer { display: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FINANCIAL REPORT</h1>
            <p>${collection.title.toUpperCase()} &bull; GENERATED ON ${dateStr}</p>
        </div>
        <div class="content">
            <div class="summary-grid">
                <div class="stat-card">
                    <h3>Total Expected</h3>
                    <p>Rs. ${stats.totalExpected.toLocaleString()}</p>
                </div>
                <div class="stat-card">
                    <h3>Collected</h3>
                    <p>Rs. ${stats.amountCollected.toLocaleString()}</p>
                </div>
                <div class="stat-card">
                    <h3>Expenses</h3>
                    <p>Rs. ${totalSpent.toLocaleString()}</p>
                </div>
                <div class="stat-card net">
                    <h3>Final Net Balance</h3>
                    <p>Rs. ${netBalance.toLocaleString()}</p>
                </div>
            </div>

            <h2>Fully Paid Summary (By Department)</h2>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 40px;">
`;

  Object.keys(fullyPaidCountByDept).sort().forEach(dept => {
    html += `
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px 20px; border-radius: 8px; flex: 1; min-width: 100px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #059669;">${fullyPaidCountByDept[dept]}</div>
            <div style="font-size: 12px; color: #047857; text-transform: uppercase; font-weight: 600; margin-top: 4px;">${dept} Paid</div>
        </div>
    `;
  });

  if (Object.keys(fullyPaidCountByDept).length === 0) {
      html += `<p style="color: #64748b;">No members have fully paid yet.</p>`;
  }

  html += `
            </div>

            <h2>Outstanding Members Action List</h2>
  `;

  if (expenses.length > 0) {
      html += `
            <h2>Authorized Expenses</h2>
            <div style="margin-bottom: 30px;">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th class="right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
      `;
      expenses.forEach(e => {
          const eDate = new Date(e.created_at).toLocaleDateString('en-LK');
          html += `
                        <tr>
                            <td style="color: #64748b;">${eDate}</td>
                            <td style="font-weight: 500;">${e.description}</td>
                            <td class="amount" style="color: #ef4444;">- Rs. ${e.amount.toLocaleString()}</td>
                        </tr>
          `;
      });
      html += `
                    </tbody>
                </table>
            </div>
      `;
  }

  const deptKeys = Object.keys(outstandingByDept).sort();
  
  if (deptKeys.length === 0) {
      html += `<div style="background: #ecfdf5; color: #059669; padding: 20px; border-radius: 8px; text-align: center; font-weight: 500;">🎉 All members have fully paid. No outstanding balances!</div>`;
  } else {
      deptKeys.forEach(dept => {
          const members = outstandingByDept[dept];
          html += `
            <div class="dept-section">
                <div class="dept-title">
                    <span>${dept} Department</span>
                    <span style="background: #cbd5e1; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${members.length} Pending</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Reg No</th>
                            <th>Status</th>
                            <th class="right">Amount Owed</th>
                        </tr>
                    </thead>
                    <tbody>
          `;
          
          members.forEach(c => {
              const remaining = c.amount - c.paid_amount;
              const isPartial = c.paid_amount > 0;
              const badgeClass = isPartial ? 'partial' : 'pending';
              const badgeText = isPartial ? 'PARTIAL' : 'PENDING';
              
              html += `
                        <tr>
                            <td style="font-weight: 500;">${c.user.full_name}</td>
                            <td style="font-family: monospace; color: #64748b;">${c.user.student_id}</td>
                            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                            <td class="amount">Rs. ${remaining.toLocaleString()}</td>
                        </tr>
              `;
          });
          
          html += `
                    </tbody>
                </table>
            </div>
          `;
      });
  }

  html += `
        </div>
        <div class="footer">
            University Batch Fund Management System &bull; Confidential Financial Report<br/>
            <button onclick="window.print()" style="margin-top: 15px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Print / Save as PDF</button>
        </div>
    </div>
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
  `;

  return html;
}


