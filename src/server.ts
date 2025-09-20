import express from 'express';
import cors from 'cors';
import path from 'path';

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

// Mock LCD class for development
class MockLCD {
    text(row: number, col: number, message: string): void {
        console.log(`📺 LCD[${row},${col}]: ${message}`);
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

    constructor() {
        this.app = express();

        if (isDevelopment) {
            this.lcd = new MockLCD();
            this.mockSensor = new MockSensorData();
        } else {
            this.lcd = new LCD();
        }

        this.setupMiddleware();
        this.setupRoutes();
        this.startSensorPolling();
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

        // Health check endpoint
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'running',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                sensor_status: this.currentData ? 'connected' : 'disconnected'
            });
        });

        // Serve React app for all other routes
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        });
    }

    private celcToFahr(celsius: number): number {
        return (celsius * 9.0 / 5.0) + 32.0;
    }

    private formatLcdValue(value: number, decimals: number = 1): string {
        return value.toFixed(decimals).padEnd(6, ' '); // Pad for LCD formatting
    }

    private updateLCD(tempF: number, humidity: number): void {
        try {
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

    private readSensor(): void {
        if (isDevelopment) {
            // Mock sensor reading
            this.readMockSensor();
        } else {
            // Real sensor reading
            this.readRealSensor();
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

    public start(port: number = 3000): void {
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