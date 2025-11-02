# 🏎️ Frowtch F1 Data Analytics

**Smart Formula 1 data visualization with real FastF1 API integration - Multiple deployment options**

## ✨ Features

- 🏁 **Real F1 Data:** Official timing data from FastF1 API (2018-2024)
- 📊 **Interactive Charts:** Lap time analysis with Chart.js and Plotly visualization  
- 🎯 **Real Telemetry:** Speed, throttle, and brake data from actual races
- 🌐 **Multiple Deployments:** Streamlit Cloud, Flask server, or static demo
- 📱 **Professional UI:** Racing-themed responsive design
- 🔄 **Smart Fallback:** Automatic sample data when server unavailable

## � Deployment Options

### **🎯 Option 1: Streamlit Cloud (Recommended for Portfolio)**
**Best for: Real data, 24/7 accessibility, professional portfolio showcase**

```bash
# Deploy to Streamlit Cloud for free real F1 data
streamlit run streamlit_app.py

# Then deploy to: https://share.streamlit.io
# Repository: Your GitHub repo
# Main file: streamlit_app.py
```

✅ **Live Example**: [F1 Analytics on Streamlit](https://frowtchie-f1-analytics.streamlit.app)
- Professional dashboard interface
- Real FastF1 API integration
- Interactive race analysis
- Free 24/7 hosting

### **🔧 Option 2: Local Flask Server (Full Features)**
**Best for: Development, local testing, all features**

```bash
# 1. Start the unified Flask app
.\start-app.bat

# 2. Open browser
http://localhost:5000

# 3. See "🏎️ REAL F1 DATA" indicator
# 4. Select year → race → drivers → compare!
```

### **📄 Option 3: Static Demo (No Server)**
**Best for: Quick demo, static hosting, offline use**

```bash
# Open directly in browser (no server needed)
index.html

# Will automatically show "📊 SAMPLE DATA" indicator
```

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
├── � STREAMLIT VERSION (Recommended for Cloud)
│   ├── streamlit_app.py          # Streamlit dashboard app
│   ├── requirements_streamlit.txt # Streamlit dependencies
│   └── STREAMLIT-DEPLOYMENT.md   # Streamlit Cloud deployment guide
│
├── 🌐 FLASK VERSION (Original)
│   ├── index.html                # Main web application
│   ├── app.py                    # Flask server with FastF1
│   ├── start-app.bat            # Local server startup
│   ├── js/f1-app.js             # Smart JavaScript client
│   ├── css/mystyle.css          # F1-themed styling
│   ├── requirements.txt         # Flask dependencies
│   ├── Procfile                 # Cloud deployment config
│   └── CLOUD-DEPLOYMENT.md      # Flask deployment guide
│
├── 📁 data/                      # Sample data for offline mode
├── 📁 cache/                     # FastF1 data cache (auto-created)
└── 📄 README.md                  # This file
```

## 🎯 Which Version to Use?

### **🚀 Streamlit Version** (streamlit_app.py)
**✅ Best for**: Portfolio, real users, 24/7 accessibility
- Professional dashboard interface
- Free Streamlit Cloud hosting
- Real FastF1 data integration
- Interactive widgets and charts
- Perfect for portfolio showcase

### **🌐 Flask Version** (index.html + app.py)  
**✅ Best for**: Development, customization, embedding
- Full control over UI/UX
- Custom JavaScript interactions
- Embeddable in other websites
- Original Chart.js visualizations
- Smart fallback to sample data

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