# Blog API Documentation

A simple blog backend with user authentication and post management.

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### 1. User Signup
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. User Login
**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Get User Profile
**GET** `/auth/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "posts": 5
    }
  }
}
```

#### 4. Update User Profile
**PUT** `/auth/profile`

Update current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "clx123...",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 5. Delete User Account
**DELETE** `/auth/profile`

Delete current user's account and all associated posts.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "User account deleted successfully"
}
```

### Posts

#### 1. Get All Published Posts
**GET** `/posts`

Get all published posts with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10)
- `authorId` (optional): Filter by author ID

**Response:**
```json
{
  "posts": [
    {
      "id": "clx456...",
      "title": "My First Blog Post",
      "content": "This is the content of my first blog post...",
      "published": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "clx123...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### 2. Get User's Posts (Including Drafts)
**GET** `/posts/my-posts`

Get all posts for the authenticated user (including unpublished drafts).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10)

**Response:**
```json
{
  "posts": [
    {
      "id": "clx456...",
      "title": "My Draft Post",
      "content": "This is a draft post...",
      "published": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "clx123...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

#### 3. Get Single Post
**GET** `/posts/:id`

Get a specific post by ID. Published posts are public, unpublished posts require authentication and ownership.

**Response:**
```json
{
  "post": {
    "id": "clx456...",
    "title": "My Blog Post",
    "content": "This is the content...",
    "published": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "clx123...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### 4. Create New Post
**POST** `/posts`

Create a new blog post.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "My New Blog Post",
  "content": "This is the content of my new blog post...",
  "published": false
}
```

**Response:**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": "clx789...",
    "title": "My New Blog Post",
    "content": "This is the content of my new blog post...",
    "published": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "clx123...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### 5. Update Post
**PUT** `/posts/:id`

Update an existing post (only by the author).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Blog Post Title",
  "content": "Updated content...",
  "published": true
}
```

**Response:**
```json
{
  "message": "Post updated successfully",
  "post": {
    "id": "clx789...",
    "title": "Updated Blog Post Title",
    "content": "Updated content...",
    "published": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "clx123...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### 6. Delete Post
**DELETE** `/posts/:id`

Delete a post (only by the author).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Post deleted successfully"
}
```

## Error Responses

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "details": [
    "Email is required",
    "Password must be at least 6 characters long"
  ]
}
```

### Authentication Error (401)
```json
{
  "error": "Access token required"
}
```

### Authorization Error (403)
```json
{
  "error": "Access denied"
}
```

### Not Found Error (404)
```json
{
  "error": "Post not found"
}
```

### Conflict Error (409)
```json
{
  "error": "User with this email already exists"
}
```

### Server Error (500)
```json
{
  "error": "Failed to create user"
}
```

## Environment Variables

Create a `.env` file with the following variables:

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

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your database and update the `.env` file

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The API will be available at `http://localhost:3000` 