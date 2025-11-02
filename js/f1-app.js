// F1 Data Visualization App - Unified Version
class F1App {
    constructor() {
        this.selectedYear = null;
        this.selectedRace = null;
        this.f1Calendar = {};
        this.lapChart = null;
        this.telemetryChart = null;
        
        // Smart API detection
        this.apiBaseUrl = this.detectApiUrl();
        this.availableDrivers = [];
        this.useRealData = false;
        this.isComparing = false; // Prevent multiple simultaneous comparisons
        this.isLoadingTelemetry = false; // Prevent multiple telemetry loads
        
        this.init();
    }
    
    detectApiUrl() {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocal) {
            // Check if we're running on port 5000 (cloud app) or need separate server
            if (window.location.port === '5000') {
                return '/api'; // Cloud app running on same port
            } else {
                return 'http://localhost:5000/api'; // Separate server
            }
        } else {
            return '/api'; // Production cloud deployment
        }
    }
    
    async init() {
        // Setup event listeners first - these should always work
        this.setupEventListeners();
        
        // Show initial loading
        this.showLoading('Initializing F1 Data Center...', 'main');
        
        try {
            // Test if real API is available
            await this.testApiConnection();
            await this.loadAvailableYears();
            this.populateYearDropdown();
            this.updateDataSourceIndicator();
            
            // Hide loading after initialization
            this.hideLoading('main');
        } catch (error) {
            this.hideLoading('main');
            console.error('Failed to initialize F1 Data Center:', error);
            this.showError('Failed to initialize F1 Data Center. Please refresh the page.');
        }
    }
    
    async testApiConnection() {
        try {
            // Use direct health endpoint (not under /api)
            const healthUrl = this.apiBaseUrl.replace('/api', '') + '/health';
            const response = await fetch(healthUrl, { timeout: 3000 });
            if (response.ok) {
                this.useRealData = true;
                console.log('✅ Real F1 API connected');
            }
        } catch (error) {
            this.useRealData = false;
            console.log('📊 Using sample data (API not available)');
        }
    }
    
    updateDataSourceIndicator() {
        // Add visual indicator of data source
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 12px;
            background: ${this.useRealData ? '#00D2BE' : '#FF8700'};
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        indicator.textContent = this.useRealData ? '🏎️ REAL F1 DATA' : '📊 SAMPLE DATA';
        document.body.appendChild(indicator);
        
        // Update page title
        const titleElement = document.querySelector('h1');
        if (titleElement && this.useRealData) {
            titleElement.innerHTML = '🏁 Frowtch F1 Real Data Analytics';
        }
    }
    
    async loadAvailableYears() {
        if (this.useRealData) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/years`);
                const years = await response.json();
                
                this.f1Calendar = {};
                for (const year of years) {
                    this.f1Calendar[year.toString()] = [];
                }
                return;
            } catch (error) {
                console.error('Failed to load real years, using fallback:', error);
            }
        }
        
        // Fallback to sample data
        await this.loadF1CalendarFallback();
    }
    
    async loadF1CalendarFallback() {
        try {
            const response = await fetch('data/f1-calendar.json');
            this.f1Calendar = await response.json();
        } catch (error) {
            console.error('Error loading F1 calendar:', error);
            // Final fallback
            this.f1Calendar = {
                "2022": [{"round": 1, "name": "Bahrain Grand Prix", "location": "Sakhir"}],
                "2021": [{"round": 1, "name": "Bahrain Grand Prix", "location": "Sakhir"}],
                "2020": [{"round": 1, "name": "Austrian Grand Prix", "location": "Spielberg"}]
            };
        }
    }
    
    setupEventListeners() {
        // Year dropdown click functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('.dropdown-content a[data-year]')) {
                e.preventDefault();
                const year = e.target.dataset.year;
                this.selectYear(year);
            }
        });

        // Toggle dropdowns on button click
        document.addEventListener('click', (e) => {
            if (e.target.matches('.dropbtn')) {
                e.preventDefault();
                this.toggleDropdown(e.target.parentElement);
            } else if (e.target.matches('.dropbtn-gp')) {
                e.preventDefault();
                this.toggleDropdown(e.target.parentElement);
            } else {
                // Close all dropdowns when clicking outside
                this.closeAllDropdowns();
            }
        });
    }

    toggleDropdown(dropdownElement) {
        const content = dropdownElement.querySelector('.dropdown-content');
        const isVisible = content.style.display === 'block';
        
        // Close all dropdowns first
        this.closeAllDropdowns();
        
        // Toggle the clicked dropdown
        if (!isVisible) {
            content.style.display = 'block';
            dropdownElement.classList.add('active');
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-content').forEach(content => {
            content.style.display = 'none';
        });
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
    
    populateYearDropdown() {
        const yearDropdown = document.querySelector('.dropdown-content');
        if (!yearDropdown) return;
        
        yearDropdown.innerHTML = '';
        
        Object.keys(this.f1Calendar).forEach(year => {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = year;
            link.dataset.year = year;
            yearDropdown.appendChild(link);
        });
    }
    
    async selectYear(year) {
        this.selectedYear = year;
        
        const yearBtn = document.querySelector('.dropbtn');
        if (yearBtn) {
            yearBtn.textContent = `📅 ${year}`;
        }
        
        // Show loading for GP dropdown
        const gpButton = document.querySelector('.dropbtn-gp');
        if (gpButton) {
            gpButton.textContent = '⏳ Loading Races...';
            gpButton.disabled = true;
            gpButton.style.opacity = '0.7';
        }
        
        try {
            if (!this.f1Calendar[year] || this.f1Calendar[year].length === 0) {
                if (this.useRealData) {
                    await this.loadRaceSchedule(year);
                }
            }
            
            this.populateGPDropdown(year);
            
            if (gpButton) {
                gpButton.textContent = '🏁 Select Grand Prix';
                gpButton.style.opacity = '1';
            }
        } catch (error) {
            console.error('Error loading races:', error);
            if (gpButton) {
                gpButton.textContent = '❌ Error Loading Races';
                gpButton.style.opacity = '1';
            }
        } finally {
            if (gpButton) {
                gpButton.disabled = false;
            }
        }
        
        this.selectedRace = null;
        const gpBtn = document.querySelector('.dropbtn-gp');
        if (gpBtn) {
            gpBtn.textContent = '🏁 Select Grand Prix';
        }
        
        const analysisSection = document.getElementById('race-analysis-section');
        if (analysisSection) {
            analysisSection.style.display = 'none';
        }
    }
    
    async loadRaceSchedule(year) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/races/${year}`);
            if (response.ok) {
                const races = await response.json();
                this.f1Calendar[year] = races;
            }
        } catch (error) {
            console.error(`Error loading race schedule for ${year}:`, error);
        }
    }
    
    populateGPDropdown(year) {
        const gpContent = document.querySelector('#gp-dropdown-content');
        if (!gpContent) return;
        
        gpContent.innerHTML = '';
        
        if (this.f1Calendar[year] && this.f1Calendar[year].length > 0) {
            this.f1Calendar[year].forEach(race => {
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = race.name;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.selectRace(race);
                });
                gpContent.appendChild(link);
            });
        } else {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = 'Loading races...';
            gpContent.appendChild(link);
        }
    }
    
    async selectRace(race) {
        this.selectedRace = race;
        
        const gpBtn = document.querySelector('.dropbtn-gp');
        if (gpBtn) {
            gpBtn.textContent = race.name;
        }
        
        // Show the analysis section first so we have a place to show loading
        const analysisSection = document.getElementById('race-analysis-section');
        if (analysisSection) {
            analysisSection.style.display = 'block';
        }
        
        // Show loading in the driver selection container
        const driverContainer = document.getElementById('driver-selection-container');
        if (driverContainer) {
            this.showLoading(`🏎️ Loading ${race.name} ${this.selectedYear}...`, driverContainer);
        }
        
        try {
            if (this.useRealData) {
                await this.loadAvailableDrivers();
            }
            
            await this.loadRaceData();
        } catch (error) {
            console.error('Error loading race data:', error);
            this.showError(`Failed to load ${race.name} data`);
        }
    }
    
    async loadAvailableDrivers() {
        if (!this.selectedYear || !this.selectedRace || !this.useRealData) return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/drivers/${this.selectedYear}/${encodeURIComponent(this.selectedRace.name)}`);
            if (response.ok) {
                this.availableDrivers = await response.json();
            } else {
                this.availableDrivers = this.getDefaultDrivers();
            }
        } catch (error) {
            this.availableDrivers = this.getDefaultDrivers();
        }
    }
    
    getDefaultDrivers() {
        return [
            {"code": "HAM", "name": "Lewis Hamilton", "team": "Mercedes"},
            {"code": "RUS", "name": "George Russell", "team": "Mercedes"},
            {"code": "VER", "name": "Max Verstappen", "team": "Red Bull"},
            {"code": "PER", "name": "Sergio Pérez", "team": "Red Bull"},
            {"code": "LEC", "name": "Charles Leclerc", "team": "Ferrari"},
            {"code": "SAI", "name": "Carlos Sainz", "team": "Ferrari"},
            {"code": "NOR", "name": "Lando Norris", "team": "McLaren"},
            {"code": "RIC", "name": "Daniel Ricciardo", "team": "McLaren"}
        ];
    }
    
    async loadRaceData() {
        if (!this.selectedYear || !this.selectedRace) return;
        
        // Analysis section should already be visible from selectRace
        const driverContainer = document.getElementById('driver-selection-container');
        
        // Show loading while setting up the race interface
        if (driverContainer) {
            this.showLoading(`🏗️ Setting up ${this.selectedRace.name} analysis...`, driverContainer);
        }
        
        try {
            // Only create the driver selector, not the chart yet
            // The chart will be created when drivers are compared
            this.createDriverSelector();
            
            // Clear loading after everything is set up - the createDriverSelector will replace the loading
        } catch (error) {
            console.error('Error setting up race interface:', error);
            this.showError('Failed to setup race interface');
        }
    }
    
    showLoading(message = null, container = null) {
        let targetContainer;
        
        if (container) {
            // If container is a string, treat it as an ID
            if (typeof container === 'string') {
                targetContainer = document.getElementById(container);
                if (!targetContainer) {
                    targetContainer = document.querySelector(container);
                }
            } else {
                // If container is already a DOM element
                targetContainer = container;
            }
        }
        
        // Fallback to default container
        if (!targetContainer) {
            targetContainer = this.getDriverSelectionContainer();
        }
        
        const dataType = this.useRealData ? 'real F1' : 'sample';
        const defaultMessage = `Setting up ${this.selectedRace?.name || 'race'} ${this.selectedYear || ''}...`;
        const displayMessage = message || defaultMessage;
        
        targetContainer.innerHTML = `
            <div class="loading" style="text-align: center; padding: 40px;">
                <h3 style="color: white; margin-bottom: 20px;">${displayMessage}</h3>
                <div class="spinner"></div>
                <p style="color: #ccc; margin-top: 20px;">Loading ${dataType} data...</p>
                ${this.useRealData ? '<p style="color: #888; font-size: 14px;">First time loading may take a few minutes</p>' : ''}
            </div>
        `;
    }
    
    hideLoading(container = null) {
        let targetContainer;
        
        if (container) {
            // If container is a string, treat it as an ID
            if (typeof container === 'string') {
                targetContainer = document.getElementById(container);
                if (!targetContainer) {
                    targetContainer = document.querySelector(container);
                }
            } else {
                // If container is already a DOM element
                targetContainer = container;
            }
        }
        
        // Fallback to default container
        if (!targetContainer) {
            targetContainer = this.getDriverSelectionContainer();
        }
        
        // Clear the loading content
        if (targetContainer) {
            const loadingElement = targetContainer.querySelector('.loading');
            if (loadingElement) {
                loadingElement.remove();
            }
        }
    }
    
    showError(message) {
        const container = this.getDriverSelectionContainer();
        container.innerHTML = `
            <div class="error" style="color: #ff6b6b; text-align: center; padding: 40px; background: rgba(255, 107, 107, 0.1); border-radius: 15px; border: 1px solid rgba(255, 107, 107, 0.3);">
                <h3>⚠️ Error: ${message}</h3>
                <p style="margin: 20px 0;">Please try selecting a different race or refresh the page.</p>
                ${this.useRealData ? 
                    '<p style="font-size: 14px; color: #ccc;">If using real data, ensure the server is running.</p>' :
                    '<p style="font-size: 14px; color: #ccc;">Sample data should work offline.</p>'
                }
            </div>
        `;
    }
    
    getOrCreateChartContainer() {
        let container = document.querySelector('#chart-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'chart-container';
            container.style.marginTop = '30px';
            document.body.appendChild(container);
        }
        return container;
    }
    
    getDriverSelectionContainer() {
        let container = document.querySelector('#driver-selection-container');
        if (!container) {
            container = this.getOrCreateChartContainer();
        }
        return container;
    }
    
    createDriverSelector() {
        const container = this.getDriverSelectionContainer();
        container.innerHTML = '';
        
        const buttonText = this.useRealData ? 'Compare Real Lap Times' : 'Compare Sample Lap Times';
        
        const driverSection = document.createElement('div');
        driverSection.innerHTML = `
            <h3 style="color: white; margin-top: 20px; margin-bottom: 20px; text-align: center;">Select Drivers to Compare</h3>
            <div class="driver-selector">
                <select id="driver1" class="driver-select">
                    ${this.getDriverOptions()}
                </select>
                <span style="color: white; margin: 0 20px;">vs</span>
                <select id="driver2" class="driver-select">
                    ${this.getDriverOptions()}
                </select>
                <button id="compare-btn" class="compare-button">${buttonText}</button>
            </div>
        `;
        
        container.appendChild(driverSection);
        
        setTimeout(() => {
            const driver1Select = document.getElementById('driver1');
            const driver2Select = document.getElementById('driver2');
            if (driver1Select && driver2Select) {
                driver1Select.selectedIndex = 0;
                driver2Select.selectedIndex = Math.min(1, this.availableDrivers.length - 1);
            }
            
            // Set up compare button with proper event handling
            this.setupCompareButton();
        }, 100);
    }
    
    setupCompareButton() {
        const compareBtn = document.getElementById('compare-btn');
        if (compareBtn) {
            // Remove existing onclick to prevent duplicates
            compareBtn.onclick = null;
            
            // Use onclick instead of addEventListener to automatically replace previous handlers
            compareBtn.onclick = () => this.compareLapTimes();
        }
    }
    
    getDriverOptions() {
        if (this.availableDrivers.length === 0) {
            return '<option value="">Loading drivers...</option>';
        }
        
        return this.availableDrivers.map(driver => 
            `<option value="${driver.code}">${driver.name} (${driver.code}) - ${driver.team}</option>`
        ).join('');
    }
    
    async compareLapTimes() {
        // Prevent multiple simultaneous comparisons
        if (this.isComparing) {
            console.log('Comparison already in progress...');
            return;
        }
        
        this.isComparing = true;
        
        try {
            const driver1Select = document.getElementById('driver1');
            const driver2Select = document.getElementById('driver2');
            
            if (!driver1Select || !driver2Select) return;
            
            const driver1 = driver1Select.value;
            const driver2 = driver2Select.value;
            
            if (!driver1 || !driver2) {
                alert('Please select both drivers');
                return;
            }
            
            if (driver1 === driver2) {
                alert('Please select different drivers');
                return;
            }
            
            // Show loading while comparing
            const chartContainer = this.getOrCreateChartContainer();
            this.showLoading(`🔄 Comparing ${driver1} vs ${driver2}...`, chartContainer);
            
            if (this.useRealData) {
                await this.loadRealLapTimes(driver1, driver2);
            } else {
                await this.loadSampleLapTimes(driver1, driver2);
            }
            
            // Clear any remaining loading indicators
            this.hideLoading(chartContainer);
        } finally {
            this.isComparing = false;
        }
    }
    
    async loadRealLapTimes(driver1, driver2) {
        // Ensure canvas exists before accessing it
        let canvas = document.getElementById('lapChart');
        if (!canvas) {
            console.log('Canvas not found, creating lap chart first');
            this.createLapChart();
            // Wait for DOM to update
            await new Promise(resolve => requestAnimationFrame(resolve));
            canvas = document.getElementById('lapChart');
        }
        
        if (!canvas) {
            console.error('Canvas element still not found after creating lap chart');
            return;
        }
        
        // Destroy existing chart first
        if (this.lapChart) {
            this.lapChart.destroy();
            this.lapChart = null;
        }
        
        const chartContainer = document.querySelector('.chart-section');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <h3 style="color: white;">Loading real lap data for ${driver1} vs ${driver2}...</h3>
                <div class="spinner" style="margin: 20px auto;"></div>
                <p style="color: #ccc; text-align: center;">This may take a minute for first-time data loading...</p>
            `;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/lap-times?year=${this.selectedYear}&race=${encodeURIComponent(this.selectedRace.name)}&drivers=${driver1},${driver2}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const lapData = await response.json();
            
            // Clear the loading and create the chart
            this.createLapTimeChart(lapData, driver1, driver2, true);
            
        } catch (error) {
            console.error('Error loading real lap times:', error);
            if (chartContainer) {
                chartContainer.innerHTML = `
                    <div class="error" style="text-align: center; padding: 40px; color: #ff6b6b;">
                        <h3>❌ Failed to load real data</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
    }
    
    async loadSampleLapTimes(driver1, driver2) {
        // Ensure canvas exists before proceeding
        let canvas = document.getElementById('lapChart');
        if (!canvas) {
            console.log('Canvas not found, creating lap chart first');
            this.createLapChart();
            // Wait for DOM to update
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
        
        try {
            const response = await fetch(`data/lap-times-${this.selectedYear}.json`);
            const allLapData = await response.json();
            
            // Filter for selected drivers
            const lapData = {};
            if (allLapData[driver1]) lapData[driver1] = allLapData[driver1];
            if (allLapData[driver2]) lapData[driver2] = allLapData[driver2];
            
            this.createLapTimeChart(lapData, driver1, driver2, false);
            
        } catch (error) {
            console.error('Error loading sample data:', error);
            // Generate fake data as last resort
            const fakeData = this.generateSampleLapData(driver1, driver2);
            this.createLapTimeChart(fakeData, driver1, driver2, false);
        }
    }
    
    generateSampleLapData(driver1, driver2) {
        const driver1Data = [];
        const driver2Data = [];
        
        for (let lap = 1; lap <= 20; lap++) {
            driver1Data.push({
                lap: lap,
                time: 90 + Math.random() * 5
            });
            driver2Data.push({
                lap: lap,
                time: 91 + Math.random() * 5
            });
        }
        
        return {
            [driver1]: {
                driver: { name: driver1, code: driver1, color: '#00D2BE' },
                laps: driver1Data
            },
            [driver2]: {
                driver: { name: driver2, code: driver2, color: '#FF8700' },
                laps: driver2Data
            }
        };
    }
    
    createLapTimeChart(lapData, driver1, driver2, isRealData) {
        // Ensure we have a clean chart section
        const chartSection = document.querySelector('.chart-section');
        if (chartSection) {
            // Clear any loading content and restore proper chart structure
            chartSection.innerHTML = `
                <h3>🏁 Lap Time Analysis - ${this.selectedRace.name} ${this.selectedYear}</h3>
                <div style="position: relative; height: 600px; width: 100%;">
                    <canvas id="lapChart"></canvas>
                </div>
                ${this.useRealData ? '<p class="chart-hint">Click on any lap point to view detailed telemetry data</p>' : ''}
            `;
        }
        
        // Wait for DOM to update
        setTimeout(() => {
            const canvas = document.getElementById('lapChart');
            if (!canvas) {
                console.error('Canvas not found after chart section update');
                return;
            }
            
            const ctx = canvas.getContext('2d');
            
            // Properly destroy existing chart
            if (this.lapChart) {
                this.lapChart.destroy();
                this.lapChart = null;
            }
            
            if (!lapData || typeof lapData !== 'object') {
                alert('Invalid data received. Please try again.');
                return;
            }
            
            this.renderChart(ctx, lapData, driver1, driver2, isRealData);
        }, 100);
    }
    
    renderChart(ctx, lapData, driver1, driver2, isRealData) {
        const datasets = [];
        
        Object.keys(lapData).forEach(driverCode => {
            const driverData = lapData[driverCode];
            
            if (!driverData || !driverData.driver || !Array.isArray(driverData.laps)) {
                return;
            }
            
            console.log(`Processing driver ${driverCode}:`, driverData.laps.length, 'total laps');
            
            const validLaps = driverData.laps.filter(lap => 
                lap && typeof lap.lap === 'number' && typeof lap.time === 'number' && lap.time > 0
            );
            
            console.log(`Valid laps for ${driverCode}:`, validLaps.length);
            console.log('Lap numbers:', validLaps.map(lap => lap.lap));
            console.log('Lap times:', validLaps.map(lap => lap.time));
            
            if (validLaps.length === 0) return;
            
            datasets.push({
                label: `${driverData.driver.name} (${driverCode})`,
                data: validLaps.map(lap => ({ x: lap.lap, y: lap.time })),
                borderColor: driverData.driver.color || '#CCCCCC',
                backgroundColor: (driverData.driver.color || '#CCCCCC') + '20',
                fill: false,
                tension: 0.1,
                pointRadius: 6,
                pointHoverRadius: 10,
                pointBackgroundColor: driverData.driver.color || '#CCCCCC',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                borderWidth: 4
            });
        });
        
        if (datasets.length === 0) {
            alert('No valid lap data found. Please try different drivers.');
            return;
        }
        
        const dataTypeText = isRealData ? 'Real F1 Data' : 'Sample Data';
        
        this.lapChart = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 20
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Lap Times - ${this.selectedRace.name} ${this.selectedYear} (${dataTypeText})`,
                        color: '#ffffff',
                        font: { size: 18, family: 'Orbitron' }
                    },
                    legend: {
                        labels: { color: '#ffffff', font: { family: 'Rajdhani' } }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: { display: true, text: 'Lap Number', color: '#ffffff' },
                        ticks: { 
                            color: '#ffffff',
                            stepSize: 1,
                            callback: function(value) {
                                return Math.round(value);
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        min: 1,
                        beginAtZero: false
                    },
                    y: {
                        title: { display: true, text: 'Lap Time (seconds)', color: '#ffffff' },
                        ticks: { 
                            color: '#ffffff',
                            callback: function(value) {
                                const minutes = Math.floor(value / 60);
                                const seconds = (value % 60).toFixed(3);
                                return `${minutes}:${seconds.padStart(6, '0')}`;
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                onClick: isRealData ? (event, elements) => {
                    if (elements.length > 0) {
                        const datasetIndex = elements[0].datasetIndex;
                        const dataIndex = elements[0].index;
                        const dataset = this.lapChart.data.datasets[datasetIndex];
                        const lapNumber = dataset.data[dataIndex].x;
                        const driverCode = dataset.label.match(/\(([^)]+)\)/)[1];
                        
                        this.loadTelemetry(driverCode, lapNumber);
                    }
                } : undefined
            }
        });
    }
    
    createLapChart() {
        const chartContainer = this.getOrCreateChartContainer();
        
        // Show the chart container now that we're adding content
        chartContainer.style.display = 'block';
        
        // Clear ALL content from the container (including loading indicators)
        chartContainer.innerHTML = '';
        
        const chartSection = document.createElement('div');
        chartSection.className = 'chart-section';
        chartSection.innerHTML = `
            <h3>🏁 Lap Time Analysis - ${this.selectedRace.name} ${this.selectedYear}</h3>
            <div style="position: relative; height: 600px; width: 100%;">
                <canvas id="lapChart"></canvas>
            </div>
            ${this.useRealData ? '<p class="chart-hint">Click on any lap point to view detailed telemetry data</p>' : ''}
        `;
        
        chartContainer.appendChild(chartSection);
    }
    
    async loadTelemetry(driverCode, lapNumber) {
        if (!this.useRealData) return;
        
        // Prevent multiple simultaneous telemetry loads
        if (this.isLoadingTelemetry) {
            console.log('Telemetry load already in progress...');
            return;
        }
        
        this.isLoadingTelemetry = true;
        console.log(`Loading telemetry for driver ${driverCode}, lap ${lapNumber}`);
        
        // Show loading for telemetry
        const chartContainer = this.getOrCreateChartContainer();
        const existingTelemetry = chartContainer.querySelector('.telemetry-section');
        if (existingTelemetry) {
            existingTelemetry.innerHTML = `
                <div class="loading" style="text-align: center; padding: 40px;">
                    <h3 style="color: white; margin-bottom: 20px;">📊 Loading Telemetry for ${driverCode} Lap ${lapNumber}...</h3>
                    <div class="spinner"></div>
                    <p style="color: #ccc; margin-top: 20px;">Fetching detailed lap data...</p>
                </div>
            `;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/telemetry?year=${this.selectedYear}&race=${encodeURIComponent(this.selectedRace.name)}&driver=${driverCode}&lap=${lapNumber}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            
            const telemetryData = await response.json();
            this.createTelemetryChart(telemetryData);
            
        } catch (error) {
            console.error('Error loading telemetry:', error);
            
            // Show error in telemetry section
            if (existingTelemetry) {
                existingTelemetry.innerHTML = `
                    <div class="error" style="text-align: center; padding: 40px; color: #ff6b6b;">
                        <h3>❌ Failed to load telemetry</h3>
                        <p>Could not load telemetry data for ${driverCode} lap ${lapNumber}</p>
                        <p style="font-size: 14px; color: #ccc;">Error: ${error.message}</p>
                    </div>
                `;
            }
        } finally {
            this.isLoadingTelemetry = false;
        }
    }
    
    createTelemetryChart(telemetryData) {
        console.log('Creating telemetry chart for:', telemetryData.driver, 'lap', telemetryData.lap);
        
        // Destroy any existing telemetry chart first
        if (this.telemetryChart) {
            console.log('Destroying existing telemetry chart');
            this.telemetryChart.destroy();
            this.telemetryChart = null;
        }
        
        const chartContainer = this.getOrCreateChartContainer();
        
        const existingTelemetry = chartContainer.querySelector('.telemetry-section');
        if (existingTelemetry) {
            console.log('Removing existing telemetry chart container');
            existingTelemetry.remove();
        }
        
        // Add a small delay to ensure DOM cleanup
        setTimeout(() => {
            this.createTelemetryChartDelayed(telemetryData, chartContainer);
        }, 100);
    }
    
    createTelemetryChartDelayed(telemetryData, chartContainer) {
        console.log('Creating delayed telemetry chart');
        
        const telemetrySection = document.createElement('div');
        telemetrySection.className = 'telemetry-section';
        telemetrySection.innerHTML = `
            <h3>📊 Telemetry - ${telemetryData.driver} Lap ${telemetryData.lap}</h3>
            <div style="position: relative; height: 550px; width: 100%; max-height: 550px; overflow: hidden;">
                <canvas id="telemetryChart" style="max-height: 500px !important;"></canvas>
            </div>
        `;
        
        chartContainer.appendChild(telemetrySection);
        
        // Wait for DOM to update
        requestAnimationFrame(() => {
            const canvas = document.getElementById('telemetryChart');
            if (!canvas) {
                console.error('Telemetry canvas not found!');
                return;
            }
            
            const ctx = canvas.getContext('2d');
            
            // Double-check for existing chart
            if (this.telemetryChart) {
                this.telemetryChart.destroy();
                this.telemetryChart = null;
            }
            
            const telemetry = telemetryData.telemetry;
            
            console.log('Telemetry data sample:', telemetry.slice(0, 5));
            
            // Calculate actual data range for proper scaling
            const distances = telemetry.map(p => p.distance);
            const minDistance = Math.min(...distances);
            const maxDistance = Math.max(...distances);
            
            console.log('Distance range:', minDistance, 'to', maxDistance);
            
            this.telemetryChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [
                        {
                            label: 'Speed (km/h)',
                            data: telemetry.map(point => ({ x: point.distance, y: point.speed })),
                            borderColor: '#FF6B35', // Orange-red for speed
                            backgroundColor: '#FF6B3520',
                            yAxisID: 'y',
                            tension: 0.1,
                            borderWidth: 3,
                            pointRadius: 2,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'Throttle (%)',
                            data: telemetry.map(point => ({ x: point.distance, y: point.throttle })),
                            borderColor: '#00C896', // Teal-green for throttle
                            backgroundColor: '#00C89620',
                            yAxisID: 'y1',
                            tension: 0.1,
                            borderWidth: 3,
                            pointRadius: 2,
                            pointHoverRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: 20
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: `${telemetryData.driver} - Lap ${telemetryData.lap} Telemetry`,
                            color: '#ffffff',
                            font: { size: 16, family: 'Orbitron' }
                        },
                        legend: {
                            labels: { color: '#ffffff', font: { family: 'Rajdhani' } }
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            title: { display: true, text: 'Distance (m)', color: '#ffffff' },
                            ticks: { 
                                color: '#ffffff',
                                callback: function(value) {
                                    return Math.round(value) + 'm';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            min: minDistance,
                            max: maxDistance,
                            beginAtZero: false
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: 'Speed (km/h)', color: '#ffffff' },
                            ticks: { color: '#ffffff' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: { display: true, text: 'Throttle (%)', color: '#ffffff' },
                            ticks: { color: '#ffffff' },
                            grid: { drawOnChartArea: false }
                        }
                    }
                }
            });
            
            console.log('Telemetry chart created successfully');
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new F1App();
});