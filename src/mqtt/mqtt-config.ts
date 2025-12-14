/**
 * MQTT Configuration Loader
 * Loads and validates MQTT configuration from environment variables
 */

import * as dotenv from 'dotenv';
import { MQTTConfig } from './mqtt-types';

// Load environment variables
dotenv.config();

/**
 * Load MQTT configuration from environment variables
 */
export function loadMQTTConfig(): MQTTConfig {
    const enabled = process.env.MQTT_ENABLED === 'true';

    const config: MQTTConfig = {
        enabled,
        broker: {
            host: process.env.MQTT_BROKER_HOST || 'localhost',
            port: parseInt(process.env.MQTT_BROKER_PORT || '1883', 10),
            username: process.env.MQTT_USERNAME || undefined,
            password: process.env.MQTT_PASSWORD || undefined,
        },
        clientId: process.env.MQTT_CLIENT_ID || 'greenhouse-monitor',
        baseTopic: process.env.MQTT_BASE_TOPIC || 'homeassistant',
        reconnect: {
            enabled: true,
            maxDelay: 30000, // 30 seconds
            initialDelay: 1000, // 1 second
        },
    };

    // Validate configuration if MQTT is enabled
    if (enabled) {
        validateMQTTConfig(config);
    }

    return config;
}

/**
 * Validate MQTT configuration
 */
function validateMQTTConfig(config: MQTTConfig): void {
    const errors: string[] = [];

    if (!config.broker.host) {
        errors.push('MQTT_BROKER_HOST is required when MQTT is enabled');
    }

    if (isNaN(config.broker.port) || config.broker.port < 1 || config.broker.port > 65535) {
        errors.push('MQTT_BROKER_PORT must be a valid port number (1-65535)');
    }

    if (!config.broker.username) {
        errors.push('MQTT_USERNAME is required when MQTT is enabled');
    }

    if (!config.broker.password) {
        errors.push('MQTT_PASSWORD is required when MQTT is enabled');
    }

    if (!config.clientId) {
        errors.push('MQTT_CLIENT_ID cannot be empty');
    }

    if (!config.baseTopic) {
        errors.push('MQTT_BASE_TOPIC cannot be empty');
    }

    if (errors.length > 0) {
        const errorMessage = '❌ MQTT Configuration Error:\n' + errors.map(e => `  - ${e}`).join('\n');
        console.error(errorMessage);
        throw new Error('Invalid MQTT configuration. Please check your .env file.');
    }
}

/**
 * Get MQTT configuration summary for logging (excludes sensitive data)
 */
export function getMQTTConfigSummary(config: MQTTConfig): {
    enabled: boolean;
    broker: string;
    username?: string;
    clientId: string;
    baseTopic: string;
} {
    return {
        enabled: config.enabled,
        broker: `${config.broker.host}:${config.broker.port}`,
        username: config.broker.username,
        clientId: config.clientId,
        baseTopic: config.baseTopic,
    };
}

