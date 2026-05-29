# Issue #7: Outdoor Sensor Support (Future Enhancement)

## Labels
`enhancement`, `hardware`, `sensors`, `priority-low`, `phase-7`, `future`

## Milestone
Phase 7: Multi-Sensor Support (Future)

## Description

Add support for an outdoor temperature and humidity sensor to enable greenhouse vs. outdoor environment comparison. This will help understand the greenhouse's thermal performance and make data-driven decisions about ventilation and heating.

## Goals

- Support multiple sensor locations (greenhouse + outdoor)
- Compare greenhouse vs outdoor conditions in real-time
- Calculate differential metrics (greenhouse warming effect)
- Display both sensors on dashboard
- Track greenhouse thermal efficiency over time
- Year-over-year comparison including outdoor data

## Prerequisites

- Issue #1-6 completed (full system operational)
- 2nd DHT11/DHT22 sensor acquired
- Physical installation planned

## Hardware Options

### Option A: Second Raspberry Pi
- **Pros**: Independent, no wiring needed, same codebase
- **Cons**: More expensive, requires power/network
- **Cost**: ~$50-100

### Option B: DHT22 on Long Cable
- **Pros**: Single Pi, cheaper
- **Cons**: Cable length limited (~10m), signal degradation
- **Cost**: ~$10-20

### Option C: ESP32 + MQTT
- **Pros**: Cheap, WiFi, low power, standalone
- **Cons**: Different codebase, another device to maintain
- **Cost**: ~$10-15

### Option D: Weather API
- **Pros**: No hardware, instant data
- **Cons**: Not your exact location, costs money
- **Cost**: $0-20/month

**Recommended**: Option C (ESP32) or Option D (API) for simplicity

## Tasks

### 1. Design Multi-Sensor Architecture

- [ ] Update MQTT topic structure:
  ```
  greenhouse/
    sensors/
      greenhouse/          # Indoor sensor
        temperature
        humidity
        location: "inside"
      outdoor/             # Outdoor sensor
        temperature
        humidity
        location: "outside"
  ```

- [ ] Update TypeScript types:
  ```typescript
  interface SensorLocation {
    id: string;
    name: string;
    location: 'indoor' | 'outdoor';
  }
  
  interface MultiSensorData {
    greenhouse: SensorData;
    outdoor: SensorData;
    differential: {
      temperature: number;  // greenhouse - outdoor
      humidity: number;
    };
  }
  ```

### 2. Implement Sensor Registration

- [ ] Add sensor metadata to MQTT discovery
- [ ] Create sensor registry in backend
- [ ] Auto-discover sensors via MQTT
- [ ] Store sensor metadata (location, calibration, etc.)

### 3. Update Backend API

- [ ] Modify endpoints to accept `sensorId` parameter
- [ ] Create comparative endpoints:
  - `/api/sensors/compare` - current conditions
  - `/api/sensors/differential` - greenhouse effect
  - `/api/historical/comparative` - year-over-year both sensors

### 4. Hardware Setup (if using physical sensor)

**For ESP32:**
- [ ] Write Arduino/ESPHome code
- [ ] Configure WiFi
- [ ] Configure MQTT publishing
- [ ] Test and deploy outdoor

**For 2nd Pi:**
- [ ] Clone repository
- [ ] Update config (different client ID, topics)
- [ ] Deploy outdoors (weatherproof enclosure!)

**For Weather API:**
- [ ] Sign up for API (OpenWeatherMap, Weather Underground, etc.)
- [ ] Create polling service
- [ ] Transform API data to match sensor format
- [ ] Publish to MQTT

### 5. Update Frontend Dashboard

- [ ] **Main Dashboard Changes**:
  - [ ] Split view: Greenhouse | Outdoor
  - [ ] Show differential prominently
  - [ ] Color code when greenhouse is warmer/cooler

- [ ] **Comparative Dashboard**:
  - [ ] Side-by-side comparison
  - [ ] Differential chart over time
  - [ ] Greenhouse effectiveness metric

- [ ] **Year-over-Year Integration**:
  - [ ] Option to show outdoor data on same chart
  - [ ] Compare greenhouse differential across years

### 6. Calculate Greenhouse Metrics

- [ ] **Temperature Differential**:
  ```typescript
  const tempDiff = greenhouse.temperature - outdoor.temperature;
  ```

- [ ] **Humidity Differential**:
  ```typescript
  const humidityDiff = greenhouse.humidity - outdoor.humidity;
  ```

- [ ] **Thermal Efficiency**:
  ```typescript
  // How much warmer is greenhouse per degree of sunlight/heating?
  const efficiency = tempDiff / solarRadiation;  // Future: add solar sensor
  ```

- [ ] **Ventilation Effectiveness**:
  ```typescript
  // How quickly does greenhouse cool when vented?
  const coolRate = (tempBefore - tempAfter) / timeMinutes;
  ```

### 7. Update HomeAssistant Integration

- [ ] Add outdoor sensor entities
- [ ] Create template sensors for differentials:
  ```yaml
  sensor:
    - platform: template
      sensors:
        greenhouse_temperature_differential:
          friendly_name: "Greenhouse Temperature Advantage"
          unit_of_measurement: "°F"
          value_template: >
            {{ states('sensor.greenhouse_temperature')|float - 
               states('sensor.outdoor_temperature')|float }}
  ```

