# Multi-Domain Blog Management System

A comprehensive Next.js 14 blog management platform that allows users to manage multiple domains, create blogs with WordPress-level SEO, and monetize through subscription plans.

## 🚀 Features

### For Users
- **Multi-Domain Management**: Each user can manage multiple domains based on their subscription
- **Domain-Specific Blogs**: Create and manage blogs specific to each domain
- **Subscription Plans**:
  - **Free**: 1 domain, 5 blogs
  - **Paid Monthly**: 3 domains, 20 blogs each (₹49/month)
  - **Custom 30-Day**: 30 blogs for 30 days
- **WordPress-Level SEO**: Structured data, meta tags, sitemaps
- **Cloudflare R2 Storage**: Compressed image storage in user-specific folders

### For Developers
- **API Key Based Access**: Each domain gets a unique API key
- **Rate Limiting**: Per-domain API request limits
- **Domain Validation**: Only active domains can access content
- **Easy Integration**: Simple API consumption with `lib/blog-api.js`

## 📋 Requirements

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials
- Razorpay account (for payments)
- Cloudflare R2 bucket (for image storage)

## 🛠️ Setup Instructions

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb blog_db

# Set DATABASE_URL in .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/blog_db"
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

**Required Environment Variables:**

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/blog_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-string"

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Razorpay (Get from Razorpay Dashboard)
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_ACCESS_KEY_ID="your-access-key"
CLOUDFLARE_SECRET_ACCESS_KEY="your-secret-key"
CLOUDFLARE_BUCKET_NAME="codexprime"
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Database Migration

```bash
# Apply database migrations
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma generate

# Seed initial data (optional)
pnpm prisma db seed
```

### 5. Development Setup

```bash
# Start development server
pnpm dev

# Get development API key
curl http://localhost:3000/api/setup/dev-key

# Copy the returned API key to .env.local as NEXT_PUBLIC_BLOG_API_KEY
```

## 🏗️ Application Architecture

### Authentication System
- **Users**: Google OAuth signin
- **Admin**: Email/password login
- **Role-based Access**: USER vs ADMIN roles

### Domain Management
- Each user can register domains based on subscription limits
- Each domain gets a unique API key
- Rate limiting per domain (configurable)
- Active/inactive status control

### Blog System
- Domain-specific blog creation
- WordPress-level SEO optimization
- Image storage in Cloudflare R2: `codexprime/{domain}/{userId}/images/`
- Category and tag management

### Subscription Plans
- **FREE**: 1 domain, 5 blogs, 1 year validity
- **PAID_MONTHLY**: 3 domains, 20 blogs each, ₹49/month, 28-day cycles
- **CUSTOM_30DAYS**: Custom plan for 30 days, 30 blogs

## 🔑 API Usage

### For External Websites

1. **Get Your API Key**: Register domain in dashboard
2. **Install Blog API Client**: Copy `lib/blog-api.js` to your project
3. **Configure Environment**:
   ```bash
   NEXT_PUBLIC_BLOG_API_URL=https://your-blog-system.com
   NEXT_PUBLIC_BLOG_API_KEY=blog_your_api_key_here
   ```

### Example Usage

```javascript
import { getPosts, getPost } from './lib/blog-api'

// Get paginated posts
const postsData = await getPosts({ page: 1, limit: 10 })

// Get single post
const postData = await getPost('post-slug')

// Get categories
const categoriesData = await getCategories()
```

### API Endpoints

```bash
# Public APIs (require API key)
GET /api/public/posts?page=1&limit=10&category=tech
GET /api/public/posts/[slug]
GET /api/public/categories
GET /api/public/sitemap

# User APIs (require authentication)
GET /api/user/domains
GET /api/user/subscription
POST /api/posts
PUT /api/posts/[id]

# Admin APIs
POST /api/admin/domains
GET /api/admin/domains
```

## 🌐 SEO Features

### Structured Data (JSON-LD)
Every blog post includes:
- BlogPosting schema
- Author information
- Publisher details
- Publication dates

### Meta Tags
- Title and description optimization
- Open Graph tags for social sharing
- Twitter Card support
- Keywords meta tag

### Sitemaps
- Dynamic XML sitemap generation
- Post and category URLs
- Last modified dates
- Priority settings

### Robots.txt
- Search engine crawl optimization
- Different crawl delays for different bots
- Proper sitemap reference

## 💳 Payment Integration

### Razorpay Setup
1. Create Razorpay account
2. Get Key ID and Secret from dashboard
3. Set up webhook for payment verification
4. Configure webhook secret

### Payment Flow
1. User selects plan
2. Razorpay order created
3. Payment gateway opened
4. Webhook verifies payment
5. Subscription activated

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/          # Admin-only APIs
│   │   ├── public/         # Domain-validated APIs
│   │   ├── user/           # User-specific APIs
│   │   ├── auth/           # NextAuth configuration
│   │   └── payment/        # Razorpay integration
│   ├── dashboard/          # User dashboard
│   └── blog/              # Blog display pages
├── components/            # Reusable components
└── lib/
    ├── prisma.js         # Database client
    ├── api-auth.js       # API key validation
    └── blog-api.js       # External API client
```

## 🚀 Deployment

### Environment Variables
Set all production environment variables on your hosting platform.

### Database
Use a production PostgreSQL database (Neon, Supabase, etc.)

### Image Storage
Configure Cloudflare R2 with proper CORS settings.

### Domain Setup
Configure your domain to point to the deployed application.

## 🐛 Troubleshooting

### Common Issues

1. **API Key Invalid**: Check domain is active and API key is correct
2. **Rate Limit Exceeded**: Check hourly request limits in database
3. **Subscription Expired**: Verify subscription end date
4. **Image Upload Failed**: Check Cloudflare R2 credentials

### Debug Commands

```bash
# Check API key validity
curl -H "x-api-key: your-api-key" http://localhost:3000/api/public/posts

# Check database connection
pnpm prisma db push

# Reset development data
pnpm prisma migrate reset
```

## 📞 Support

For issues and feature requests, please check the GitHub issues or contact support.

## 📄 License

This project is licensed under the MIT License.
