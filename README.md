# Blog Backend API

A simple blog backend with user authentication and post management built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Features

- 🔐 **User Authentication**: JWT-based authentication with password hashing
- 📝 **Blog Posts**: Create, read, update, and delete blog posts
- 👤 **User Management**: User registration, login, and profile management
- 🛡️ **Security**: Input validation, password hashing, JWT tokens
- 📊 **Pagination**: Paginated post listings
- 🏷️ **Draft System**: Support for draft and published posts
- 🔒 **Authorization**: Users can only edit their own posts

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcryptjs
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, Morgan logging

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/blog_db"
DIRECT_URL="postgresql://username:password@localhost:5432/blog_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Server
PORT=3000
NODE_ENV=development
```

### 3. Set Up Database
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 4. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### 5. Test the API
```bash
# Run the test script (requires server to be running)
npm run test:api
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `DELETE /auth/profile` - Delete user account

### Posts
- `GET /posts` - Get all published posts
- `GET /posts/my-posts` - Get user's posts (including drafts)
- `GET /posts/:id` - Get single post
- `POST /posts` - Create new post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

## Project Structure

```
src/
├── index.ts              # Main application entry point
├── lib/
│   ├── prisma.ts         # Prisma client configuration
│   ├── auth.ts           # Authentication utilities
│   └── validation.ts     # Joi validation schemas
└── routes/
    ├── auth.ts           # Authentication routes
    └── posts.ts          # Post management routes
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run test:api` - Run API tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DIRECT_URL` | Direct PostgreSQL connection for migrations | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation with Joi
- CORS protection
- Helmet security headers
- Request logging with Morgan
- SQL injection protection via Prisma
- XSS protection via input sanitization

## License

ISC
