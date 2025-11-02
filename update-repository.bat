@echo off
echo 🏎️ Updating F1 Repository with Streamlit Version...
echo.

cd "c:\Users\talib\Projects\F1"

echo 📦 Adding new Streamlit files...
git add streamlit_app.py
git add requirements_streamlit.txt  
git add STREAMLIT-DEPLOYMENT.md
git add README.md

echo 💾 Committing changes...
git commit -m "Add Streamlit Cloud version for portfolio deployment

- Added streamlit_app.py: Professional F1 dashboard with real data
- Added requirements_streamlit.txt: Streamlit dependencies  
- Added STREAMLIT-DEPLOYMENT.md: Deployment guide for Streamlit Cloud
- Updated README.md: Comprehensive guide for both Flask and Streamlit versions

Features:
- Real FastF1 API integration (2018-2024)
- Interactive lap time and telemetry analysis
- Professional Plotly visualizations
- Multi-driver race comparisons
- Ready for Streamlit Cloud deployment"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ F1 Repository Updated Successfully!
echo.
echo 📋 Next Steps:
echo 1. Go to https://share.streamlit.io  
echo 2. Deploy from your F1 repository
echo 3. Main file: streamlit_app.py
echo 4. Update your portfolio URL
echo.
pause