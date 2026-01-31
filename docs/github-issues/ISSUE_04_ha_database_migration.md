# Issue #4: Migrate HomeAssistant to External MariaDB Database

## Labels
`homeassistant`, `database`, `migration`, `priority-medium`, `phase-4`

## Milestone
Phase 4: HomeAssistant Database Migration

## Description

Migrate HomeAssistant's recorder component from the default SQLite database to the external MariaDB database running on Kubernetes. This enables long-term data retention (2+ years) and better performance for year-over-year analysis.

## Goals

- Safely migrate HA to external MariaDB
- Configure appropriate data retention (730 days raw data)
- Enable long-term statistics (forever)
- Maintain data integrity
- Improve query performance

## Prerequisites

- **Required**: Issue #3 completed (MariaDB deployed on K8s)
- MariaDB accessible from HomeAssistant host
- Valid connection string tested

## Tasks

### 1. Backup Existing SQLite Database

⚠️ **Critical**: Always backup before migration!

- [ ] Stop HomeAssistant:
  ```bash
  sudo systemctl stop home-assistant
  ```

- [ ] Backup SQLite database:
  ```bash
  cd /config  # Or your HA config directory
  cp home-assistant_v2.db home-assistant_v2.db.backup
  cp home-assistant_v2.db-shm home-assistant_v2.db-shm.backup 2>/dev/null
  cp home-assistant_v2.db-wal home-assistant_v2.db-wal.backup 2>/dev/null
  
  # Create timestamped backup
  tar czf ~/ha-db-backup-$(date +%Y%m%d-%H%M%S).tar.gz home-assistant_v2.*
  ```

- [ ] Verify backup:
  ```bash
  sqlite3 home-assistant_v2.db.backup "PRAGMA integrity_check;"
  ```

### 2. Install MariaDB Client (if needed)

- [ ] On HomeAssistant host:
  ```bash
  # For Home Assistant OS - not needed, included
  
  # For Home Assistant Container
  docker exec homeassistant apk add mariadb-client
  
  # For Home Assistant Core
  pip3 install mysqlclient
  ```

### 3. Test Database Connection

- [ ] Test connection from HA host:
  ```bash
  mysql -h <k8s-node-ip> -P 30306 -u hass -p homeassistant
  ```

- [ ] If successful, construct connection string:
  ```
  mysql://hass:<password>@<k8s-node-ip>:30306/homeassistant?charset=utf8mb4
  ```

### 4. Update HomeAssistant Configuration

- [ ] Edit `configuration.yaml`:
  ```yaml
  # Recorder configuration for MariaDB
  recorder:
    # Database connection
    db_url: mysql://hass:<password>@<k8s-node-ip>:30306/homeassistant?charset=utf8mb4
    
    # Keep 2 years of raw data
    purge_keep_days: 730
    
    # Commit frequency (balance between performance and data loss risk)
    commit_interval: 30  # seconds
    
    # Automatically purge old data
    auto_purge: true
    auto_repack: true
    
    # Exclude domains that create too much data (optional)
    exclude:
      domains:
        - updater
        - media_player
      entity_globs:
        - sensor.weather_*
    
    # Only include greenhouse sensors (alternative to exclude)
    # include:
    #   entities:
    #     - sensor.greenhouse_temperature
    #     - sensor.greenhouse_humidity
    #     - sensor.greenhouse_cpu_temp
    #     - binary_sensor.greenhouse_monitor_status
  
  # Enable long-term statistics
  # These are automatically created and stored efficiently
  # No additional configuration needed - works out of the box!
  ```

### 5. Configure Long-Term Statistics

Long-term statistics are automatic in HA, but verify configuration:

