/**
 * MQTT Queue Manager
 * Manages persistent queue for reliable MQTT message delivery
 * - Stores unsent data points in JSON file
 * - Tracks delivery status
 * - Implements 7-day expiry
 * - Enforces queue size limits
 */

import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { MQTTQueueEntry, QueueStats } from './mqtt-types';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const MAX_PENDING_ENTRIES = 1000; // Maximum pending entries before cleanup

export class MQTTQueue {
    private queueFile: string;
    private queue: MQTTQueueEntry[] = [];

    constructor(dataDirectory: string) {
        this.queueFile = path.join(dataDirectory, 'mqtt-queue.json');
        this.ensureDataDirectory();
        this.loadQueue();
        console.log(`📬 MQTT Queue initialized: ${this.queueFile}`);
    }

    /**
     * Ensure data directory exists
     */
    private ensureDataDirectory(): void {
        const dir = path.dirname(this.queueFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📂 Created MQTT queue directory: ${dir}`);
        }
    }

    /**
     * Load queue from disk
     */
    private loadQueue(): void {
        try {
            if (fs.existsSync(this.queueFile)) {
                const data = fs.readFileSync(this.queueFile, 'utf8');
                const parsed = JSON.parse(data);
                this.queue = Array.isArray(parsed) ? parsed : [];

                const stats = this.getQueueStats();
                console.log(`📬 MQTT Queue recovered: ${stats.pending} pending messages, ${stats.delivered} delivered`);
            } else {
                this.queue = [];
                console.log(`📬 MQTT Queue initialized with empty queue`);
            }
        } catch (error) {
            console.error('❌ Error loading MQTT queue, creating backup:', error);
            this.createBackup();
            this.queue = [];
        }
    }

    /**
     * Save queue to disk
     */
    private saveQueue(): void {
        try {
            fs.writeFileSync(this.queueFile, JSON.stringify(this.queue, null, 2), 'utf8');
        } catch (error) {
            console.error('❌ Error saving MQTT queue:', error);
            // Error is logged, but not thrown to avoid crashing the application
        }
    }

    /**
     * Create backup of corrupted queue file
     */
    private createBackup(): void {
        try {
            if (fs.existsSync(this.queueFile)) {
                const backupFile = `${this.queueFile}.bak`;
                fs.copyFileSync(this.queueFile, backupFile);
                console.log(`💾 Created backup: ${backupFile}`);
            }
        } catch (error) {
            console.error('❌ Error creating backup:', error);
        }
    }

    /**
     * Enqueue a new data point
     */
    public enqueue(temperature: number, humidity: number, cpuTemp: number): string {
        const now = Date.now();
        const entry: MQTTQueueEntry = {
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            temperature,
            humidity,
            cpuTemp,
            status: 'pending',
            createdAt: now,
            expiresAt: now + SEVEN_DAYS_MS,
        };

        this.queue.push(entry);

        // Enforce queue size limit
        this.enforceSizeLimit();

        // Save immediately to disk
        this.saveQueue();

        return entry.id;
    }

    /**
     * Get the next pending entry (oldest first)
     */
    public getNextPending(): MQTTQueueEntry | null {
        const pending = this.queue.find(entry => entry.status === 'pending');
        return pending || null;
    }

    /**
     * Mark an entry as delivered
     */
    public markDelivered(id: string): void {
        const entry = this.queue.find(e => e.id === id);
        if (entry) {
            entry.status = 'delivered';
            this.saveQueue();
        }
    }

    /**
     * Remove expired entries (older than 7 days)
     */
    public removeExpired(): number {
        const now = Date.now();
        const initialLength = this.queue.length;

        this.queue = this.queue.filter(entry => {
            // Keep delivered entries for a short time, remove pending if expired
            if (entry.status === 'pending' && now > entry.expiresAt) {
                console.log(`🗑️  Removing expired pending entry: ${entry.id} (${entry.timestamp})`);
                return false;
            }
            // Remove delivered entries older than 1 day
            if (entry.status === 'delivered' && now > entry.createdAt + (24 * 60 * 60 * 1000)) {
                return false;
            }
            return true;
        });

        const removedCount = initialLength - this.queue.length;

        if (removedCount > 0) {
            this.saveQueue();
            console.log(`🗑️  Removed ${removedCount} expired queue entries`);
        }

        return removedCount;
    }

    /**
     * Enforce maximum pending entries limit
     */
    private enforceSizeLimit(): void {
        const pendingEntries = this.queue.filter(e => e.status === 'pending');

        if (pendingEntries.length > MAX_PENDING_ENTRIES) {
            // Remove oldest pending entries
            const toRemove = pendingEntries.length - MAX_PENDING_ENTRIES;
            console.warn(`⚠️  Queue size limit reached. Removing ${toRemove} oldest pending entries.`);

            // Sort by createdAt and remove oldest
            pendingEntries.sort((a, b) => a.createdAt - b.createdAt);
            const idsToRemove = new Set(pendingEntries.slice(0, toRemove).map(e => e.id));

            this.queue = this.queue.filter(e => !idsToRemove.has(e.id));
        }
    }

    /**
     * Get queue statistics
     */
    public getQueueStats(): QueueStats {
        const pending = this.queue.filter(e => e.status === 'pending').length;
        const delivered = this.queue.filter(e => e.status === 'delivered').length;

        return {
            total: this.queue.length,
            pending,
            delivered,
        };
    }

    /**
     * Get all pending entries (for batch processing)
     */
    public getAllPending(): MQTTQueueEntry[] {
        return this.queue.filter(e => e.status === 'pending');
    }

    /**
     * Clear all delivered entries
     */
    public clearDelivered(): number {
        const initialLength = this.queue.length;
        this.queue = this.queue.filter(e => e.status !== 'delivered');
        const removedCount = initialLength - this.queue.length;

        if (removedCount > 0) {
            this.saveQueue();
            console.log(`🗑️  Cleared ${removedCount} delivered queue entries`);
        }

        return removedCount;
    }
}

