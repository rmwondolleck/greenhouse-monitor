// Load environment variables from .env file
import dotenv from 'dotenv';

// Load environment variables as early as possible
// This ensures they're available for the entire application
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import { execSync } from 'child_process';

// Configuration
const config = {
    dataDirectory: process.env.GREENHOUSE_DATA_DIR || './data',
    dataFilename: 'greenhouse-data.json',
    maxDataEntries: parseInt(process.env.MAX_DATA_ENTRIES || '8760'), // 1 year of hourly data
    dataSaveInterval: parseInt(process.env.DATA_SAVE_INTERVAL || '300000'), // 5 minutes in ms
    cpuTempThreshold: parseInt(process.env.CPU_TEMP_THRESHOLD || '80'), // Celsius
    lcdSleepStart: parseInt(process.env.LCD_SLEEP_START || '21'), // 9 PM
    lcdSleepEnd: parseInt(process.env.LCD_SLEEP_END || '9'), // 9 AM
    port: parseInt(process.env.PORT || '3000')
};

// Check if we're running on Raspberry Pi or in development
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.RASPBERRY_PI;

// Conditionally import hardware libraries
let sensor: any;
let LCD: any;

if (isDevelopment) {
    console.log('🔧 Running in DEVELOPMENT mode - using mocked hardware');
} else {
    console.log('🔌 Running in PRODUCTION mode - using real hardware');
    try {
        sensor = require("node-dht-sensor");
        LCD = require('@oawu/lcd1602');
    } catch (error) {
        console.error('❌ Failed to load hardware libraries:', error);
        process.exit(1);
    }
}

interface SensorData {
    temperature: number;
    humidity: number;
    lastUpdated: string;
}

interface PiSystemData {
    cpuTemp: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
}

interface DataPoint {
    timestamp: string;
    temperature: number;
    humidity: number;
    cpuTemp?: number;
}

// Mock LCD class for development
class MockLCD {
    text(row: number, col: number, message: string): void {
        console.log(`📺 LCD[${row},${col}]: ${message}`);
    }
}

// Data storage manager
class DataLogger {
    private dataFile: string;
    private maxEntries: number;

    constructor(dataDirectory: string = config.dataDirectory, maxEntries: number = config.maxDataEntries) {
        this.dataFile = path.join(dataDirectory, config.dataFilename);
        this.maxEntries = maxEntries;
        this.ensureDataDirectory();
        console.log(`📁 Data storage initialized: ${this.dataFile}`);
    }

