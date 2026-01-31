# Long-Term Storage & Year-over-Year Analysis Plan

## Overview
Implement a comprehensive data storage solution for the Greenhouse Monitor that enables year-over-year environmental analysis and comparison of greenhouse vs outdoor conditions.

## Goals
1. **Long-term data retention**: Store multiple years of environmental data
2. **Year-over-year comparison**: Compare current year with previous years
3. **Multi-sensor support**: Support both greenhouse and outdoor sensors
4. **Reliable data delivery**: Ensure data reaches HomeAssistant even during network issues
5. **Data resilience**: 14-day local buffer + cloud backups

## Architecture

```
┌─────────────────────────────┐
│  Raspberry Pi (Greenhouse)  │
│                             │
│  • DHT11 Sensor             │
│  • 14-day local storage     │
│  • MQTT Publisher (QoS 1)   │
│  • Last Will & Testament    │
└──────────────┬──────────────┘
               │
               │ MQTT (authenticated)
               ▼
┌─────────────────────────────────────────┐
│         HomeAssistant                   │
│                                         │
│  ┌──────────────┐                      │
│  │ MQTT Broker  │                      │
│  └──────┬───────┘                      │
│         │                               │
│         ├──► Sensors (Auto-discovery)  │
│         ├──► Alerts (5-day offline)    │
│         │                               │
│         ▼                               │
│  ┌──────────────────┐                  │
│  │   Recorder       │                  │
│  │   Component      │                  │
│  └────────┬─────────┘                  │
│           │                             │
│           ▼                             │
│  ┌──────────────────┐                  │
│  │  Long-term       │                  │
│  │  Statistics      │                  │
│  │  (aggregates)    │                  │
│  └──────────────────┘                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│    Kubernetes Cluster            │
│                                  │
│  ┌────────────────────────────┐ │
│  │  MariaDB StatefulSet       │ │
│  │  • 100GB SSD PVC           │ │
│  │  • HA Recorder Database    │ │
│  │  • 2+ years raw data       │ │
│  │  • Forever: statistics     │ │
│  └────────────┬───────────────┘ │
│               │                  │
│  ┌────────────▼───────────────┐ │
│  │  Weekly Backup CronJob     │ │
│  │  • SQL dump                │ │
│  │  • Compress & archive      │ │
│  └────────────┬───────────────┘ │
└────────────────┼─────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  Synology NAS  │
        │  (NFS mount)   │
        │  • Backups     │
        │  • Snapshots   │
        └────────────────┘
```

## Implementation Phases

### Phase 1: Enhanced Local Storage & MQTT Reliability
**Goal**: Improve Pi resilience and MQTT reliability

**Tasks**:
1. Extend local storage from 7 to 14 days
2. Update MQTT queue retention to 14 days
3. Add MQTT authentication (username/password)
4. Implement QoS 1 for critical messages
5. Add Last Will & Testament (LWT) for offline detection
6. Publish `last_seen` timestamp for monitoring
7. Improve MQTT topic structure for scalability

**Benefits**:
- 2-week buffer during outages
- Reliable message delivery
- Proactive offline detection

### Phase 2: HomeAssistant MQTT Integration
**Goal**: Enhance HA integration and monitoring

**Tasks**:
1. Update MQTT discovery for new topic structure
2. Create HA automation for 5-day offline alert
3. Add health monitoring sensors (queue, storage, system)
4. Configure proper sensor classes and units
5. Test end-to-end data flow

**Benefits**:
- Proactive alerting when system is offline
- Better visibility into system health
- Proper HA sensor configuration

### Phase 3: MariaDB on Kubernetes
**Goal**: Deploy long-term database on K8s

**Tasks**:
1. Create MariaDB StatefulSet manifests
2. Configure 100GB SSD-backed PersistentVolumeClaim
3. Set up database initialization scripts
4. Configure database user and permissions
5. Deploy to K8s cluster
6. Test connectivity from HA

**Benefits**:
- Scalable, reliable database
- Fast SSD storage
- K8s-managed high availability

### Phase 4: HomeAssistant Database Migration
**Goal**: Connect HA to external database

**Tasks**:
1. Backup existing HA SQLite database
2. Update HA `recorder` configuration for MariaDB
3. Configure retention policy (730 days raw data)
4. Enable long-term statistics
5. Migrate existing data (optional)
6. Restart HA and verify data recording

**Benefits**:
- Multi-year data retention
- Better performance
- Automatic hourly/daily aggregates

### Phase 5: Automated Backups to NAS
**Goal**: Implement weekly backup to Synology NAS

**Tasks**:
1. Create NFS PersistentVolume for NAS mount
2. Create backup script (mysqldump + compress)
3. Create K8s CronJob for weekly backups
4. Implement backup rotation (keep 12 weeks)
5. Test backup and restore procedures
6. Set up monitoring for backup job

**Benefits**:
- Disaster recovery capability
- Off-site data protection
- 3-month backup history

### Phase 6: Year-over-Year Analysis Dashboard
**Goal**: Build UI for historical comparisons

**Tasks**:
1. Create API endpoint for year-over-year queries
2. Add historical data view to React dashboard
3. Implement year comparison charts
4. Add date range selector
5. Show statistics (min, max, avg) by year
6. Export capability for data analysis

