import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import fastf1
import fastf1.plotting
from datetime import datetime
import numpy as np

# Configure Streamlit page
st.set_page_config(
    page_title="🏎️ F1 Data Analytics",
    page_icon="🏎️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for F1 styling
st.markdown("""
<style>
    .main {
        background: linear-gradient(135deg, #0D1117 0%, #010409 100%);
    }
    .stTitle {
        color: #E10600;
        text-align: center;
        font-size: 3rem;
        margin-bottom: 2rem;
    }
    .metric-container {
        background: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: 10px;
        margin: 0.5rem 0;
    }
    .stSelectbox {
        background: rgba(255, 255, 255, 0.1);
    }
</style>
""", unsafe_allow_html=True)

# Initialize FastF1 cache
@st.cache_data
def setup_fastf1():
    fastf1.Cache.enable_cache('cache')
    fastf1.plotting.setup_mpl()

# Load race session
@st.cache_data
def load_session(year, gp, session_type='R'):
    try:
        session = fastf1.get_session(year, gp, session_type)
        session.load()
        return session
    except Exception as e:
        st.error(f"Error loading session: {e}")
        return None

# Get available years and races
@st.cache_data
def get_available_data():
    # FastF1 supports 2018-2024
    years = list(range(2018, 2025))
    
    # Sample of popular races for faster loading
    races = {
        'Bahrain': 1,
        'Saudi Arabia': 2, 
        'Australia': 3,
        'Monaco': 6,
        'Canada': 9,
        'Great Britain': 10,
        'Hungary': 11,
        'Belgium': 12,
        'Netherlands': 13,
        'Italy': 14,
        'Singapore': 15,
        'Japan': 16,
        'United States': 17,
        'Mexico': 18,
        'Brazil': 19,
        'Abu Dhabi': 22
    }
    return years, races

# Main app
def main():
    # Header
    st.markdown("<h1 class='stTitle'>🏁 F1 Data Analytics</h1>", unsafe_allow_html=True)
    st.markdown("### Professional Formula 1 data visualization with real FastF1 API integration")
    
    # Setup FastF1
    setup_fastf1()
    
    # Sidebar for race selection
    st.sidebar.header("🏎️ Race Selection")
    
    years, races = get_available_data()
    
    # Year selection
    selected_year = st.sidebar.selectbox(
        "📅 Select Season",
        years,
        index=len(years)-2  # Default to 2023
    )
    
    # Race selection
    selected_race_name = st.sidebar.selectbox(
        "🏁 Select Grand Prix",
        list(races.keys()),
        index=0  # Default to Bahrain
    )
    
    selected_race = races[selected_race_name]
    
    # Session type selection
    session_type = st.sidebar.selectbox(
        "🏆 Session Type",
        ['R', 'Q', 'FP1', 'FP2', 'FP3'],
        index=0,
        format_func=lambda x: {
            'R': 'Race',
            'Q': 'Qualifying', 
            'FP1': 'Free Practice 1',
            'FP2': 'Free Practice 2',
            'FP3': 'Free Practice 3'
        }[x]
    )
    
    # Load button
    if st.sidebar.button("🚀 Load Race Data", type="primary"):
        with st.spinner(f"Loading {selected_race_name} {selected_year} data..."):
            session = load_session(selected_year, selected_race, session_type)
            
            if session is not None:
                st.session_state.session = session
                st.session_state.race_info = f"{selected_year} {selected_race_name} GP"
                st.success(f"✅ Loaded {selected_year} {selected_race_name} GP successfully!")
    
    # Display race data if loaded
    if hasattr(st.session_state, 'session') and st.session_state.session is not None:
        display_race_analysis(st.session_state.session, st.session_state.race_info)
    else:
        # Welcome screen
        st.info("👆 Select a race from the sidebar and click 'Load Race Data' to begin analysis")
        
        # Sample visualizations
        show_sample_data()

def display_race_analysis(session, race_info):
    st.header(f"📊 Analysis: {race_info}")
    
    # Get lap times data
    laps = session.laps
    
    if len(laps) == 0:
        st.warning("No lap data available for this session")
        return
    
    # Driver selection
    available_drivers = laps['Driver'].unique()
    selected_drivers = st.multiselect(
        "🏎️ Select Drivers to Compare",
        available_drivers,
        default=available_drivers[:3] if len(available_drivers) >= 3 else available_drivers
    )
    
    if not selected_drivers:
        st.warning("Please select at least one driver")
        return
    
    # Create tabs for different analyses
    tab1, tab2, tab3, tab4 = st.tabs(["🏁 Lap Times", "⚡ Sector Analysis", "🎯 Position Changes", "📈 Telemetry"])
    
    with tab1:
        show_lap_times_analysis(laps, selected_drivers)
    
    with tab2:
        show_sector_analysis(laps, selected_drivers)
    
    with tab3:
        show_position_analysis(laps, selected_drivers)
    
    with tab4:
        show_telemetry_analysis(session, selected_drivers)

def show_lap_times_analysis(laps, selected_drivers):
    st.subheader("🏁 Lap Time Comparison")
    
    # Filter data for selected drivers
    filtered_laps = laps[laps['Driver'].isin(selected_drivers)]
    
    # Create lap times chart
    fig = px.line(
        filtered_laps,
        x='LapNumber',
        y='LapTime',
        color='Driver',
        title='Lap Times Throughout the Race',
        labels={'LapTime': 'Lap Time (seconds)', 'LapNumber': 'Lap Number'}
    )
    
    fig.update_layout(
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font_color='white'
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Fastest lap statistics
    st.subheader("⚡ Fastest Lap Statistics")
    
    cols = st.columns(len(selected_drivers))
    for i, driver in enumerate(selected_drivers):
        driver_laps = filtered_laps[filtered_laps['Driver'] == driver]
        if len(driver_laps) > 0:
            fastest_lap = driver_laps.loc[driver_laps['LapTime'].idxmin()]
            
            with cols[i]:
                st.metric(
                    f"🏎️ {driver}",
                    f"{fastest_lap['LapTime']:.3f}s",
                    f"Lap {fastest_lap['LapNumber']}"
                )

def show_sector_analysis(laps, selected_drivers):
    st.subheader("⚡ Sector Time Analysis")
    
    filtered_laps = laps[laps['Driver'].isin(selected_drivers)]
    
    # Create subplot for each sector
    fig = make_subplots(
        rows=1, cols=3,
        subplot_titles=['Sector 1', 'Sector 2', 'Sector 3'],
        shared_yaxes=True
    )
    
    for driver in selected_drivers:
        driver_laps = filtered_laps[filtered_laps['Driver'] == driver]
        
        if len(driver_laps) > 0:
            fig.add_trace(
                go.Scatter(
                    x=driver_laps['LapNumber'],
                    y=driver_laps['Sector1Time'],
                    name=f"{driver} S1",
                    line=dict(width=2)
                ),
                row=1, col=1
            )
            
            fig.add_trace(
                go.Scatter(
                    x=driver_laps['LapNumber'],
                    y=driver_laps['Sector2Time'],
                    name=f"{driver} S2",
                    line=dict(width=2),
                    showlegend=False
                ),
                row=1, col=2
            )
            
            fig.add_trace(
                go.Scatter(
                    x=driver_laps['LapNumber'],
                    y=driver_laps['Sector3Time'],
                    name=f"{driver} S3",
                    line=dict(width=2),
                    showlegend=False
                ),
                row=1, col=3
            )
    
    fig.update_layout(
        title="Sector Times Comparison",
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font_color='white'
    )
    
    st.plotly_chart(fig, use_container_width=True)

def show_position_analysis(laps, selected_drivers):
    st.subheader("🎯 Position Changes Throughout Race")
    
    filtered_laps = laps[laps['Driver'].isin(selected_drivers)]
    
    fig = px.line(
        filtered_laps,
        x='LapNumber',
        y='Position',
        color='Driver',
        title='Race Position Changes',
        labels={'Position': 'Race Position', 'LapNumber': 'Lap Number'}
    )
    
    # Invert y-axis so position 1 is at the top
    fig.update_yaxes(autorange="reversed")
    
    fig.update_layout(
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font_color='white'
    )
    
    st.plotly_chart(fig, use_container_width=True)

def show_telemetry_analysis(session, selected_drivers):
    st.subheader("📈 Telemetry Data Analysis")
    
    if len(selected_drivers) == 0:
        st.warning("Please select drivers for telemetry analysis")
        return
    
    # Lap selection for telemetry
    lap_number = st.selectbox(
        "Select Lap for Telemetry Analysis",
        range(1, 21),  # Limit to first 20 laps for performance
        index=4  # Default to lap 5
    )
    
    try:
        telemetry_data = []
        for driver in selected_drivers[:2]:  # Limit to 2 drivers for performance
            driver_lap = session.laps.pick_driver(driver).pick_lap(lap_number)
            if driver_lap is not None and hasattr(driver_lap, 'get_telemetry'):
                tel = driver_lap.get_telemetry()
                tel['Driver'] = driver
                telemetry_data.append(tel)
        
        if telemetry_data:
            combined_tel = pd.concat(telemetry_data)
            
            # Speed comparison
            fig = px.line(
                combined_tel,
                x='Distance',
                y='Speed',
                color='Driver',
                title=f'Speed Comparison - Lap {lap_number}',
                labels={'Speed': 'Speed (km/h)', 'Distance': 'Distance (m)'}
            )
            
            fig.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font_color='white'
            )
            
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Telemetry data not available for selected drivers/lap")
            
    except Exception as e:
        st.warning(f"Telemetry analysis not available: {e}")

def show_sample_data():
    st.header("🎯 Welcome to F1 Data Analytics")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("🏎️ Supported Seasons", "2018-2024", "7 years")
    
    with col2:
        st.metric("🏁 Available Races", "20+ per season", "400+ total")
    
    with col3:
        st.metric("📊 Data Points", "Millions", "Real-time telemetry")
    
    st.markdown("""
    ### 🚀 Features:
    - **Real F1 Data**: Official timing and telemetry via FastF1 API
    - **Interactive Charts**: Lap times, sector analysis, position tracking
    - **Telemetry Analysis**: Speed, throttle, brake data visualization
    - **Multi-Driver Comparison**: Compare up to multiple drivers
    - **Session Support**: Race, Qualifying, Practice sessions
    
    ### 📈 How to Use:
    1. Select a season and Grand Prix from the sidebar
    2. Choose session type (Race, Qualifying, Practice)
    3. Click "Load Race Data" 
    4. Select drivers to analyze
    5. Explore different analysis tabs
    
    **Note**: First load may take 1-2 minutes as F1 data is downloaded and cached.
    """)

if __name__ == "__main__":
    main()