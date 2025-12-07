# Deployment Guide for MixxFactory PWA

## Production Deployment

### Vercel (Recommended for Next.js)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository

2. **Environment Variables**
   Add to Vercel settings:
   ```
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_secret_key_min_32_chars
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Deploy**
   - Vercel automatically deploys on git push
   - Monitor deployment in Vercel dashboard

### Self-Hosted (Docker)

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm install --production

   COPY . .
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t mixxfactory .
   docker run -p 3000:3000 --env-file .env.production mixxfactory
   ```

### Railway.app

1. Connect GitHub repository
2. Add environment variables
3. Railway auto-deploys on push

### DigitalOcean App Platform

1. Connect GitHub repository
2. Set environment variables
3. Deploy

## Production Checklist

- [ ] MongoDB Atlas security rules configured
- [ ] JWT_SECRET is strong (min 32 characters)
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables properly set
- [ ] Database backups configured
- [ ] Monitoring and logging enabled
- [ ] Rate limiting implemented
- [ ] CDN configured for static assets
- [ ] Performance optimized (Lighthouse score > 90)
- [ ] Security headers configured

## Database Backups

### MongoDB Atlas Backups

1. Go to MongoDB Atlas dashboard
2. Select your cluster
3. Go to "Backup" settings
4. Enable automated backups
5. Set retention policy

### Manual Backup
```bash
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/mixxfactory" --out=./backup
```

## Monitoring

### Application Performance
- Use Vercel Analytics
- Set up Sentry for error tracking
- Monitor database performance in MongoDB Atlas

### Error Tracking
```bash
npm install @sentry/nextjs
```

### Database Monitoring
- MongoDB Atlas Charts for visualization
- Query performance analyzer

## Security Hardening

1. **CORS Configuration**
   - Only allow trusted domains
   - Disable in development with `*`

2. **Rate Limiting**
   - Add rate limiting middleware
   - Protect login endpoint

3. **CSRF Protection**
   - Implement CSRF tokens
   - Use SameSite cookies

4. **SQL Injection Prevention**
   - Use Mongoose (already done)
   - Validate all inputs with Zod

## Performance Optimization

1. **Image Optimization**
   - Use Cloudinary for image hosting
   - Enable Next.js Image optimization

2. **Database Optimization**
   - Ensure indexes are created
   - Use lean queries for read-only operations
   - Paginate large result sets

3. **Caching Strategy**
   - Service worker caches static assets
   - Use Redis for session caching (optional)
   - Set Cache-Control headers

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel --prod
```

## Troubleshooting

### Build Fails
- Clear build cache: `npm run build --reset-cache`
- Check Node.js version compatibility
- Verify all environment variables

### Database Connection Issues
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check network connectivity

### Performance Issues
- Monitor database queries
- Check service worker caching
- Enable compression middleware

---

For more information, see [Next.js Deployment](https://nextjs.org/docs/deployment)