- [ ] Add automations:
  - Alert if greenhouse is cooler than outside (ventilation failure)
  - Alert if greenhouse is too much warmer (overheating risk)

### 8. Create Comparison Visualizations

- [ ] Dual-axis chart (greenhouse + outdoor overlaid)
- [ ] Differential chart (greenhouse - outdoor over time)
- [ ] Scatter plot (outdoor temp vs greenhouse temp)
- [ ] Correlation analysis

### 9. Weather Integration (Optional)

If using weather API:

- [ ] Fetch forecast data
- [ ] Predict greenhouse conditions based on forecast
- [ ] Alert if heating/cooling will be needed
- [ ] Compare actual vs forecast

## UI Mockup

```
┌────────────────────────────────────────────────┐
│  Greenhouse Monitor                       🏠 ◄ │
├────────────────────────────────────────────────┤
│  Current Conditions                            │
│                                                │
│  ┌───────────────────┐  ┌──────────────────┐  │
│  │   🏠 Greenhouse   │  │   ⛅ Outdoor     │  │
│  │                   │  │                  │  │
│  │   72°F           │  │   58°F          │  │
│  │   65% humidity    │  │   75% humidity   │  │
│  └───────────────────┘  └──────────────────┘  │
│                                                │
│  Greenhouse Effect:                            │
│  🔥 +14°F warmer     💧 -10% humidity         │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │         Temperature Comparison           │ │
│  │  80°F┤                ╱──greenhouse       │ │
│  │      │              ╱                     │ │
│  │  70°F┤            ╱                       │ │
│  │      │          ╱                         │ │
│  │  60°F┤───outdoor                          │ │
│  │      │                                    │ │
│  │  50°F┤                                    │ │
│  │      └────────────────────────────────    │ │
│  │       12a  4a  8a  12p  4p  8p           │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │      Differential (Greenhouse - Out)     │ │
│  │  20°F┤                                   │ │
│  │      │          ╱──╲                     │ │
│  │  10°F┤        ╱      ╲                   │ │
│  │      │  ────╱          ╲────             │ │
│  │   0°F┤                                   │ │
│  │      └────────────────────────────────   │ │
│  │       12a  4a  8a  12p  4p  8p          │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

## Environment Variables

```bash
# Outdoor Sensor Configuration
OUTDOOR_SENSOR_ENABLED=true
OUTDOOR_SENSOR_TYPE=mqtt  # mqtt, api, or local

# If using MQTT from external sensor
OUTDOOR_SENSOR_MQTT_TOPIC=greenhouse/sensors/outdoor

# If using Weather API
WEATHER_API_KEY=<api_key>
WEATHER_API_PROVIDER=openweathermap
WEATHER_LOCATION_LAT=40.7128
WEATHER_LOCATION_LON=-74.0060
WEATHER_POLL_INTERVAL=300000  # 5 minutes
```

## Testing Checklist

- [ ] Outdoor sensor data flows to MQTT
- [ ] Both sensors display on dashboard
- [ ] Differential calculation is correct
- [ ] Year-over-year works with both sensors
- [ ] HA entities created for outdoor sensor
- [ ] Alerts trigger correctly
- [ ] Mobile view shows both sensors

## Success Criteria

- ✅ Outdoor sensor data integrated
- ✅ Dashboard shows both locations
- ✅ Differential metrics calculated
- ✅ Year-over-year includes outdoor data
- ✅ Greenhouse effect clearly visible
- ✅ Data helps make ventilation decisions

## Future Enhancements

- [ ] Add soil temperature sensor
- [ ] Add solar radiation sensor (calculate greenhouse gain)
- [ ] Add wind speed (impacts ventilation)
- [ ] Multiple greenhouse comparison
- [ ] Automated vent control based on differential

## Documentation

- [ ] Update README with multi-sensor support
- [ ] Document outdoor sensor setup
- [ ] Add comparison dashboard guide
- [ ] Explain greenhouse metrics

## Dependencies

- **Requires**: Issues #1-6 (full system operational)
- **Hardware**: Additional sensor or API subscription

## Related Issues

- #1 - MQTT Reliability (outdoor sensor uses same queue)
- #6 - Year-over-Year Dashboard (integrates outdoor data)

## Time Estimate

6-8 hours (hardware setup + software integration)

## Hardware Shopping List

**Option 1: ESP32 Setup**
- [ ] ESP32 DevKit (~$10)
- [ ] DHT22 sensor (~$8)
- [ ] Weatherproof enclosure (~$15)
- [ ] USB power adapter (~$10)
- **Total**: ~$43

**Option 2: Weather API**
- [ ] OpenWeatherMap One Call API ($0-20/month)
- **Total**: $0-20/month

**Option 3: 2nd Raspberry Pi Zero 2 W**
- [ ] Pi Zero 2 W (~$15)
- [ ] DHT11 sensor (~$5)
- [ ] MicroSD card (~$10)
- [ ] Power adapter (~$10)
- [ ] Weatherproof enclosure (~$15)
- **Total**: ~$55

## Notes

This issue is marked as **Future Enhancement** and low priority. Complete Issues #1-6 first to establish the foundation. This can be implemented anytime after the core system is operational and has accumulated some historical data.
