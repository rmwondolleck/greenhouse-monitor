# Issue #2: HomeAssistant MQTT Integration & Alerts

## Labels
`enhancement`, `homeassistant`, `monitoring`, `priority-high`, `phase-2`

## Milestone
Phase 2: HomeAssistant MQTT Integration

## Description

Enhance HomeAssistant integration with improved MQTT discovery, health monitoring sensors, and automated alerting when the greenhouse monitor goes offline.

## Goals

- Update MQTT discovery for new topic structure
- Create 5-day offline alert automation
- Add comprehensive health monitoring sensors
- Configure proper sensor classes and units
- Test end-to-end data flow Pi → MQTT → HA

## Prerequisites

- Issue #1 completed (Enhanced MQTT reliability)

## Tasks

### 1. Update MQTT Discovery Configuration

Update `MQTTClient.publishDiscoveryConfigs()` to include:

**Environmental Sensors:**
- [ ] Temperature sensor
  - Device class: `temperature`
  - Unit: `°F`
  - State class: `measurement`
- [ ] Humidity sensor
  - Device class: `humidity`
  - Unit: `%`
  - State class: `measurement`

**System Sensors:**
- [ ] CPU temperature
  - Device class: `temperature`
  - Unit: `°C`
- [ ] Memory usage
  - Unit: `%`
  - Icon: `mdi:memory`
- [ ] Disk usage
  - Unit: `%`
  - Icon: `mdi:harddisk`

**Health Sensors:**
- [ ] Last seen timestamp
  - Device class: `timestamp`
- [ ] MQTT connection status (binary)
  - Device class: `connectivity`
  - Payload: `online`/`offline`
- [ ] MQTT queue pending count
  - Unit: `messages`
  - Icon: `mdi:email-outline`
- [ ] Local storage days
  - Unit: `days`
  - Icon: `mdi:database`

### 2. Binary Sensor for Online Status

- [ ] Create binary sensor from LWT topic
  - Topic: `greenhouse/monitor1/status`
  - Payload: `online` (ON) / `offline` (OFF)
  - Device class: `connectivity`

### 3. HomeAssistant Automation (5-day offline alert)

Create automation in HomeAssistant `configuration.yaml`:

```yaml
automation:
  - id: greenhouse_monitor_offline_alert
    alias: "Greenhouse Monitor Offline Alert"
    description: "Alert when greenhouse hasn't sent data in 5 days"
    trigger:
      - platform: state
        entity_id: binary_sensor.greenhouse_monitor_status
        to: "off"
        for:
          days: 5
    condition: []
    action:
      - service: notify.persistent_notification
        data:
          title: "🚨 Greenhouse Monitor Offline"
          message: >
            The greenhouse monitor has been offline for 5 days.
            Last seen: {{ states('sensor.greenhouse_last_seen') }}
            
            Possible issues:
            - Pi power loss
            - Network connectivity
            - SD card failure
            
            Please check the system.
      # Add mobile notification if configured
      - service: notify.mobile_app
        data:
          title: "🚨 Greenhouse Monitor Offline"
          message: "No data received for 5 days. Please check the Pi."
          data:
            priority: high
            tag: greenhouse_offline
```

### 4. Optional: Additional Automations

- [ ] High temperature alert (>85°F)
  ```yaml
  trigger:
    platform: numeric_state
    entity_id: sensor.greenhouse_temperature
    above: 85
  ```

- [ ] Low humidity alert (<30%)
  ```yaml
  trigger:
    platform: numeric_state
    entity_id: sensor.greenhouse_humidity
    below: 30
  ```

- [ ] High CPU temperature alert (>80°C)
  ```yaml
  trigger:
    platform: numeric_state
    entity_id: sensor.greenhouse_cpu_temp
    above: 80
  ```

- [ ] MQTT queue building up (>500 pending)
  ```yaml
  trigger:
    platform: numeric_state
    entity_id: sensor.greenhouse_mqtt_queue_pending
    above: 500
  ```

### 5. HomeAssistant Configuration Documentation

Create `docs/homeassistant-config.yaml` with:
- [ ] Required configuration snippets
- [ ] Sensor card examples for dashboard
- [ ] Automation examples
- [ ] Lovelace UI card configurations

### 6. Testing

- [ ] Verify all sensors appear in HA after discovery
- [ ] Check sensor values update in real-time
- [ ] Test offline detection by stopping Pi
- [ ] Verify LWT status changes to offline
- [ ] Wait 5 days or manually trigger automation
- [ ] Confirm alert is sent
- [ ] Test alert notification delivery

## HomeAssistant Configuration Files

**Sensors** (auto-discovered via MQTT):
```yaml
# These appear automatically via MQTT Discovery
# Listed here for reference

sensor:
  - name: "Greenhouse Temperature"
    unique_id: greenhouse_monitor1_temperature
    
  - name: "Greenhouse Humidity"
    unique_id: greenhouse_monitor1_humidity
    
  - name: "Greenhouse CPU Temperature"
    unique_id: greenhouse_monitor1_cpu_temp
    
  - name: "Greenhouse Last Seen"
    unique_id: greenhouse_monitor1_last_seen

binary_sensor:
  - name: "Greenhouse Monitor Status"
    unique_id: greenhouse_monitor1_status
```

**Lovelace Dashboard Card:**
```yaml
type: entities
title: Greenhouse Monitor
entities:
  - entity: sensor.greenhouse_temperature
    name: Temperature
    icon: mdi:thermometer
  - entity: sensor.greenhouse_humidity
    name: Humidity
    icon: mdi:water-percent
  - entity: sensor.greenhouse_cpu_temp
    name: CPU Temperature
    icon: mdi:chip
  - entity: binary_sensor.greenhouse_monitor_status
    name: Status
  - entity: sensor.greenhouse_last_seen
    name: Last Update
  - entity: sensor.greenhouse_mqtt_queue_pending
    name: Queue Pending
  - type: divider
  - entity: sensor.greenhouse_memory_usage
    name: Memory
  - entity: sensor.greenhouse_disk_usage
    name: Disk
```

## Success Criteria

- ✅ All sensors appear in HA after Pi starts
- ✅ Sensor values update every 5 minutes
- ✅ Status changes to offline when Pi stops
- ✅ Alert triggers after 5 days offline
- ✅ Dashboard shows all health metrics
- ✅ LWT status updates within 30 seconds

## Documentation

- [ ] Create `docs/homeassistant-config.yaml`
- [ ] Update README with HA setup instructions
- [ ] Add screenshot of HA dashboard
- [ ] Document automation setup

## Dependencies

- **Requires**: Issue #1 (MQTT improvements)
- **Blocks**: Issue #4 (Database migration)

## Related Issues

- #1 - Local Storage & MQTT Reliability (prerequisite)
- #4 - HomeAssistant Database Migration (next step)
- #6 - Year-over-Year Dashboard (uses these sensors)

## Time Estimate

1-2 hours
