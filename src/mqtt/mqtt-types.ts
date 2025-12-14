/**
 * MQTT Types and Interfaces
 * TypeScript definitions for MQTT integration with HomeAssistant
 */

/**
 * MQTT Configuration options
 */
export interface MQTTConfig {
    enabled: boolean;
    broker: {
        host: string;
        port: number;
        username?: string;
        password?: string;
    };
    clientId: string;
    baseTopic: string;
    reconnect: {
        enabled: boolean;
        maxDelay: number; // milliseconds
        initialDelay: number; // milliseconds
    };
}

/**
 * MQTT Queue Entry - represents a data point waiting to be sent
 */
export interface MQTTQueueEntry {
    id: string; // UUID
    timestamp: string; // ISO 8601
    temperature: number; // Fahrenheit
    humidity: number; // Percentage
    cpuTemp: number; // Celsius
    status: 'pending' | 'delivered';
    createdAt: number; // Unix timestamp (ms)
    expiresAt: number; // Unix timestamp (ms) - createdAt + 7 days
}

/**
 * Queue statistics
 */
export interface QueueStats {
    total: number;
    pending: number;
    delivered: number;
}

/**
 * MQTT Client statistics
 */
export interface MQTTClientStats {
    connected: boolean;
    totalSent: number;
    totalFailed: number;
    lastPublish: string | null; // ISO timestamp
    lastError: string | null;
}

/**
 * HomeAssistant MQTT Discovery Device configuration
 */
export interface HADevice {
    identifiers: string[];
    name: string;
    manufacturer: string;
    model: string;
    sw_version?: string;
}

/**
 * HomeAssistant MQTT Discovery Configuration for a sensor
 */
export interface HADiscoveryConfig {
    name: string;
    unique_id: string;
    state_topic: string;
    unit_of_measurement?: string;
    device_class?: string;
    state_class?: string;
    value_template?: string;
    json_attributes_topic?: string;
    json_attributes_template?: string;
    device: HADevice;
}

/**
 * Environmental sensor state (temperature + humidity combined)
 */
export interface EnvironmentalState {
    temperature: number; // Fahrenheit
    humidity: number; // Percentage
    timestamp: string; // ISO 8601
}

/**
 * MQTT Status for API endpoint
 */
export interface MQTTStatus {
    enabled: boolean;
    connected: boolean;
    broker: string; // "host:port"
    queueStats: QueueStats;
    lastPublish: string | null;
    totalSent: number;
    totalFailed: number;
    lastError: string | null;
}

