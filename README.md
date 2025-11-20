# Tawuniya Digital Wallet

A modern loyalty points management system built with Next.js, TypeScript, and PostgreSQL.

## 🚀 Quick Start

### Option 1: Docker (Recommended - No Node.js or PostgreSQL installation needed!)

#### Prerequisites

- Docker
- Docker Compose

#### Setup with Docker

**For Production Mode:**

```bash
# Build and start the containers
docker-compose up -d

# The application will be available at http://localhost:3000
# Database will automatically be created, migrated, and seeded
```

**Stop the containers:**

```bash
docker-compose down
```

---

### Option 2: Local Installation

#### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

#### Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment**

   Create `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/tawnia_wallet"
   JWT_SECRET="your-secret-key-here"
   ```

3. **Setup Database**

   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # Seed initial data (admin, users, services, configurations)
   npm run prisma:seed
   ```

4. **Run Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Default Credentials

**Admin Account:**

- Email: `admin@tawuniya.com`
- Password: `admin123`

**User Account:**

- Email: `user@example.com`
- Password: `user123`

### 5. Testing with Postman (Optional)

Import the Postman collection for easy API testing:

1. Open Postman
2. Import both files:
   - `Tawuniya_Wallet_API.postman_collection.json`
   - `Tawuniya_Wallet_Local.postman_environment.json`
3. Select "Tawuniya Wallet - Local" environment
4. Start testing!

---

## 📁 Architecture

### Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── wallet/               # Wallet operations
│   │   ├── transactions/         # Transaction history
│   │   ├── services/             # Service management
│   │   ├── configurations/       # Configuration endpoints
│   │   └── admin/                # Admin endpoints
│   ├── login/                    # Login page
│   ├── dashboard/                # User dashboard
│   └── admin/                    # Admin panel
│       └── configurations/       # Configuration management
│
├── backend/                      # Backend Logic (Clean Architecture)
│   ├── controllers/              # Request handling & validation
│   │   ├── base.controller.ts   # Base controller (error handling)
│   │   ├── auth.controller.ts
│   │   ├── wallet.controller.ts
│   │   ├── transaction.controller.ts
│   │   ├── admin.controller.ts
│   │   └── service.controller.ts
│   ├── services/                 # Business logic
│   │   ├── auth.service.ts
│   │   ├── wallet.service.ts
│   │   ├── admin.service.ts
│   │   └── service.service.ts
│   ├── repositories/             # Data access layer
│   │   ├── user.repository.ts
│   │   ├── wallet.repository.ts
│   │   ├── transaction.repository.ts
│   │   ├── service.repository.ts
│   │   └── configuration.repository.ts
│   ├── schemas/                  # Validation schemas (Zod)
│   │   └── wallet.schema.ts
│   ├── middleware/               # Request middleware
│   │   └── auth.middleware.ts   # JWT authentication & authorization
│   └── lib/                      # Utilities
│       ├── prisma.ts             # Database client
│       ├── errors.ts             # Custom error classes
│       └── jwt.ts                # JWT utilities
│
├── components/                   # React Components
│   ├── ClientProvider.tsx
│   ├── EmotionRegistry.tsx
│   ├── EarnPointsDialog.tsx
│   ├── BurnPointsDialog.tsx
│   └── TransactionHistory.tsx
│
├── contexts/                     # React Context
│   └── AuthContext.tsx           # Authentication state
│
├── lib/                          # Frontend utilities
│   └── api.ts                    # API client (Axios)
│
└── prisma/
    ├── schema.prisma             # Database schema
    └── seed.ts                   # Database seeding
```

---

## 🏗️ Design Patterns

### 1. **Layered Architecture (Clean Architecture)**

```
API Routes → Controllers → Services → Repositories → Database
```

- **Controllers**: Handle HTTP requests, validate input (Zod), return responses
- **Services**: Implement business logic, orchestrate operations
- **Repositories**: Abstract database operations, provide data access interface
- **Schemas**: Centralized validation rules and type definitions

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Material-UI (MUI)**
- **Emotion** (CSS-in-JS)
- **Axios** (HTTP client)

### Backend

- **Next.js API Routes**
- **Prisma ORM**
- **PostgreSQL**
- **Zod** (Schema validation)
- **JWT** (Authentication)
- **bcryptjs** (Password hashing)

---

## 🔧 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run prisma:seed      # Seed database with initial data
```

---
