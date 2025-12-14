/**
 * MQTT Client for HomeAssistant Integration
 * Handles connection to MQTT broker and publishes sensor data
 * Implements HomeAssistant MQTT Discovery protocol
 */

import * as mqtt from 'mqtt';
import { MQTTConfig, MQTTClientStats, HADiscoveryConfig, HADevice, EnvironmentalState } from './mqtt-types';

export class MQTTClient {
    private client: mqtt.MqttClient | null = null;
    private config: MQTTConfig;
    private stats: MQTTClientStats;
    private reconnectDelay: number;
    private reconnectTimer: NodeJS.Timeout | null = null;

    constructor(config: MQTTConfig) {
        this.config = config;
        this.stats = {
            connected: false,
            totalSent: 0,
            totalFailed: 0,
            lastPublish: null,
            lastError: null,
        };
        this.reconnectDelay = config.reconnect.initialDelay;
    }

    /**
     * Connect to MQTT broker
     */
    public async connect(): Promise<void> {
        if (!this.config.enabled) {
            console.log('📡 MQTT is disabled in configuration');
            return;
        }

        console.log(`📡 Connecting to MQTT broker: ${this.config.broker.host}:${this.config.broker.port}`);

        const options: mqtt.IClientOptions = {
            clientId: this.config.clientId,
            username: this.config.broker.username,
            password: this.config.broker.password,
            clean: true,
            reconnectPeriod: 0, // We'll handle reconnection manually
            connectTimeout: 10000, // 10 seconds
        };

        try {
            this.client = mqtt.connect(
                `mqtt://${this.config.broker.host}:${this.config.broker.port}`,
                options
            );

            this.setupEventHandlers();
        } catch (error) {
            console.error('❌ Error creating MQTT client:', error);
            this.stats.lastError = error instanceof Error ? error.message : String(error);
            this.scheduleReconnect();
        }
    }

    /**
     * Setup MQTT event handlers
     */
    private setupEventHandlers(): void {
        if (!this.client) return;

        this.client.on('connect', () => {
            console.log('✅ MQTT connected successfully');
            this.stats.connected = true;
            this.stats.lastError = null;
            this.reconnectDelay = this.config.reconnect.initialDelay;

            // Publish discovery configurations on connect
            this.publishDiscoveryConfigs().catch(error => {
                console.error('❌ Error publishing discovery configs:', error);
            });
        });

        this.client.on('error', (error) => {
            console.error('❌ MQTT connection error:', error);
            this.stats.connected = false;
            this.stats.lastError = error.message;
        });

        this.client.on('close', () => {
            console.log('📡 MQTT connection closed');
            this.stats.connected = false;
            if (this.config.reconnect.enabled) {
                this.scheduleReconnect();
            }
        });

        this.client.on('offline', () => {
            console.log('📡 MQTT client offline');
            this.stats.connected = false;
        });

        this.client.on('reconnect', () => {
            console.log('📡 MQTT attempting to reconnect...');
        });
    }

    /**
     * Schedule reconnection with exponential backoff
     */
    private scheduleReconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        console.log(`📡 Scheduling MQTT reconnect in ${this.reconnectDelay / 1000}s`);

        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);

        // Exponential backoff
        this.reconnectDelay = Math.min(
            this.reconnectDelay * 2,
            this.config.reconnect.maxDelay
        );
    }

    /**
     * Publish HomeAssistant Discovery configurations
     */
    private async publishDiscoveryConfigs(): Promise<void> {
        console.log('📤 Publishing HomeAssistant Discovery configurations...');

        const device: HADevice = {
            identifiers: ['greenhouse_monitor'],
            name: 'Greenhouse Monitor',
            manufacturer: 'Custom',
            model: 'DHT11 + Raspberry Pi',
            sw_version: '1.0.0',
        };

        // Environmental sensor (temperature + humidity combined)
        const envConfig: HADiscoveryConfig = {
            name: 'Greenhouse Environment',
            unique_id: 'greenhouse_env_sensor',
            state_topic: `${this.config.baseTopic}/sensor/greenhouse_env/state`,
            unit_of_measurement: '°F',
            device_class: 'temperature',
            state_class: 'measurement',
            value_template: '{{ value_json.temperature }}',
            json_attributes_topic: `${this.config.baseTopic}/sensor/greenhouse_env/state`,
            json_attributes_template: "{{ {'humidity': value_json.humidity, 'timestamp': value_json.timestamp} | tojson }}",
            device,
        };

        // CPU Temperature sensor (separate)
        const cpuConfig: HADiscoveryConfig = {
            name: 'Greenhouse CPU Temperature',
            unique_id: 'greenhouse_cpu_temp_sensor',
            state_topic: `${this.config.baseTopic}/sensor/greenhouse_cpu/state`,
            unit_of_measurement: '°C',
            device_class: 'temperature',
            state_class: 'measurement',
            device,
        };

        // Publish discovery configs with retain flag
        await this.publishWithRetain(
            `${this.config.baseTopic}/sensor/greenhouse_env/config`,
            JSON.stringify(envConfig)
        );

        await this.publishWithRetain(
            `${this.config.baseTopic}/sensor/greenhouse_cpu/config`,
            JSON.stringify(cpuConfig)
        );

        console.log('✅ HomeAssistant Discovery configurations published');
    }

    /**
     * Publish environmental sensor state (temperature + humidity)
     */
    public async publishEnvironmentalState(
        temperature: number,
        humidity: number,
        timestamp: string
    ): Promise<void> {
        const state: EnvironmentalState = {
            temperature,
            humidity,
            timestamp,
        };

        const topic = `${this.config.baseTopic}/sensor/greenhouse_env/state`;
        await this.publishWithRetain(topic, JSON.stringify(state));
    }

    /**
     * Publish CPU temperature state
     */
    public async publishCPUState(cpuTemp: number): Promise<void> {
        const topic = `${this.config.baseTopic}/sensor/greenhouse_cpu/state`;
        await this.publishWithRetain(topic, cpuTemp.toFixed(1));
    }

    /**
     * Publish message with retain flag and QoS 1
     */
    private publishWithRetain(topic: string, message: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client || !this.stats.connected) {
                const error = new Error('MQTT client not connected');
                this.stats.lastError = error.message;
                this.stats.totalFailed++;
                reject(error);
                return;
            }

            this.client.publish(
                topic,
                message,
                { qos: 1, retain: true },
                (error) => {
                    if (error) {
                        console.error(`❌ MQTT publish failed for ${topic}:`, error);
                        this.stats.lastError = error.message;
                        this.stats.totalFailed++;
                        reject(error);
                    } else {
                        this.stats.totalSent++;
                        this.stats.lastPublish = new Date().toISOString();
                        resolve();
                    }
                }
            );
        });
    }

    /**
     * Get client statistics
     */
    public getStats(): MQTTClientStats {
        return { ...this.stats };
    }

    /**
     * Check if client is connected
     */
    public isConnected(): boolean {
        return this.stats.connected;
    }

    /**
     * Disconnect from broker
     */
    public async disconnect(): Promise<void> {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.client) {
            return new Promise((resolve) => {
                this.client!.end(false, {}, () => {
                    console.log('📡 MQTT client disconnected');
                    this.stats.connected = false;
                    resolve();
                });
            });
        }
    }
}

