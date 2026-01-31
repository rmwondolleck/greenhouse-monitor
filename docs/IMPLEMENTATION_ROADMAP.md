# Implementation Roadmap

Quick reference guide for implementing the long-term storage and year-over-year analysis features.

## 🚀 Quick Start

**Goal**: Get 14-day local storage and 5-day offline alerts working ASAP

**Time**: ~3-4 hours total

**Steps**:
1. [Issue #1](github-issues/ISSUE_01_local_storage_mqtt_reliability.md): Update Pi code (2-3h)
2. [Issue #2](github-issues/ISSUE_02_homeassistant_integration.md): Configure HA automation (1-2h)

**Result**: Resilient system with proactive monitoring ✅

---

## 📊 Full Implementation Path

### Week 1: Foundation
**Focus**: Make the Pi more resilient and enable proactive monitoring

**Issues**: #1, #2

**What you'll achieve**:
- 14 days of local data storage (double current capacity)
- Authenticated MQTT connections
- Offline alerts after 5 days
- Better MQTT topic organization
- System health visibility in HomeAssistant

**Prerequisites**: None

**Time**: 3-4 hours

---

### Week 2: Database Infrastructure
**Focus**: Set up long-term storage on Kubernetes

**Issues**: #3, #4

**What you'll achieve**:
- MariaDB running on K8s with SSD storage
- HomeAssistant using external database
- 2+ year data retention capability
- Foundation for year-over-year analysis

**Prerequisites**:
- Kubernetes cluster access
- kubectl configured
- Storage class available

**Time**: 3-5 hours

---

### Week 3: Backup & Analytics
**Focus**: Protect your data and start analyzing trends

**Issues**: #5, #6

**What you'll achieve**:
- Weekly automated backups to Synology NAS
- 12 weeks of backup history
- Year-over-year comparison dashboard
- Historical trend analysis
- CSV export capability

**Prerequisites**:
- Week 2 completed
- NFS share on Synology NAS
- At least some historical data (more is better)

**Time**: 6-9 hours

---

### Future: Multi-Sensor
**Focus**: Add outdoor sensor for comparative analysis

**Issue**: #7

**What you'll achieve**:
- Outdoor temperature/humidity monitoring
- Greenhouse vs outdoor comparison
- Greenhouse thermal efficiency metrics
- Enhanced year-over-year with outdoor data

**Prerequisites**:
- All previous phases complete
- Additional sensor hardware OR weather API subscription

**Time**: 6-8 hours

---

## 🎯 Decision Points

### Do I need Kubernetes?

**Yes, if**:
- You already have K8s running (you do!)
- You want professional-grade infrastructure
- You plan to add more services later
- You want easy backups to NAS

**Alternative**:
- Run MariaDB directly on Synology NAS
- Slower but simpler
- See Issue #4 for details

### Do I need MariaDB?

**Yes, if**:
- You want 2+ years of historical data
- You plan year-over-year analysis
- You need good query performance
- You have multiple sensors (future)

**Alternative**:
- Keep HA's default SQLite
- Limit retention to 180-365 days
- Still get long-term statistics (hourly/daily aggregates)
- Simpler but less powerful

### When should I start?

**Now, if**:
- You've experienced data loss from SD card failure
- You've missed issues because you didn't know Pi was down
- You want to understand long-term trends

**Later, if**:
- Current system is working fine
- You're not interested in historical analysis yet
- You're planning major changes to the setup

---

## 📋 Checklists

### Pre-Implementation Checklist

**Before starting any work**:
- [ ] Current system is stable and working
- [ ] Backup current SD card image
- [ ] Document current configuration
- [ ] Have rollback plan ready
- [ ] Schedule maintenance window (if needed)

**For K8s work** (Issues #3, #5):
- [ ] `kubectl` access verified
- [ ] Namespace creation allowed
- [ ] PVC creation allowed
- [ ] Know your storage class name
- [ ] NAS IP and NFS export path noted

**For database work** (Issue #4):
- [ ] Backup HA database (SQLite)
- [ ] Test database connection from HA host
- [ ] Have database credentials ready
- [ ] Understand HA restart procedure

### Post-Implementation Verification

**After Issue #1**:
- [ ] Pi storing 14 days locally
- [ ] MQTT connects with authentication
- [ ] Old data purges correctly
- [ ] Queue retains 14 days
- [ ] No data loss during test outage

**After Issue #2**:
- [ ] All sensors appear in HA
- [ ] Values update every 5 minutes
- [ ] Offline alert configured
- [ ] LWT working (test by stopping Pi)

**After Issue #3**:
- [ ] MariaDB pod running
- [ ] PVC bound to SSD storage
- [ ] Can connect from HA host
- [ ] Database accessible

**After Issue #4**:
- [ ] HA connected to MariaDB
- [ ] New data appearing in database
- [ ] History graphs working
- [ ] Statistics generating
- [ ] No performance degradation

**After Issue #5**:
- [ ] Backup CronJob scheduled
- [ ] First backup completed successfully
- [ ] Backup file on NAS
- [ ] Restore procedure tested
- [ ] Old backups cleaned up

**After Issue #6**:
- [ ] Dashboard shows year-over-year charts
- [ ] Can compare multiple years
- [ ] Export works
- [ ] Mobile responsive
- [ ] Performance acceptable

---

## 🔧 Troubleshooting Quick Reference

### Pi Issues
```bash
# Check service status
sudo systemctl status greenhouse-monitor

# View logs
journalctl -u greenhouse-monitor -f

# Check disk usage
df -h

# Check data directory
ls -lh ./data/
```

### MQTT Issues
```bash
# Test MQTT connection
mosquitto_sub -h homeassistant.local -p 1883 \
  -u greenhouse_monitor -P your_password \
  -t "greenhouse/#" -v

# Publish test message
mosquitto_pub -h homeassistant.local -p 1883 \
  -u greenhouse_monitor -P your_password \
  -t "greenhouse/monitor1/test" -m "hello"
```

### Kubernetes Issues
```bash
# Check pods
kubectl get pods -n greenhouse

# Check logs
kubectl logs -n greenhouse <pod-name> --tail=50

# Check PVCs
kubectl get pvc -n greenhouse

# Describe pod for events
kubectl describe pod -n greenhouse <pod-name>

# Shell into pod
kubectl exec -it -n greenhouse <pod-name> -- /bin/bash
```

### Database Issues
```bash
# Connect to MariaDB
kubectl exec -it mariadb-0 -n greenhouse -- \
  mysql -u hass -p homeassistant

# Check tables
SHOW TABLES;

# Check data
SELECT COUNT(*) FROM states WHERE entity_id LIKE 'sensor.greenhouse%';

# Check disk usage
SELECT table_name, 
       ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'homeassistant'
ORDER BY (data_length + index_length) DESC
LIMIT 10;
```

### HomeAssistant Issues
```bash
# Check HA logs
tail -f /config/home-assistant.log

# Check HA configuration
ha core check

# Restart HA
ha core restart

# Check recorder status (Developer Tools -> Services)
# Call service: recorder.disable
# Check logs for errors
```

---

## 📚 Reference Documentation

### Key Files to Know

**On Raspberry Pi**:
- `/home/pi/greenhouse-monitor/` - Application directory
- `./data/greenhouse-data.json` - Local data storage
- `./data/mqtt-queue.json` - MQTT queue
- `.env` - Configuration (create from `.env.example`)
- `package.json` - Dependencies

**On Kubernetes**:
- `k8s/mariadb/` - Database manifests
- `k8s/backup/` - Backup job manifests

**In HomeAssistant**:
- `/config/configuration.yaml` - Main config
- `/config/secrets.yaml` - Credentials
- `/config/automations.yaml` - Automations
- `/config/home-assistant_v2.db` - SQLite database (old)

### Important URLs

**When running**:
- Dashboard: `http://pi-ip:3000`
- API: `http://pi-ip:3000/api/*`
- HA: `http://homeassistant.local:8123`

**Documentation**:
- [Main Plan](LONG_TERM_STORAGE_PLAN.md)
- [Issue Templates](github-issues/)
- [Project README](../README.md)

---

## 🎓 Learning Resources

### MQTT
- [MQTT Essentials](https://www.hivemq.com/mqtt-essentials/)
- [HomeAssistant MQTT Discovery](https://www.home-assistant.io/integrations/mqtt/#mqtt-discovery)

### HomeAssistant
- [Recorder Integration](https://www.home-assistant.io/integrations/recorder/)
- [Long-term Statistics](https://www.home-assistant.io/docs/backend/database/)
- [Automations](https://www.home-assistant.io/docs/automation/)

### Kubernetes
- [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
- [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
- [CronJobs](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)

### MariaDB
- [MariaDB Docs](https://mariadb.com/kb/en/documentation/)
- [Performance Tuning](https://mariadb.com/kb/en/server-system-variables/)

---

## 💡 Tips for Success

1. **Start small**: Do Issue #1 first. Get comfortable with changes before moving on.

2. **Test thoroughly**: Each issue has a testing checklist. Don't skip it!

3. **Backup everything**: Before each phase, backup your current state.

4. **Document changes**: Keep notes on what you changed and why.

5. **One issue at a time**: Resist the urge to do multiple issues at once.

6. **Wait for data**: After Issue #4, let the system run for weeks/months before doing #6. The dashboard is more useful with more data.

7. **Monitor**: Keep an eye on disk usage, CPU, memory, especially after database migration.

8. **Ask for help**: GitHub issues, Home Assistant forums, and r/homeassistant are great resources.

---

## 🎉 Success!

Once you complete all phases, you'll have:

✅ 14 days of local resilience
✅ Proactive offline monitoring  
✅ Years of historical data
✅ Automated backups to NAS
✅ Beautiful year-over-year analysis
✅ Professional-grade infrastructure
✅ Foundation for future expansion

**Congratulations on building a production-grade greenhouse monitoring system!** 🌱📊
