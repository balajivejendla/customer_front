# Vercel Deployment Guide

## 🚀 Deploy Your React Frontend to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)
- Backend deployed to Render

## Step 1: Prepare for Deployment

### 1.1 Environment Variables
Your frontend needs these environment variables:

**For Production:**
```env
VITE_API_BASE_URL=https://customer-h9ow.onrender.com
VITE_WS_URL=https://customer-h9ow.onrender.com
```

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Import your GitHub repository**: `balajivejendla/customer_front`
5. **Configure Project**:
   - Framework Preset: **Vite**
   - Root Directory: **/** (leave default)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Environment Variables**:
   - Click "Environment Variables"
   - Add: `VITE_API_BASE_URL` = `https://customer-h9ow.onrender.com`
   - Add: `VITE_WS_URL` = `https://customer-h9ow.onrender.com`

7. **Click "Deploy"**

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add VITE_API_BASE_URL
vercel env add VITE_WS_URL

# Deploy to production
vercel --prod
```

## Step 3: Configure Backend CORS

After deployment, you'll get a Vercel URL like: `https://customer-front-xyz.vercel.app`

**Update your backend environment variables on Render:**

```env
CORS_ORIGINS=https://customer-front-xyz.vercel.app,http://localhost:5173
```

## Step 4: Test Your Deployment

1. **Visit your Vercel URL**
2. **Test registration/login**
3. **Test chat functionality**
4. **Verify WebSocket connections**

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. Go to your Vercel project settings
2. Click "Domains"
3. Add your domain (e.g., `app.yourdomain.com`)
4. Update DNS records as instructed

### 5.2 Update Backend CORS
```env
CORS_ORIGINS=https://app.yourdomain.com,https://customer-front-xyz.vercel.app,http://localhost:5173
```

## Environment Variables Reference

### Development (.env.local)
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:3001
```

### Production (Vercel Dashboard)
```env
VITE_API_BASE_URL=https://customer-h9ow.onrender.com
VITE_WS_URL=https://customer-h9ow.onrender.com
```

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check build logs in Vercel dashboard
   - Verify all dependencies are in package.json
   - Ensure no TypeScript errors

2. **API Connection Fails**
   - Verify `VITE_API_BASE_URL` is correct
   - Check backend CORS configuration
   - Ensure backend is deployed and running

3. **WebSocket Connection Fails**
   - Verify `VITE_WS_URL` matches backend URL
   - Check browser console for errors
   - Ensure backend WebSocket server is running

4. **CORS Errors**
   - Update backend `CORS_ORIGINS` with Vercel URL
   - Include both HTTP and HTTPS if needed
   - Check for trailing slashes in URLs

### Viewing Logs:
- **Vercel Dashboard** → Your Project → Functions tab
- **Browser Console** for frontend errors
- **Network tab** for API request issues

## Performance Optimization

### Automatic Optimizations:
- ✅ **CDN** - Global content delivery
- ✅ **Compression** - Gzip/Brotli compression
- ✅ **Caching** - Static asset caching
- ✅ **Image Optimization** - Automatic image optimization

### Build Optimizations:
- ✅ **Tree Shaking** - Remove unused code
- ✅ **Code Splitting** - Lazy load components
- ✅ **Minification** - Compress JavaScript/CSS

## Cost:

### Free Tier:
- **Bandwidth**: 100GB/month
- **Builds**: 6,000 minutes/month
- **Serverless Functions**: 100GB-hours/month
- **Custom Domains**: Unlimited

### Pro Tier ($20/month):
- **Bandwidth**: 1TB/month
- **Builds**: 24,000 minutes/month
- **Advanced analytics**
- **Team collaboration**

## Security:

- ✅ **HTTPS** - Automatic SSL certificates
- ✅ **Headers** - Security headers configured
- ✅ **Environment Variables** - Secure storage
- ✅ **DDoS Protection** - Built-in protection

## Monitoring:

- **Analytics** - Page views, performance metrics
- **Real User Monitoring** - Core Web Vitals
- **Error Tracking** - Runtime error monitoring
- **Build Logs** - Detailed build information

Your React frontend will be live and fast on Vercel! 🚀

## Quick Checklist:

- [ ] Repository pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Backend CORS updated with Vercel URL
- [ ] Deployment successful
- [ ] All features tested
- [ ] Custom domain configured (optional)