    private ensureDataDirectory(): void {
        const dir = path.dirname(this.dataFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📂 Created data directory: ${dir}`);
        }
    }

    public getDataFilePath(): string {
        return this.dataFile;
    }

    public getDataDirectory(): string {
        return path.dirname(this.dataFile);
    }

    private getNextScheduledTimestamp(): string {
        const now = new Date();
        const saveIntervalMinutes = config.dataSaveInterval / (1000 * 60); // Convert to minutes

        // Round to the next scheduled interval
        const currentMinute = now.getMinutes();
        const currentSecond = now.getSeconds();

        // Calculate next scheduled minute (e.g., if saving every 5 min: 0, 5, 10, 15, etc.)
        const nextScheduledMinute = Math.ceil(currentMinute / saveIntervalMinutes) * saveIntervalMinutes;

        // Create timestamp for the next scheduled time
        const scheduledTime = new Date(now);
        if (nextScheduledMinute >= 60) {
            scheduledTime.setHours(scheduledTime.getHours() + 1);
            scheduledTime.setMinutes(nextScheduledMinute - 60);
        } else {
            scheduledTime.setMinutes(nextScheduledMinute);
        }
        scheduledTime.setSeconds(0);
        scheduledTime.setMilliseconds(0);

        return scheduledTime.toISOString();
    }

    private shouldSaveAtThisTime(): boolean {
        const now = new Date();
        const saveIntervalMinutes = config.dataSaveInterval / (1000 * 60);

        // Check if we're at a scheduled save time (within 30 seconds)
        const currentMinute = now.getMinutes();
        const currentSecond = now.getSeconds();

        // Is current minute divisible by save interval AND are we in the first 30 seconds?
        return (currentMinute % saveIntervalMinutes === 0) && (currentSecond < 30);
    }

    public shouldSaveNow(lastSaveTime: number): boolean {
        const now = Date.now();
        const timeSinceLastSave = now - lastSaveTime;

        // Don't save too frequently (minimum 4.5 minutes between saves)
        if (timeSinceLastSave < (config.dataSaveInterval * 0.9)) {
            return false;
        }

        // Save if we're at a scheduled time or if it's been too long
        return this.shouldSaveAtThisTime() || (timeSinceLastSave >= config.dataSaveInterval);
    }

    private loadData(): DataPoint[] {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
                return Array.isArray(data) ? data : [];
            }
        } catch (error) {
            console.error('Error loading data file:', error);
        }
        return [];
    }

    public saveDataPoint(temperature: number, humidity: number, cpuTemp?: number): void {
        const dataPoint: DataPoint = {
            timestamp: this.getNextScheduledTimestamp(),
            temperature,
            humidity,
            cpuTemp
        };

        const data = this.loadData();

        // Avoid duplicate timestamps (in case of multiple saves in same interval)
        const existingIndex = data.findIndex(point => point.timestamp === dataPoint.timestamp);
        if (existingIndex >= 0) {
            // Update existing entry instead of adding duplicate
            data[existingIndex] = dataPoint;
            console.log(`📝 Updated existing data point for ${dataPoint.timestamp}`);
        } else {
            data.push(dataPoint);
            console.log(`📝 Added new data point for ${dataPoint.timestamp}`);
        }

        // Keep only the most recent entries
        if (data.length > this.maxEntries) {
            data.splice(0, data.length - this.maxEntries);
        }

        try {
            fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    public getHistoricalData(hours: number = 24): DataPoint[] {
        const data = this.loadData();
        const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
        return data.filter(point => new Date(point.timestamp) >= cutoff);
    }

    public getDataSummary(): { count: number; oldest: string | null; newest: string | null } {
        const data = this.loadData();
        return {
            count: data.length,
            oldest: data.length > 0 ? data[0].timestamp : null,
            newest: data.length > 0 ? data[data.length - 1].timestamp : null
        };
    }
}

// System monitoring for Raspberry Pi
class PiMonitor {
    public static getCpuTemperature(): number {
        if (isDevelopment) {
            // Mock CPU temp for development
            return 45 + Math.random() * 10; // 45-55°C
        }

        try {
            const temp = execSync('cat /sys/class/thermal/thermal_zone0/temp', { encoding: 'utf8' });
            return parseInt(temp.trim()) / 1000; // Convert millidegrees to degrees Celsius
        } catch (error) {
            console.error('Error reading CPU temperature:', error);
            return 0;
        }
    }

    public static getSystemStats(): PiSystemData {
        if (isDevelopment) {
            return {
                cpuTemp: this.getCpuTemperature(),
                cpuUsage: Math.random() * 50, // 0-50% CPU usage
                memoryUsage: 30 + Math.random() * 40, // 30-70% memory usage
                diskUsage: 25 + Math.random() * 25, // 25-50% disk usage
                uptime: process.uptime()
            };
        }

        try {
            // Get CPU usage
            const loadavg = fs.readFileSync('/proc/loadavg', 'utf8').split(' ')[0];
            const cpuUsage = parseFloat(loadavg) * 100;

            // Get memory usage
            const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
            const totalMem = parseInt(meminfo.match(/MemTotal:\s+(\d+)/)?.[1] || '0');
            const availMem = parseInt(meminfo.match(/MemAvailable:\s+(\d+)/)?.[1] || '0');
            const memoryUsage = ((totalMem - availMem) / totalMem) * 100;

            // Get disk usage
            const diskInfo = execSync('df / | tail -1', { encoding: 'utf8' });
            const diskUsage = parseInt(diskInfo.split(/\s+/)[4].replace('%', ''));

            return {
                cpuTemp: this.getCpuTemperature(),
                cpuUsage,
                memoryUsage,
                diskUsage,
                uptime: process.uptime()
            };
        } catch (error) {
            console.error('Error getting system stats:', error);
            return {
                cpuTemp: this.getCpuTemperature(),
                cpuUsage: 0,
                memoryUsage: 0,
                diskUsage: 0,
                uptime: process.uptime()
            };
        }
    }

    public static checkCpuOverheat(threshold: number = 80): boolean {
        const temp = this.getCpuTemperature();
        return temp > threshold;
    }
}

// Mock sensor data generator
class MockSensorData {
    private baseTemp = 75; // Base temperature in Fahrenheit
    private baseHumidity = 55; // Base humidity percentage
    private lastTemp = this.baseTemp;
    private lastHumidity = this.baseHumidity;

    generateRealisticData(): { temperature: number; humidity: number } {
        // Generate realistic variations (small changes from last reading)
        const tempChange = (Math.random() - 0.5) * 2; // ±1°F change
        const humidityChange = (Math.random() - 0.5) * 4; // ±2% change

        // Apply constraints to keep values realistic
        this.lastTemp = Math.max(65, Math.min(85, this.lastTemp + tempChange));
        this.lastHumidity = Math.max(35, Math.min(75, this.lastHumidity + humidityChange));

        // Convert temp to Celsius for consistent processing (will be converted back)
        const tempCelsius = (this.lastTemp - 32) * 5 / 9;

        return {
            temperature: tempCelsius,
            humidity: this.lastHumidity
        };
    }
}

class GreenhouseController {
    private app: express.Application;
    private lcd: any;
    private currentData: SensorData | null = null;
    private sensorError: string | null = null;
    private mockSensor: MockSensorData | null = null;
    private dataLogger: DataLogger;
    private lastDataSave: number = 0;

    constructor() {
        this.app = express();
        this.dataLogger = new DataLogger();

        if (isDevelopment) {
            this.lcd = new MockLCD();
            this.mockSensor = new MockSensorData();
        } else {
            this.lcd = new LCD();
        }

        this.setupMiddleware();
        this.setupRoutes();
        this.startSensorPolling();
        this.startSystemMonitoring();
        this.logConfiguration();
    }

    private logConfiguration(): void {
        console.log('🔧 Greenhouse Monitor Configuration:');
        console.log(`   Data Directory: ${config.dataDirectory}`);
        console.log(`   Data File: ${this.dataLogger.getDataFilePath()}`);
        console.log(`   Max Data Entries: ${config.maxDataEntries}`);
        console.log(`   Data Save Interval: ${config.dataSaveInterval / 1000}s (${config.dataSaveInterval / 60000} minutes)`);
        console.log(`   Save Schedule: Every ${config.dataSaveInterval / 60000} minutes on the clock (e.g., :00, :05, :10, :15...)`);
        console.log(`   LCD Sleep Hours: ${config.lcdSleepStart}:00 - ${config.lcdSleepEnd}:00`);
        console.log(`   CPU Temp Threshold: ${config.cpuTempThreshold}°C`);
        console.log(`   Server Port: ${config.port}`);
        console.log(`   Mode: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);

        // Show next few scheduled save times
        const now = new Date();
        const saveIntervalMinutes = config.dataSaveInterval / (1000 * 60);
        console.log(`   Next scheduled saves:`);
        for (let i = 0; i < 3; i++) {
            const futureTime = new Date(now);
            const currentMinute = futureTime.getMinutes();
            const nextScheduledMinute = Math.ceil(currentMinute / saveIntervalMinutes) * saveIntervalMinutes + (i * saveIntervalMinutes);

            if (nextScheduledMinute >= 60) {
                futureTime.setHours(futureTime.getHours() + Math.floor(nextScheduledMinute / 60));
                futureTime.setMinutes(nextScheduledMinute % 60);
            } else {
                futureTime.setMinutes(nextScheduledMinute);
            }
            futureTime.setSeconds(0);
            futureTime.setMilliseconds(0);

            console.log(`     • ${futureTime.toLocaleTimeString()}`);
        }
    }