**Benefits**:
- Visualize trends across years
- Identify seasonal patterns
- Data-driven greenhouse management

### Phase 7: Outdoor Sensor Support (Future)
**Goal**: Add outdoor comparison capability

**Tasks**:
1. Design multi-sensor topic structure
2. Update MQTT types for sensor metadata
3. Add sensor registration/discovery
4. Create greenhouse vs outdoor comparison view
5. Calculate differential metrics (greenhouse warming effect)
6. Add outdoor sensor hardware

**Benefits**:
- Understand greenhouse thermal performance
- Compare indoor/outdoor humidity
- Optimize ventilation decisions

## Data Retention Strategy

### MariaDB Storage Tiers

**Tier 1: Raw Data (730 days / 2 years)**
- Full resolution (5-minute intervals)
- All sensor readings
- System health metrics
- Approximately 40-60GB

**Tier 2: Long-term Statistics (Forever)**
- Hourly aggregates (min, max, mean)
- Daily aggregates (min, max, mean)
- Automatically managed by HA
- Approximately 1-2GB per year

**Tier 3: Backups (12 weeks)**
- Weekly SQL dumps on NAS
- Compressed archives
- Disaster recovery only

### Query Patterns

**Real-time (0-24 hours)**
- Query: Raw data from MariaDB
- Use: Live dashboard updates
- Response: <100ms

**Recent History (1-30 days)**
- Query: Raw data from MariaDB
- Use: Short-term trends
- Response: <500ms

**Long-term Analysis (30+ days)**
- Query: Long-term statistics
- Use: Year-over-year comparison
- Response: <1s

**Historical Archive (2+ years)**
- Query: Long-term statistics only
- Use: Multi-year analysis
- Response: <2s

## Environment Variables

### Pi Configuration
```bash
# Existing
GREENHOUSE_DATA_DIR=./data
MAX_DATA_ENTRIES=4032  # 14 days at 5-min intervals
DATA_SAVE_INTERVAL=300000  # 5 minutes

# New
MQTT_QUEUE_RETENTION_DAYS=14
MQTT_QOS_LEVEL=1
```

### MQTT Configuration
```bash
MQTT_ENABLED=true
MQTT_BROKER_HOST=homeassistant.local
MQTT_BROKER_PORT=1883
MQTT_USERNAME=greenhouse_monitor
MQTT_PASSWORD=<secure_password>
MQTT_CLIENT_ID=greenhouse-monitor-1
MQTT_BASE_TOPIC=greenhouse/monitor1
MQTT_LWT_TOPIC=greenhouse/monitor1/status
```

### K8s MariaDB
```bash
MARIADB_ROOT_PASSWORD=<secure_password>
MARIADB_DATABASE=homeassistant
MARIADB_USER=hass
MARIADB_PASSWORD=<secure_password>
```

## Success Metrics

### Phase 1-2 (Pi & MQTT)
- ✅ 14-day local storage verified
- ✅ MQTT messages delivered with QoS 1
- ✅ Offline alert triggers after 5 days
- ✅ Zero data loss during 24-hour network outage test

### Phase 3-4 (Database)
- ✅ MariaDB operational on K8s
- ✅ HA writing to external database
- ✅ Query response time <500ms for 30-day range
- ✅ 2 years of data retained

### Phase 5 (Backups)
- ✅ Weekly backups running automatically
- ✅ Backup size <10GB compressed
- ✅ Restore test successful
- ✅ 12 weeks of backups on NAS

### Phase 6 (Dashboard)
- ✅ Year-over-year chart shows 2+ years
- ✅ Compare same date across years
- ✅ Export data to CSV
- ✅ Page load time <2s

## Timeline Estimate

- **Phase 1**: 2-3 hours (Pi improvements)
- **Phase 2**: 1-2 hours (HA automation)
- **Phase 3**: 2-3 hours (K8s database)
- **Phase 4**: 1-2 hours (HA migration)
- **Phase 5**: 2-3 hours (Backups)
- **Phase 6**: 4-6 hours (Dashboard)
- **Phase 7**: 6-8 hours (Outdoor sensor)

**Total**: ~20-30 hours over 3-4 weeks

## Risk Mitigation

### Risk: Data loss during migration
**Mitigation**: 
- Backup SQLite database before migration
- Run parallel databases during testing
- Verify data before decommissioning SQLite

### Risk: Network outage during deployment
**Mitigation**:
- 14-day local buffer handles outages
- Deploy during low-activity time
- Test rollback procedures

### Risk: K8s storage failure
**Mitigation**:
- Weekly backups to NAS
- K8s PVC with reliable storage class
- Monitor disk usage and set alerts

### Risk: Performance degradation
**Mitigation**:
- Index critical columns in MariaDB
- Configure appropriate retention
- Monitor query performance
- Use long-term statistics for old data

## Future Enhancements

1. **Grafana Integration**: Rich visualization dashboards
2. **Mobile App**: React Native app for monitoring
3. **Alerting**: SMS/push notifications for threshold violations
4. **ML/AI**: Predict optimal conditions, anomaly detection
5. **Multi-location**: Support multiple greenhouses
6. **Soil Sensors**: Moisture, pH, nutrients
7. **Camera**: Time-lapse plant growth
8. **Automation**: Control fans, heaters, watering based on data
