# 🏎️ Frowtch F1 Data Analytics

**Smart Formula 1 data visualization with automatic real/sample data detection**

## ✨ Features

- 🏁 **Smart Data Detection:** Automatically uses real F1 data when available, sample data offline
- 📊 **Interactive Charts:** Lap time analysis with Chart.js visualization  
- 🎯 **Real Telemetry:** Click any lap point to view speed, throttle, and brake data (real data mode)
- 🌐 **Cloud Ready:** Deploy to Render, Railway, or Heroku with zero configuration
- 📱 **Responsive Design:** Works on desktop, tablet, and mobile
- 🔄 **Offline Capable:** Graceful fallback to sample data when server unavailable

## 🚀 Quick Start

### **Option 1: With Real F1 Data (Recommended)**
```bash
# 1. Start the unified app
.\start-app.bat

# 2. Open browser
http://localhost:5000

# 3. See "🏎️ REAL F1 DATA" indicator
# 4. Select year → race → drivers → compare!
```

### **Option 2: Offline Demo**
```bash
# Open directly in browser (no server needed)
index.html

# Will automatically show "📊 SAMPLE DATA" indicator
```

## 📊 Data Sources

### **Real F1 Data Mode:**
- **FastF1 Library:** Official F1 timing data from 2020-2024
- **Race Calendars:** Complete official schedules
- **Driver Lineups:** Actual race participants only
- **Lap Times:** Real timing with pit stops and tire strategy
- **Telemetry:** GPS speed, throttle, brake data from actual races

### **Sample Data Mode:**
- **Demo Races:** Bahrain GP, Monaco GP, etc.
- **Representative Data:** Realistic lap time patterns
- **Full Functionality:** Complete UI testing capability

## 🎯 How It Works

The app intelligently detects your environment:

1. **Tests API Connection:** Checks if FastF1 server is available
2. **Real Data Mode:** Uses official F1 API when server running
3. **Sample Data Mode:** Falls back to local JSON files when offline
4. **Visual Indicators:** Clear badges show which data type is active
5. **Consistent Experience:** Same interface regardless of data source

## 🏗️ Project Structure

```
F1/
├── 📄 index.html              # Main application (unified smart version)
├── 📄 app.py                  # Flask server with FastF1 integration
├── 📄 start-app.bat          # Simple startup script
├── 📁 js/
│   └── 📄 f1-app.js          # Smart JavaScript with auto-detection
├── 📁 css/
│   └── 📄 mystyle.css        # F1-themed styling with animations
├── 📁 data/                   # Sample data for offline mode
├── 📁 cache/                  # FastF1 data cache (auto-created)
├── 📄 requirements.txt        # Python dependencies
├── 📄 Procfile                # Cloud deployment config
└── 📄 runtime.txt             # Python version specification
```

## ☁️ Cloud Deployment

### **Deploy to Render (Free):**
1. Push to GitHub
2. Connect repository to [render.com](https://render.com)
3. Auto-deploys with `app.py`
4. Get permanent URL like: `https://frowtch-f1.onrender.com`

### **Deploy to Railway (Free):**
1. Connect GitHub to [railway.app](https://railway.app)
2. One-click deployment
3. Automatic HTTPS and custom domains

See `CLOUD-DEPLOYMENT.md` for detailed instructions.

## 🔧 Development

### **Prerequisites:**
- Python 3.11+
- Git

### **Setup:**
```bash
# Clone repository
git clone https://github.com/Frowtchie/F1.git
cd F1

# Virtual environment created automatically
# Dependencies installed automatically via requirements.txt

# Start development server
.\start-app.bat
```

### **Key Components:**

#### **`app.py`** - Unified Flask Server
- FastF1 integration for real data
- Static file serving for deployment
- CORS enabled for frontend
- Health check endpoint
- Error handling and logging

#### **`js/f1-app.js`** - Smart Frontend
- Automatic API detection
- Real/sample data switching
- Interactive Chart.js integration
- Responsive dropdown menus
- Telemetry visualization

#### **`css/mystyle.css`** - F1 Racing Theme
- Custom CSS variables for F1 colors
- Glassmorphism effects and gradients
- Responsive design patterns
- Racing-inspired animations
- Professional typography

## 📈 Performance

### **Real Data Loading:**
- **First time:** 2-5 minutes (downloads official F1 data)
- **Subsequent loads:** Near instant (cached locally)
- **Cache location:** `./cache/` directory
- **Cache size:** ~50MB per race session

### **Recommended Test Races:**
- **2022 Bahrain Grand Prix** - Reliable data, good telemetry
- **2021 Monaco Grand Prix** - Interesting strategy battles
- **2020 Turkish Grand Prix** - Weather-affected race

## 🛠️ API Endpoints

When real data server is running:

```
GET  /api/years                           # Available seasons
GET  /api/races/{year}                   # Race calendar for year
GET  /api/drivers/{year}/{race}          # Drivers for specific race
GET  /api/lap-times?year={}&race={}&drivers={}  # Lap time data
GET  /api/telemetry?year={}&race={}&driver={}&lap={}  # Telemetry data
GET  /health                             # Server health check
```

## 🎉 Portfolio Ready

Perfect for showcasing:
- **Full-stack development** (Python backend + JavaScript frontend)
- **API integration** (FastF1 official F1 data)
- **Data visualization** (Chart.js interactive charts) 
- **Responsive design** (Modern CSS with animations)
- **Cloud deployment** (Production-ready with Render/Railway)
- **Smart architecture** (Automatic fallbacks and error handling)

## 📝 License

MIT License - see `LICENSE` file

## 🏁 Created by Frowtch

**A smart, unified F1 analytics application that works everywhere!** 🏎️✨

---

**Start exploring F1 data:** `.\start-app.bat` → `http://localhost:5000` 🚀