    private setupMiddleware(): void {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('dist')); // Serve React build files
    }

    private setupRoutes(): void {
        // API route for sensor data
        this.app.get('/api/sensor-data', (req, res) => {
            if (this.currentData) {
                res.json({
                    temperature: this.currentData.temperature.toFixed(1),
                    humidity: this.currentData.humidity.toFixed(1),
                    lastUpdated: this.currentData.lastUpdated,
                    status: 'connected'
                });
            } else {
                res.status(500).json({
                    error: this.sensorError || 'No sensor data available',
                    status: 'disconnected'
                });
            }
        });

        // Pi system monitoring endpoint
        this.app.get('/api/system-stats', (req, res) => {
            try {
                const systemStats = PiMonitor.getSystemStats();
                res.json({
                    ...systemStats,
                    cpuTempF: (systemStats.cpuTemp * 9/5 + 32).toFixed(1), // Convert to Fahrenheit
                    status: 'ok',
                    overheat: PiMonitor.checkCpuOverheat(config.cpuTempThreshold)
                });
            } catch (error) {
                res.status(500).json({ error: 'Failed to get system stats' });
            }
        });

        // Historical data endpoint
        this.app.get('/api/historical-data', (req, res) => {
            try {
                const hours = parseInt(req.query.hours as string) || 24;
                const data = this.dataLogger.getHistoricalData(hours);
                const summary = this.dataLogger.getDataSummary();

                res.json({
                    data,
                    summary,
                    hours
                });
            } catch (error) {
                res.status(500).json({ error: 'Failed to get historical data' });
            }
        });

        // Configuration endpoint
        this.app.get('/api/config', (req, res) => {
            const saveIntervalMinutes = config.dataSaveInterval / (1000 * 60);
            const now = new Date();
            const nextSave = new Date(now);
            const currentMinute = nextSave.getMinutes();
            const nextScheduledMinute = Math.ceil(currentMinute / saveIntervalMinutes) * saveIntervalMinutes;

            if (nextScheduledMinute >= 60) {
                nextSave.setHours(nextSave.getHours() + 1);
                nextSave.setMinutes(nextScheduledMinute - 60);
            } else {
                nextSave.setMinutes(nextScheduledMinute);
            }
            nextSave.setSeconds(0);
            nextSave.setMilliseconds(0);

            res.json({
                dataDirectory: config.dataDirectory,
                dataFile: this.dataLogger.getDataFilePath(),
                maxDataEntries: config.maxDataEntries,
                dataSaveIntervalSeconds: config.dataSaveInterval / 1000,
                dataSaveIntervalMinutes: saveIntervalMinutes,
                saveSchedule: `Every ${saveIntervalMinutes} minutes on the clock`,
                nextScheduledSave: nextSave.toISOString(),
                lcdSleepHours: `${config.lcdSleepStart}:00 - ${config.lcdSleepEnd}:00`,
                cpuTempThreshold: config.cpuTempThreshold,
                mode: isDevelopment ? 'development' : 'production'
            });
        });

        // Health check endpoint
        this.app.get('/api/health', (req, res) => {
            const systemStats = PiMonitor.getSystemStats();
            res.json({
                status: 'running',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                sensor_status: this.currentData ? 'connected' : 'disconnected',
                cpu_temp: systemStats.cpuTemp,
                overheat_warning: PiMonitor.checkCpuOverheat(config.cpuTempThreshold),
                lcd_sleep: this.isLcdSleepTime()
            });
        });

        // Serve React app for all other routes
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });
    }

    private celcToFahr(celsius: number): number {
        return (celsius * 9.0 / 5.0) + 32.0;
    }

    private formatLcdValue(value: number, decimals: number = 1): string {
        return value.toFixed(decimals).padEnd(6, ' '); // Pad for LCD formatting
    }

    private isLcdSleepTime(): boolean {
        const now = new Date();
        const hour = now.getHours();
        // Sleep between configured hours (default: 9 PM to 9 AM)
        return hour >= config.lcdSleepStart || hour < config.lcdSleepEnd;
    }

    private updateLCD(tempF: number, humidity: number): void {
        try {
            if (this.isLcdSleepTime()) {
                // Clear LCD during sleep hours to prevent burn-in
                this.lcd.text(0, 0, '                '); // 16 spaces
                this.lcd.text(1, 0, '                '); // 16 spaces
                return;
            }

            const tempStr = this.formatLcdValue(tempF, 1);
            const humidityStr = this.formatLcdValue(humidity, 1);

            this.lcd.text(0, 0, `Temp: ${tempStr}F`);
            this.lcd.text(1, 0, `Hum: ${humidityStr}%`);
        } catch (error) {
            console.error('LCD update error:', error);
        }
    }

    private startSensorPolling(): void {
        console.log('Starting sensor polling...');

        // Initial read
        this.readSensor();

        // Poll every 5 seconds
        setInterval(() => {
            this.readSensor();
        }, 5000);
    }

    private startSystemMonitoring(): void {
        // Check system stats every 30 seconds
        setInterval(() => {
            const systemStats = PiMonitor.getSystemStats();

            // Log CPU temperature warnings
            if (systemStats.cpuTemp > 70) {
                console.warn(`🌡️ CPU Temperature Warning: ${systemStats.cpuTemp.toFixed(1)}°C`);
            }

            // Check for overheat condition
            if (PiMonitor.checkCpuOverheat(config.cpuTempThreshold)) {
                console.error(`🚨 CPU OVERHEAT DETECTED: ${systemStats.cpuTemp.toFixed(1)}°C - Consider shutdown!`);

                // Optional: Implement auto-shutdown (uncomment to enable)
                // console.error('🛑 Auto-shutdown triggered due to overheating');
                // execSync('sudo shutdown -h now');
            }
        }, 30000);
    }

    private readSensor(): void {
        if (isDevelopment) {
            // Mock sensor reading
            this.readMockSensor();
        } else {
            // Real sensor reading
            this.readRealSensor();
        }

        // Save data at scheduled intervals (aligned to clock)
        const now = Date.now();
        if (this.dataLogger.shouldSaveNow(this.lastDataSave) && this.currentData) {
            const systemStats = PiMonitor.getSystemStats();
            this.dataLogger.saveDataPoint(
                this.currentData.temperature,
                this.currentData.humidity,
                systemStats.cpuTemp
            );
            this.lastDataSave = now;
            console.log(`💾 Data saved to ${this.dataLogger.getDataFilePath()}`);
        }
    }

    private readMockSensor(): void {
        try {
            const mockData = this.mockSensor!.generateRealisticData();
            const tempF = this.celcToFahr(mockData.temperature);

            // Simulate occasional sensor errors (5% chance)
            if (Math.random() < 0.05) {
                throw new Error('Mock sensor connection timeout');
            }

            // Update internal data
            this.currentData = {
                temperature: tempF,
                humidity: mockData.humidity,
                lastUpdated: new Date().toISOString()
            };

            this.sensorError = null;

            // Update LCD display
            this.updateLCD(tempF, mockData.humidity);

            // Log to console with mock indicator
            console.log(`🤖 MOCK ${new Date().toLocaleTimeString()} - Temp: ${tempF.toFixed(1)}°F, Humidity: ${mockData.humidity.toFixed(1)}%`);

        } catch (error: any) {
            this.sensorError = `Mock sensor error: ${error.message}`;
            console.error('🤖 Mock sensor error:', this.sensorError);

            // Display error on LCD
            try {
                this.lcd.text(0, 0, 'Mock Sensor Err');
                this.lcd.text(1, 0, 'Check Dev Mode ');
            } catch (lcdError) {
                console.error('Mock LCD error display failed:', lcdError);
            }
        }
    }

    private readRealSensor(): void {
        sensor.read(11, 4, (err: any, temperature: number, humidity: number) => {
            if (!err && temperature !== null && humidity !== null) {
                const tempF = this.celcToFahr(temperature);

                // Update internal data
                this.currentData = {
                    temperature: tempF,
                    humidity: humidity,
                    lastUpdated: new Date().toISOString()
                };

                this.sensorError = null;

                // Update LCD display
                this.updateLCD(tempF, humidity);

                // Log to console
                console.log(`🌡️ REAL ${new Date().toLocaleTimeString()} - Temp: ${tempF.toFixed(1)}°F, Humidity: ${humidity.toFixed(1)}%`);

            } else {
                this.sensorError = `Sensor read error: ${err?.message || 'Unknown error'}`;
                console.error('🌡️ Real sensor error:', this.sensorError);

                // Display error on LCD
                try {
                    this.lcd.text(0, 0, 'Sensor Error   ');
                    this.lcd.text(1, 0, 'Check Connect  ');
                } catch (lcdError) {
                    console.error('LCD error display failed:', lcdError);
                }
            }
        });
    }

    public start(port: number = config.port): void {
        this.app.listen(port, () => {
            console.log(`🌱 Greenhouse server running on port ${port}`);
            console.log(`📊 Dashboard: http://localhost:${port}`);
            console.log(`🔌 API endpoint: http://localhost:${port}/api/sensor-data`);
            console.log(`🔧 Mode: ${isDevelopment ? 'DEVELOPMENT (mocked hardware)' : 'PRODUCTION (real hardware)'}`);
        });
    }

    // Graceful shutdown
    public setupGracefulShutdown(): void {
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down greenhouse server...');
            try {
                if (isDevelopment) {
                    console.log('🤖 Mock LCD: Goodbye message displayed');
                } else {
                    this.lcd.text(0, 0, 'Server Off     ');
                    this.lcd.text(1, 0, 'Goodbye!       ');
                }
            } catch (error) {
                console.error('LCD shutdown message failed:', error);
            }
            process.exit(0);
        });
    }
}

// Create and start the server
const greenhouse = new GreenhouseController();
greenhouse.setupGracefulShutdown();
greenhouse.start(process.env.PORT ? parseInt(process.env.PORT) : 3000);

export default GreenhouseController;