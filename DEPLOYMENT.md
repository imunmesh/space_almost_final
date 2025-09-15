# Deployment Guide

## Netlify Deployment

This guide explains how to deploy the AstroHELP application to Netlify.

### Project Structure for Deployment

The project is organized as follows:
```
AstroHELP/
├── backend/              # FastAPI backend (not deployed to Netlify)
├── frontend/             # Static frontend files (deployed to Netlify)
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── index.html
├── netlify.toml          # Netlify configuration
└── DEPLOYMENT.md         # This file
```

### Deployment Steps

1. **Deploy the Frontend to Netlify**
   - The frontend is a static site that can be directly deployed to Netlify
   - Netlify will automatically serve files from the `frontend/` directory

2. **Set up Backend Separately**
   - The FastAPI backend must be deployed separately (e.g., Heroku, AWS, Google Cloud)
   - Update the `API_BASE_URL` in `frontend/index.html` to point to your deployed backend

3. **Netlify Configuration**
   - The `netlify.toml` file configures:
     - Publish directory: `frontend/`
     - Redirects for API calls to your backend
     - SPA fallback for client-side routing

### Environment Variables

Set these environment variables in your Netlify deployment settings:
- `API_BASE_URL` - The URL of your deployed backend

### Custom Domain (Optional)

1. Add your custom domain in Netlify site settings
2. Update DNS records as instructed by Netlify
3. Configure SSL certificate through Netlify

### Continuous Deployment

1. Connect your Git repository to Netlify
2. Netlify will automatically deploy changes to the main branch
3. Configure build settings in Netlify to use:
   - Build command: `echo 'No build command needed for static site'`
   - Publish directory: `frontend/`

### Backend Deployment

For the backend, you can deploy to platforms like:
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure App Service

Example for Heroku deployment:
```bash
cd backend
heroku create your-app-name
heroku buildpacks:set heroku/python
git subtree push --prefix backend heroku main
```

### API Integration

After deploying the backend, update the API base URL in `frontend/index.html`:
```javascript
window.API_BASE_URL = "https://your-backend-url.com";
```

### Troubleshooting

1. **API Calls Not Working**
   - Check that your backend is deployed and accessible
   - Verify the API_BASE_URL in index.html
   - Ensure CORS is properly configured on your backend

2. **WebSocket Connections**
   - WebSockets may require special configuration on some hosting platforms
   - Check your hosting provider's documentation for WebSocket support

3. **Static Assets Not Loading**
   - Verify all paths in HTML/CSS files are relative
   - Check the browser console for 404 errors