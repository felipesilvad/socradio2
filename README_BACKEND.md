# Backend Server Setup for Global Playback

## Quick Start

### **1. Install Dependencies**
```bash
npm install express cors concurrently
```

### **2. Setup Database**
```bash
# Run the global playback schema in Supabase
# Run the template data for testing
```

### **3. Start Servers**

**Option A: Run Both Together (Recommended for Development)**
```bash
npm run dev
```
This will start:
- React frontend on http://localhost:3000
- Backend API on http://localhost:3001

**Option B: Run Separately**
```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm start
```

### **4. Verify Setup**
- Frontend: http://localhost:3000
- Backend Health: http://localhost:3001/health
- API Docs: http://localhost:3001/api/playback

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App    │    │  Express API    │    │   Supabase     │
│  (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│   :3000        │    │   :3001         │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Environment Variables

Your `.env` should include:
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
```

## API Endpoints

### Playback Control
- `GET /api/playback/state/:stationId` - Get current state
- `PUT /api/playback/state/:stationId` - Update state
- `POST /api/playback/advance/:stationId` - Next song

### Real-time Sync
- `GET /api/playback/stream/:stationId` - SSE stream
- `POST /api/playback/sync/:stationId` - Register session

### Management
- `GET /api/playback/playlist/:stationId` - Get playlist
- `POST /api/playback/initialize/:stationId` - Initialize
- `GET /api/playback/history/:stationId` - Get history

## Testing

### **Test Synchronization**
1. Open multiple browser tabs to same station
2. Verify all show same song position
3. Test play/pause across tabs
4. Test song advancement

### **Test API**
```bash
# Check health
curl http://localhost:3001/health

# Get playback state
curl http://localhost:3001/api/playback/state/your-station-id
```

## Troubleshooting

### **Common Issues**

**Port Already in Use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**CORS Issues**
- Check CORS configuration in server.js
- Verify REACT_APP_API_URL in .env

**Database Connection**
- Verify Supabase credentials
- Check network connectivity

### **Development Tips**

1. **Hot Reload**: Both servers support hot reload
2. **Debug Mode**: Set NODE_ENV=development
3. **Logs**: Check console for detailed error messages
4. **Health Checks**: Monitor `/health` endpoint

## Production Deployment

### **Environment Setup**
```bash
NODE_ENV=production
PORT=3001
```

### **Process Manager**
```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "playback-api"
```

### **Reverse Proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location /api/ {
        proxy_pass http://localhost:3001;
    }
    
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

## Monitoring

### **Health Monitoring**
- `/health` endpoint for uptime checks
- Custom metrics in API responses
- Error logging and alerting

### **Performance Monitoring**
- Response time tracking
- Memory usage monitoring
- Database query performance

## Security

### **Production Considerations**
- Enable HTTPS
- Rate limiting
- Input validation
- Authentication middleware
- SQL injection prevention

---

The backend server is essential for the global playback system and must run separately from the React frontend.
