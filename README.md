<![CDATA[# TrustFlow — DeFi Micro-Lending Platform

AI-powered under-collateralized micro-lending. Build your on-chain credit score and access fair loans without traditional credit history. We have made this project for Yantra Central hackathon organized by VIT.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)

------

## ✨ Features

### Borrowers
- **AI Risk Scoring** — 1000-point credit score across 5 categories (on-chain activity, identity, social, financial, collateral history)
- **Multi-Step Loan Application** — Amount, term, collateral sliders with real-time interest rate calculation
- **Dashboard** — Active loans, repayment progress tracking, risk score breakdown, improvement suggestions

### Lenders
- **Loan Marketplace** — Browse, search, filter, and sort loan requests by risk level, amount, and yield
- **Portfolio Dashboard** — Charts for monthly earnings, risk distribution, and investment performance
- **One-Click Investing** — Invest in individual loans with estimated earnings preview

### Admin
- **Platform Metrics** — Total users, disbursement volume, repayment rate, default rate
- **Activity Feed** — Real-time platform events with status indicators
- **Health Monitoring** — Key metric progress bars and quick-action controls

### Platform
- 🔐 Email/password + wallet connect authentication
- 🎨 Dark mode with glassmorphism UI (shadcn/ui + Radix)
- 📱 Fully responsive (mobile sidebar, collapsible navigation)
- 🧠 Role-based dashboards with role switcher

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Database | Prisma 5 + SQLite (dev) |
| State | Zustand + React Query |
| Web3 | wagmi + viem + RainbowKit |
| Charts | Recharts |
| Auth | NextAuth.js v4 |
| Forms | React Hook Form + Zod |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Clone the repository

```bash
git clone https://github.com/your-username/DeFi-TrustFlow.git
cd DeFi-TrustFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file (a template already exists):

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id"
```

### 4. Initialize the database

```bash
npx prisma db push
```

This creates the SQLite database and applies the schema.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. (Optional) View the database

```bash
npm run db:studio
```

Opens Prisma Studio at [http://localhost:5555](http://localhost:5555).

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Seed database with sample data |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (providers, toaster)
│   ├── globals.css                 # Theme variables, utilities
│   ├── auth/
│   │   ├── login/page.tsx          # Login (email + wallet)
│   │   └── register/page.tsx       # Register (role selection)
│   ├── borrower/
│   │   ├── dashboard/page.tsx      # Borrower dashboard
│   │   ├── apply/page.tsx          # Loan application (3-step)
│   │   └── risk-score/page.tsx     # Risk score report
│   ├── lender/
│   │   ├── dashboard/page.tsx      # Lender dashboard (charts)
│   │   └── marketplace/page.tsx    # Loan marketplace
│   └── admin/
│       └── dashboard/page.tsx      # Admin console
├── components/
│   ├── layout/
│   │   └── DashboardLayout.tsx     # Shared dashboard shell
│   ├── providers.tsx               # React Query provider
│   └── ui/                         # 18 shadcn/ui components
├── lib/
│   ├── constants.ts                # Platform config & navigation
│   ├── prisma.ts                   # Prisma client singleton
│   ├── risk-scoring.ts             # AI risk scoring engine
│   ├── store.ts                    # Zustand state stores
│   └── utils.ts                    # Formatting & calculation helpers
prisma/
└── schema.prisma                   # Database models
```

---

## 🗄️ Database Models

| Model | Description |
|---|---|
| `User` | Account with email, password hash, wallet, role |
| `Profile` | Extended user info (employment, income, KYC status) |
| `Loan` | Loan applications with amount, rate, term, status |
| `Investment` | Lender investments linked to loans |
| `Repayment` | Individual repayment records |
| `KYCDocument` | Uploaded verification documents |
| `Notification` | In-app user notifications |
| `Transaction` | On-chain transaction records |
| `RiskScoreHistory` | Historical risk score snapshots |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.
]]>
