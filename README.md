# 🏭 Commodities Management System

A full-featured **Commodities Management System** built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**. The application provides role-based access control with separate views for **Managers** and **Store Keepers** to manage products/commodities efficiently.

## 🚀 Live Demo

> **Deployed on Vercel**: [commodities-mgmt-system.vercel.app](https://commodities-mgmt-system.vercel.app)

---

## 🔐 Login Credentials

| Role          | Email                  | Password   |
| ------------- | ---------------------- | ---------- |
| **Manager**   | admin@example.com      | password   |
| **Store Keeper** | staff@example.com   | password   |

### Role Permissions

- **Manager**: Full access — Dashboard, Products/Commodities management (CRUD), and analytics.
- **Store Keeper**: Limited access — Products/Commodities view and management.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **State Management**: React Context API
- **GraphQL Client**: Apollo Client
- **Utilities**: clsx, tailwind-merge

---

## 📦 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation & Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KeshavxA/commodities-mgmt-system.git
   cd commodities-mgmt-system
   ```

2. **Install dependencies & start the dev server**:
   ```bash
   npm install && npm run dev
   ```

3. **Open your browser** at [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
commodities-mgmt-system/
├── app/                    # Next.js App Router pages
│   ├── login/              # Login page
│   ├── dashboard/          # Manager dashboard
│   ├── commodities/        # Commodities management page
│   └── layout.tsx          # Root layout
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── auth/           # Authentication guards
│   │   ├── layout/         # Sidebar, Navbar
│   │   └── products/       # Product table, modals
│   ├── context/            # React Context providers (Auth, Theme)
│   ├── data/               # Sample/mock data
│   ├── lib/                # Utility libraries (Apollo client)
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
└── package.json
```

---

## 🎨 Features

- ✅ **Authentication** — Login with role-based access (Manager / Store Keeper)
- ✅ **Role-Based Navigation** — Sidebar dynamically shows menu items based on user role
- ✅ **Dashboard** — Analytics overview (Manager only)
- ✅ **Commodities Management** — Full CRUD operations for products
- ✅ **Responsive Design** — Works on desktop and mobile
- ✅ **Dark/Light Theme** — Theme toggle support
- ✅ **Logout** — Secure session clearing with redirect to login

---

## 🚢 Deployment

This project is deployed on **Vercel**:

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Vercel auto-detects Next.js and configures the build
3. Push to `main` to trigger automatic deployments

---

## 📄 License

This project is built as part of a hiring assessment.