- [ ] Ensure sensors have `state_class` set (done in Issue #2):
  - `measurement` for current values (temp, humidity)
  - `total_increasing` for counters
  
- [ ] Statistics retention is **forever** by default (no need to configure)

- [ ] Statistics are calculated:
  - **Hourly**: Every hour (mean, min, max, sum)
  - **Daily**: Every day (mean, min, max, sum)
  - **Monthly**: Every month (mean, min, max, sum)

### 6. Start HomeAssistant and Verify

- [ ] Start HomeAssistant:
  ```bash
  sudo systemctl start home-assistant
  ```

- [ ] Monitor logs for issues:
  ```bash
  tail -f /config/home-assistant.log
  ```

- [ ] Look for:
  - ✅ Successful database connection
  - ✅ Recorder started
  - ❌ Any connection errors
  - ❌ Authentication failures

### 7. Verify Data Recording

- [ ] Check HA Developer Tools > Statistics
  - Navigate to any sensor
  - Verify statistics are being created

- [ ] Query MariaDB directly:
  ```bash
  kubectl exec -it mariadb-0 -n greenhouse -- \
    mysql -u hass -p homeassistant -e "SHOW TABLES;"
  ```

- [ ] Verify tables created:
  - `states` - Current and historical states
  - `statistics` - Short-term statistics  
  - `statistics_meta` - Statistics metadata
  - `statistics_short_term` - 10-day statistics
  - Many others...

- [ ] Check data is being written:
  ```sql
  SELECT COUNT(*) FROM states WHERE entity_id LIKE 'sensor.greenhouse%';
  SELECT COUNT(*) FROM statistics WHERE metadata_id IN (
    SELECT id FROM statistics_meta WHERE statistic_id LIKE 'sensor.greenhouse%'
  );
  ```

### 8. Performance Tuning

- [ ] Monitor query performance in HA logs

- [ ] If slow, add indexes (HA usually handles this):
  ```sql
  SHOW INDEX FROM states;
  SHOW INDEX FROM statistics;
  ```

- [ ] Monitor database size:
  ```sql
  SELECT 
    table_name,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
  FROM information_schema.tables
  WHERE table_schema = 'homeassistant'
  ORDER BY (data_length + index_length) DESC;
  ```

### 9. Optional: Migrate Existing Data

⚠️ **Optional** - Only if you want to keep historical data from SQLite

- [ ] Install migration tool:
  ```bash
  pip3 install homeassistant-db-migration
  ```

- [ ] Run migration:
  ```bash
  hass-db-migrate \
    --from sqlite:////config/home-assistant_v2.db \
    --to mysql://hass:<password>@<k8s-node-ip>:30306/homeassistant
  ```

- [ ] This can take hours for large databases!

**Alternative**: Start fresh and only keep new data going forward (recommended)

### 10. Clean Up Old SQLite Database

⚠️ **Wait 1-2 weeks before deleting** - ensure everything works!

- [ ] After confirming MariaDB works:
  ```bash
  # Keep backup, but can remove active file
  mv /config/home-assistant_v2.db /config/old-db-backup/
  ```

## Configuration Files

### Example `configuration.yaml`

```yaml
# Basic configuration
homeassistant:
  name: Home
  latitude: !secret latitude
  longitude: !secret longitude
  elevation: !secret elevation
  unit_system: imperial
  time_zone: America/New_York

# Recorder with MariaDB
recorder:
  db_url: !secret db_url
  purge_keep_days: 730
  commit_interval: 30
  auto_purge: true
  auto_repack: true
  exclude:
    domains:
      - updater
    event_types:
      - call_service

# History component (uses recorder)
history:

# Logbook (uses recorder)
logbook:

# HTTP
http:
  use_x_forwarded_for: true
  trusted_proxies:
    - 127.0.0.1

# MQTT
mqtt:
  broker: localhost
  port: 1883
  username: !secret mqtt_username
  password: !secret mqtt_password
```

### Example `secrets.yaml`

```yaml
# Database
db_url: mysql://hass:your_password@k8s-node-ip:30306/homeassistant?charset=utf8mb4

# MQTT
mqtt_username: greenhouse_monitor
mqtt_password: your_mqtt_password
```

## Testing Checklist

- [ ] HomeAssistant starts without errors
- [ ] Recorder connects to MariaDB
- [ ] New sensor data appears in MariaDB
- [ ] History graphs show data
- [ ] Developer Tools > Statistics shows data
- [ ] Long-term statistics generating hourly
- [ ] No "database locked" errors
- [ ] Query response time acceptable (<1s for 30-day history)
- [ ] Disk usage in K8s is growing (data being written)

## Troubleshooting

### Error: "Can't connect to MySQL server"
- Verify MariaDB pod is running: `kubectl get pods -n greenhouse`
- Check NodePort service: `kubectl get svc -n greenhouse`
- Test connection from HA host: `mysql -h <ip> -P 30306 -u hass -p`

### Error: "Authentication failed"
- Verify password in secrets.yaml
- Check MariaDB user: `SELECT User, Host FROM mysql.user;`

### Error: "Database is full"
- Check PVC size: `kubectl get pvc -n greenhouse`
- Monitor disk usage in MariaDB pod

### Slow queries
- Add indexes (HA usually does this automatically)
- Increase `innodb_buffer_pool_size` in MariaDB config
- Reduce `purge_keep_days`

## Success Criteria

- ✅ HomeAssistant starts with MariaDB connection
- ✅ Sensor data visible in HA history
- ✅ Long-term statistics generating automatically
- ✅ 730-day retention configured
- ✅ Query performance <1s for 30-day range
- ✅ No database errors in logs for 24 hours
- ✅ Backup SQLite database stored safely

## Documentation

- [ ] Document connection string format
- [ ] Add troubleshooting guide
- [ ] Update README with database setup
- [ ] Document backup procedures
- [ ] Add performance monitoring guide

## Dependencies

- **Requires**: Issue #3 (MariaDB on K8s)
- **Blocks**: Issue #6 (Year-over-Year Dashboard needs this data)

## Related Issues

- #3 - MariaDB on Kubernetes (prerequisite)
- #5 - Automated Backups (backs up this data)
- #6 - Year-over-Year Dashboard (uses this data)

## Time Estimate

1-2 hours (plus migration time if migrating existing data)
