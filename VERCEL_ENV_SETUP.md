# Vercel Environment Variables Setup

## 🚀 Ready-to-Use Environment Variables

Your backend is deployed at: **https://customer-h9ow.onrender.com**

## 📋 Copy These to Vercel Dashboard

When setting up your Vercel project, add these environment variables:

### Variable 1:
```
Name: VITE_API_BASE_URL
Value: https://customer-h9ow.onrender.com
```

### Variable 2:
```
Name: VITE_WS_URL
Value: https://customer-h9ow.onrender.com
```

## 🔧 How to Add in Vercel:

1. **Go to your Vercel project**
2. **Click "Settings" tab**
3. **Click "Environment Variables"**
4. **Click "Add New"**
5. **Enter the name and value from above**
6. **Select "Production, Preview, and Development"**
7. **Click "Save"**
8. **Repeat for the second variable**

## ✅ Verification

After adding the variables, your frontend will:
- ✅ Connect to your backend at `https://customer-h9ow.onrender.com`
- ✅ Use WebSocket at the same URL
- ✅ Handle authentication with your backend
- ✅ Send chat messages to your AI system

## 🔄 Backend CORS Update Needed

After deploying to Vercel, you'll get a URL like: `https://customer-front-xyz.vercel.app`

**Update your backend's CORS_ORIGINS environment variable on Render:**

```
CORS_ORIGINS=https://customer-front-xyz.vercel.app,http://localhost:5173
```

This allows your frontend to communicate with your backend.

## 🧪 Testing

After deployment, test:
1. **Registration** - Create a new account
2. **Login** - Sign in with credentials
3. **Chat** - Send messages and get AI responses
4. **WebSocket** - Real-time communication
5. **Theme Toggle** - Switch between light/dark modes

Your frontend is now configured to work with your deployed backend! 🎉