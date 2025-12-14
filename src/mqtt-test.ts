/**
 * MQTT Module Test Script
 * Tests MQTT components without modifying existing server.ts
 *
 * Usage:
 *   npm run build:server
 *   node dist/mqtt-test.js
 */

import { MQTTClient, MQTTQueue, loadMQTTConfig, getMQTTConfigSummary } from './mqtt';

async function testMQTT() {
    console.log('========================================');
    console.log('🧪 MQTT Module Test');
    console.log('========================================\n');

    // Test 1: Configuration Loading
    console.log('📋 Test 1: Loading MQTT Configuration');
    console.log('----------------------------------------');
    try {
        const config = loadMQTTConfig();
        const summary = getMQTTConfigSummary(config);
        console.log('✅ Configuration loaded successfully:');
        console.log(JSON.stringify(summary, null, 2));

        if (!config.enabled) {
            console.log('\n⚠️  MQTT is disabled. Set MQTT_ENABLED=true in .env to test connection.\n');
        }
        console.log('');

        // Test 2: Queue Operations
        console.log('📋 Test 2: Queue Operations');
        console.log('----------------------------------------');
        const dataDir = process.env.GREENHOUSE_DATA_DIR || './data';
        const queue = new MQTTQueue(dataDir);

        // Enqueue test data
        console.log('📥 Enqueuing test data points...');
        const id1 = queue.enqueue(72.5, 45.2, 52.3);
        console.log(`   ✅ Enqueued entry 1: ${id1}`);

        const id2 = queue.enqueue(73.1, 46.8, 53.1);
        console.log(`   ✅ Enqueued entry 2: ${id2}`);

        const id3 = queue.enqueue(71.8, 44.5, 51.9);
        console.log(`   ✅ Enqueued entry 3: ${id3}`);

        // Get stats
        let stats = queue.getQueueStats();
        console.log(`\n📊 Queue Stats: ${stats.pending} pending, ${stats.delivered} delivered, ${stats.total} total`);

        // Get next pending
        const next = queue.getNextPending();
        if (next) {
            console.log(`\n📤 Next pending entry:`);
            console.log(`   ID: ${next.id}`);
            console.log(`   Temperature: ${next.temperature}°F`);
            console.log(`   Humidity: ${next.humidity}%`);
            console.log(`   CPU Temp: ${next.cpuTemp}°C`);
            console.log(`   Timestamp: ${next.timestamp}`);

            // Mark as delivered
            queue.markDelivered(next.id);
            console.log(`   ✅ Marked as delivered`);
        }

        // Get updated stats
        stats = queue.getQueueStats();
        console.log(`\n📊 Updated Stats: ${stats.pending} pending, ${stats.delivered} delivered, ${stats.total} total`);

        // Test expiry
        console.log('\n🗑️  Testing expiry cleanup...');
        const removed = queue.removeExpired();
        console.log(`   Removed ${removed} expired entries`);

        console.log('\n✅ Queue operations test completed\n');

        // Test 3: MQTT Client Connection (only if enabled)
        if (config.enabled) {
            console.log('📋 Test 3: MQTT Client Connection');
            console.log('----------------------------------------');

            const client = new MQTTClient(config);

            try {
                await client.connect();
                console.log('⏳ Waiting for connection...');

                // Wait a bit for connection to establish
                await new Promise(resolve => setTimeout(resolve, 3000));

                const clientStats = client.getStats();
                console.log('\n📊 Client Stats:');
                console.log(`   Connected: ${clientStats.connected}`);
                console.log(`   Total Sent: ${clientStats.totalSent}`);
                console.log(`   Total Failed: ${clientStats.totalFailed}`);
                console.log(`   Last Error: ${clientStats.lastError || 'None'}`);

                if (clientStats.connected) {
                    console.log('\n📤 Testing state publishing...');

                    // Publish environmental state
                    await client.publishEnvironmentalState(72.5, 45.2, new Date().toISOString());
                    console.log('   ✅ Published environmental state');

                    // Publish CPU state
                    await client.publishCPUState(52.3);
                    console.log('   ✅ Published CPU state');

                    const updatedStats = client.getStats();
                    console.log(`\n📊 After Publishing:`);
                    console.log(`   Total Sent: ${updatedStats.totalSent}`);
                    console.log(`   Last Publish: ${updatedStats.lastPublish}`);
                }

                console.log('\n🔌 Disconnecting...');
                await client.disconnect();
                console.log('✅ MQTT client test completed\n');

            } catch (error) {
                console.error('❌ MQTT client test failed:', error);
                console.log('');
            }
        } else {
            console.log('📋 Test 3: MQTT Client Connection');
            console.log('----------------------------------------');
            console.log('⏭️  Skipped (MQTT disabled)\n');
        }

        console.log('========================================');
        console.log('✅ All tests completed!');
        console.log('========================================\n');

        if (!config.enabled) {
            console.log('💡 To test MQTT connection:');
            console.log('   1. Set MQTT_ENABLED=true in .env');
            console.log('   2. Configure MQTT_BROKER_HOST and credentials');
            console.log('   3. Run this test again\n');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('\n💡 Make sure your .env file is configured correctly.');
        console.log('   See .env.example for required variables.\n');
        process.exit(1);
    }
}

// Run tests
testMQTT().then(() => {
    console.log('🏁 Test script finished\n');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

