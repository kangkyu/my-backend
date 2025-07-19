# Node.js Backend with Prisma, Supabase, PostgreSQL & Vercel

A complete guide to setting up a production-ready Node.js backend with TypeScript, Prisma ORM, Supabase PostgreSQL, and Vercel deployment.

## Prerequisites

- Node.js 18+ installed
- Git installed
- A Supabase account
- A Vercel account

## 1. Initial Project Setup

Create a new Node.js project:

```bash
mkdir my-backend
cd my-backend
npm init -y
```

Install dependencies:

```bash
# Core dependencies
npm install prisma @prisma/client
npm install express cors helmet morgan dotenv
npm install @supabase/supabase-js

# Development dependencies
npm install -D typescript @types/node @types/express @types/cors @types/helmet @types/morgan nodemon ts-node
```

## 2. Create Project Structure

```
my-backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── lib/
│   │   └── prisma.ts
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── index.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

Create `.gitignore`:

```
node_modules/
.env
.env.local
dist/
.vercel
```

## 3. TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 4. Supabase Setup

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Choose a project name and secure password
3. Wait for the project to be provisioned (2-3 minutes)
4. Navigate to **Settings → Database** to get connection strings
5. Navigate to **Settings → API** to get your project URL and API keys

### Get Your Connection Strings

From the Database settings page, you'll need:
- **Direct connection string**: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`
- **Pooled connection string**: `postgresql://postgres.username:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

## 5. Environment Configuration

Create `.env`:

```env
# Database URLs
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# App Configuration
PORT=3000
NODE_ENV=development
```

Create `.env.example`:

```env
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
PORT=3000
NODE_ENV=development
```

## 6. Prisma Configuration

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]

  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
```

## 7. Create Prisma Singleton

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  // Use direct URL for development to avoid pooling issues
  const databaseUrl = process.env.NODE_ENV === 'development' 
    ? process.env.DIRECT_URL 
    : process.env.DATABASE_URL;

  return new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## 8. Database Setup

Initialize and generate Prisma client:

```bash
npx prisma generate
npx prisma db push
```

## 9. Express Server Setup

Create `src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// User routes
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { posts: true }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await prisma.user.create({
      data: { email, name }
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// For Vercel serverless functions
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel
export default app;
```

## 10. Update Package.json Scripts

Update your `package.json` scripts section:

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "vercel-build": "prisma generate && npm run build"
  }
}
```

## 11. Vercel Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

## 12. Test Local Development

Start the development server:

```bash
npm run dev
```

Test your endpoints:

### Health Check
```bash
curl http://localhost:3000/health
```

### Get Users
```bash
curl http://localhost:3000/users
```

### Create User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

## 13. Vercel Deployment Setup

Install Vercel CLI:

```bash
npm i -g vercel
```

Login to Vercel:

```bash
vercel login
```

## 14. Deploy and Configure Environment Variables

Run initial deployment:

```bash
vercel
```

In the Vercel dashboard, go to your project settings and add these environment variables:

- `DATABASE_URL`: `postgresql://postgres.username:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- `DIRECT_URL`: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`
- `SUPABASE_URL`: `https://[project-ref].supabase.co`
- `SUPABASE_ANON_KEY`: `your-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY`: `your-service-role-key`
- `NODE_ENV`: `production`

## 15. Production Deployment

Deploy to production:

```bash
vercel --prod
```

Your API will be available at the URL provided by Vercel.

## 16. Database Management

### View Database
```bash
npm run db:studio
```

### Generate Prisma Client (after schema changes)
```bash
npm run db:generate
```

### Push Schema Changes
```bash
npm run db:push
```

### Create and Run Migrations
```bash
npm run db:migrate
```

## API Endpoints

### Health Check
- **GET** `/health` - Returns server status

### Users
- **GET** `/users` - Get all users with their posts
- **POST** `/users` - Create a new user
  ```json
  {
    "email": "user@example.com",
    "name": "User Name"
  }
  ```

## Troubleshooting

### Common Issues

1. **Prepared statement errors**: The environment-based Prisma client handles this by using direct connections in development.

2. **req.body is undefined**: Ensure you're sending requests with `Content-Type: application/json` header.

3. **Database connection issues**: Verify your environment variables and database URLs.

4. **Vercel builds/functions conflict**: The provided `vercel.json` configuration resolves this.

### Development vs Production

- **Development**: Uses direct database connection (no pooling)
- **Production**: Uses connection pooling for serverless compatibility

## Project Structure Overview

```
my-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── lib/
│   │   └── prisma.ts         # Prisma client singleton
│   ├── routes/               # API routes (future expansion)
│   ├── middleware/           # Custom middleware (future expansion)
│   ├── services/             # Business logic (future expansion)
│   └── index.ts             # Main Express server
├── dist/                     # Compiled TypeScript (generated)
├── .env                      # Environment variables (local)
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vercel.json              # Vercel deployment configuration
└── README.md                # This file
```

## Next Steps

Now that your backend is set up, you can:

1. Add more API endpoints
2. Implement authentication with Supabase Auth
3. Add input validation with libraries like Joi or Zod
4. Set up automated testing
5. Add rate limiting and security middleware
6. Implement file upload functionality
7. Add API documentation with Swagger

## Technologies Used

- **Node.js** - Runtime environment
- **TypeScript** - Type safety
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **PostgreSQL** - Database
- **Vercel** - Serverless deployment platform

## License

MIT License - feel free to use this setup for your projects!