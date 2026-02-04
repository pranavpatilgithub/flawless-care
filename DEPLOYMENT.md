# Deployment Guide

This guide will help you deploy the Hospital Management System to production.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Click "Deploy"

3. **Post-Deployment**
   - Your app will be available at `https://your-project.vercel.app`
   - Set up custom domain (optional)
   - Configure Supabase redirect URLs

### Option 2: Railway

Railway is another great option for full-stack apps.

#### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Add environment variables
   - Deploy

### Option 3: Netlify

Netlify also supports Next.js applications.

#### Steps:

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Deploy**
   - Click "Add new site"
   - Import from Git
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables
   - Deploy

### Option 4: Self-Hosted (VPS)

Deploy to your own server (DigitalOcean, AWS EC2, etc.)

#### Prerequisites:
- Ubuntu 22.04+ server
- Node.js 18+
- Nginx (optional, for reverse proxy)
- PM2 (for process management)

#### Steps:

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx (optional)
   sudo apt install nginx -y
   ```

2. **Clone and Build**
   ```bash
   git clone <your-repo-url>
   cd hospital-management
   npm install
   
   # Create .env.local with your variables
   nano .env.local
   
   # Build the application
   npm run build
   ```

3. **Run with PM2**
   ```bash
   pm2 start npm --name "hospital-hms" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL Certificate**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Environment Variables Setup

For all deployment methods, ensure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Supabase Configuration

After deployment, update Supabase settings:

1. **Authentication Settings**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your production URL to "Site URL"
   - Add redirect URLs:
     - `https://your-domain.com/auth/callback`
     - `https://your-domain.com/dashboard`

2. **CORS Settings**
   - Go to Settings → API
   - Add your domain to allowed origins

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema executed
- [ ] Supabase redirect URLs updated
- [ ] SSL certificate installed (for production)
- [ ] Custom domain configured (optional)
- [ ] Error monitoring set up (Sentry, LogRocket, etc.)
- [ ] Analytics configured (Google Analytics, Plausible, etc.)
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Performance monitoring enabled

## Performance Optimization

### 1. Enable Caching
```javascript
// next.config.js
module.exports = {
  // ... other config
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

### 2. Image Optimization
Use Next.js Image component for all images:
```jsx
import Image from 'next/image'

<Image 
  src="/image.jpg" 
  alt="Description"
  width={500}
  height={300}
  priority
/>
```

### 3. Database Indexing
Ensure all frequently queried columns have indexes (already included in schema.sql)

### 4. Enable Compression
For self-hosted deployments, enable gzip compression in Nginx.

## Monitoring & Maintenance

### Health Checks
Implement health check endpoints:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
}
```

### Logging
Set up proper logging:
- Application logs
- Database query logs
- Error tracking (Sentry)
- Performance monitoring

### Backup Strategy
1. **Database Backups**
   - Enable Supabase automatic backups
   - Set up daily backup schedule
   - Store backups in separate location

2. **Code Backups**
   - Use Git for version control
   - Regular commits to remote repository

## Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use secure secret management

2. **Database Security**
   - Enable Row Level Security (RLS)
   - Regular security audits
   - Update dependencies regularly

3. **HTTPS**
   - Always use HTTPS in production
   - Configure HSTS headers

4. **Rate Limiting**
   - Implement API rate limiting
   - Use Supabase rate limiting features

## Troubleshooting

### Build Failures
- Check Node.js version (18+)
- Clear node_modules and reinstall
- Check for TypeScript errors

### Database Connection Issues
- Verify environment variables
- Check Supabase project status
- Review RLS policies

### Performance Issues
- Enable caching
- Optimize database queries
- Use CDN for static assets

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple instances behind load balancer
- Use Vercel/Netlify auto-scaling

### Database Scaling
- Upgrade Supabase plan as needed
- Implement read replicas
- Use connection pooling

### CDN Integration
- Serve static assets via CDN
- Cache API responses appropriately

## Support

For deployment issues:
- Check Next.js deployment docs
- Supabase deployment guide
- Platform-specific documentation

---

**Note**: Always test deployments in a staging environment before pushing to production.
