# Issue #1: Extend Local Storage and Improve MQTT Reliability

## Labels
`enhancement`, `mqtt`, `priority-high`, `phase-1`

## Milestone
Phase 1: Enhanced Local Storage & MQTT Reliability

## Description

Improve the Raspberry Pi's local data resilience and MQTT reliability to handle extended network outages and ensure data delivery.

## Goals

- Extend local storage from 7 to 14 days
- Add MQTT authentication (username/password)
- Implement QoS 1 for reliable message delivery
- Add Last Will & Testament (LWT) for offline detection
- Publish `last_seen` timestamp for monitoring
- Update MQTT topic structure for better organization

## Tasks

### 1. Extend Local Storage (14 days)

- [ ] Update `maxDataEntries` calculation for 14 days
  - Current: 8760 entries (1 year hourly)
  - New: 4032 entries (14 days at 5-min intervals)
- [ ] Update MQTT queue retention in `mqtt-queue.ts`
  - Change `SEVEN_DAYS_MS` to `FOURTEEN_DAYS_MS`
  - Update constant name and documentation
- [ ] Add environment variable `MQTT_QUEUE_RETENTION_DAYS`
- [ ] Test that old data is purged correctly after 14 days

### 2. MQTT Authentication

- [ ] Add username/password support to MQTT config
  - Already partially implemented, verify it works
- [ ] Update `.env.example` with MQTT credentials
- [ ] Document setup in README

### 3. QoS Level Configuration

- [ ] Add `QoS` parameter to MQTT publish methods
- [ ] Use QoS 1 for:
  - Temperature readings
  - Humidity readings
  - System health metrics
  - Last seen timestamp
- [ ] Use QoS 0 for:
  - Discovery configs (retained anyway)
- [ ] Add `MQTT_QOS_LEVEL` environment variable

### 4. Last Will & Testament (LWT)

- [ ] Add LWT configuration to MQTT client options:
  ```typescript
  will: {
    topic: 'greenhouse/monitor1/status',
    payload: 'offline',
    qos: 1,
    retain: true
  }
  ```
- [ ] Publish `online` to status topic on connect
- [ ] Verify LWT triggers on ungraceful disconnect

### 5. Last Seen Timestamp

- [ ] Add new MQTT topic: `greenhouse/monitor1/system/last_seen`
- [ ] Publish ISO timestamp with each sensor reading
- [ ] Set as retained message
- [ ] Update MQTT types to include `last_seen` field

### 6. Improved Topic Structure

Current topics need restructuring for better organization:

**New Structure:**
```
greenhouse/
  monitor1/
    sensors/
      dht11/
        temperature     # Value only (for simple subscribes)
        humidity        # Value only
        state           # JSON: {"temp":72.5,"humidity":65,"timestamp":"..."}
    system/
      cpu_temp
      memory_percent
      disk_percent
      last_seen
      status            # online/offline (LWT)
    health/
      mqtt_queue_pending
      mqtt_connected
      local_storage_days
```

- [ ] Update `MQTTClient.publishEnvironmentalData()` for new topics
- [ ] Update `MQTTClient.publishDiscoveryConfigs()` for new topics
- [ ] Add system health publishing
- [ ] Update documentation

## Environment Variables

Add to `.env`:
```bash
# Local Storage
MAX_DATA_ENTRIES=4032  # 14 days at 5-min intervals
MQTT_QUEUE_RETENTION_DAYS=14

# MQTT Authentication
MQTT_USERNAME=greenhouse_monitor
MQTT_PASSWORD=<your_secure_password>

# MQTT Configuration
MQTT_QOS_LEVEL=1
MQTT_CLIENT_ID=greenhouse-monitor-1
MQTT_BASE_TOPIC=greenhouse/monitor1
MQTT_LWT_TOPIC=greenhouse/monitor1/status
```

## Testing Checklist

- [ ] Local storage maintains 14 days of data
- [ ] Old data (>14 days) is automatically purged
- [ ] MQTT connects with username/password
- [ ] Messages are delivered with QoS 1
- [ ] LWT message appears when Pi loses power
- [ ] `last_seen` timestamp updates with each reading
- [ ] New topic structure works with HomeAssistant
- [ ] Queue handles 14 days of offline data

## Success Criteria

- ✅ Local storage holds 14 days at 5-minute intervals
- ✅ MQTT queue retains 14 days of unsent messages
- ✅ Authentication required for MQTT connection
- ✅ Zero message loss during 24-hour network outage test
- ✅ LWT triggers within 30 seconds of ungraceful shutdown
- ✅ `last_seen` timestamp visible in HA

## Documentation

- [ ] Update README with new environment variables
- [ ] Document MQTT topic structure
- [ ] Add troubleshooting guide for MQTT auth
- [ ] Update deployment guide with new config

## Dependencies

None - this is Phase 1

## Related Issues

- #2 - HomeAssistant MQTT Integration (depends on this)
- #3 - MariaDB on Kubernetes (independent)

## Time Estimate

2-3 hours
