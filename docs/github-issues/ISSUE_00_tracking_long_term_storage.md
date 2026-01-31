# Long-Term Storage Implementation - Tracking Issue

## Labels
`enhancement`, `infrastructure`, `tracking`, `priority-high`

## Milestone
Long-Term Storage & Year-over-Year Analysis

## Description

This is a tracking issue for implementing long-term storage and year-over-year analysis capabilities for the Greenhouse Monitor project. This implementation will leverage existing Kubernetes cluster and Synology NAS infrastructure.

## Overview

A comprehensive enhancement to add multi-year data retention, automated backups, and year-over-year comparison capabilities to the Greenhouse Monitor system.

### Goals

- 🎯 **Extended Local Storage**: Increase from 7 to 14 days for better resilience
- 🔔 **Proactive Monitoring**: Get alerts when the Pi goes offline for 5+ days
- 💾 **Multi-Year Retention**: Store 2+ years of detailed greenhouse data
- 🔄 **Automated Backups**: Weekly backups to NAS with 12-week retention
- 📊 **Year-over-Year Analysis**: Compare greenhouse conditions across multiple years
- 🌡️ **Future: Outdoor Sensor**: Compare indoor vs outdoor temperatures

### Architecture

```
┌─────────────────┐
│  Raspberry Pi   │  • 14-day local storage
│  (Greenhouse)   │  • MQTT publisher
└────────┬────────┘  • Resilient queue
         │
         │ MQTT (auth, QoS 1, LWT)
         ▼
┌──────────────────┐
│  HomeAssistant   │  • MQTT broker
│                  │  • Recorder component
│                  │  • 5-day offline alerts
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  K8s Cluster     │  • MariaDB (100GB SSD)
│                  │  • 2+ years raw data
│                  │  • Forever: statistics
│                  │  • Weekly backup job
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Synology NAS    │  • 12 weeks backups
│                  │  • Disaster recovery
└──────────────────┘
```

### Time Estimate

**Total**: 20-30 hours over 3-4 weeks

### Cost

- ✅ **$0** - Uses existing infrastructure (K8s cluster, NAS, Raspberry Pi)
- ⚠️ **Optional**: $10-50 for outdoor sensor (future enhancement)

## Sub-Issues

This tracking issue depends on the following implementation phases:

### Phase 1: Enhanced Local Storage & MQTT Reliability (High Priority)
- [ ] #TBD - Enhanced Local Storage & MQTT Reliability (2-3h)
  - Extend local storage to 14 days
  - Add MQTT authentication and QoS 1
  - Implement Last Will & Testament for offline detection
  - Publish last_seen timestamp for monitoring

### Phase 2: HomeAssistant Integration (High Priority)
- [ ] #TBD - HomeAssistant MQTT Integration & Alerts (1-2h)
  - Configure MQTT sensor integration
  - Set up 5-day offline alerts
  - Add automation for alert notifications
  - Create dashboard card for monitoring

### Phase 3: Database Infrastructure (High Priority)
- [ ] #TBD - Deploy MariaDB on Kubernetes (2-3h)
  - Create K8s namespace and resources
  - Deploy MariaDB with persistent storage
  - Configure for HomeAssistant compatibility
  - Set up initial security and access

### Phase 4: Database Migration (Medium Priority)
- [ ] #TBD - Migrate HomeAssistant to External Database (1-2h)
  - Update HA configuration for external database
  - Migrate existing data
  - Configure recorder with optimal purge settings
  - Verify data retention

### Phase 5: Backup System (Medium Priority)
- [ ] #TBD - Automated Weekly Backups to NAS (2-3h)
  - Create CronJob for weekly backups
  - Configure NFS mount to Synology NAS
  - Implement backup rotation (12 weeks)
  - Test restore procedures

### Phase 6: Analytics Dashboard (Medium Priority)
- [ ] #TBD - Year-over-Year Analysis Dashboard (4-6h)
  - Query API for historical data
  - React component for comparison charts
  - Date range selector
  - Side-by-side year comparison view

### Phase 7: Multi-Sensor Support (Low Priority - Future)
- [ ] #TBD - Outdoor Sensor Support (6-8h)
  - Add support for multiple DHT11 sensors
  - Outdoor vs indoor temperature comparison
  - Thermal efficiency metrics
  - Enhanced dashboard with outdoor data

## Implementation Sequence

### Week 1: Quick Wins
- **Phase 1** + **Phase 2**: Immediate improvements to local resilience and alerting (3-5h)

### Week 2: Infrastructure
- **Phase 3** + **Phase 4**: Database foundation for long-term storage (3-5h)

### Week 3: Reliability & Analytics
- **Phase 5** + **Phase 6**: Backups and year-over-year analysis (6-9h)

### Future: Advanced Features
- **Phase 7**: Multi-sensor support when needed (6-8h)

## Success Criteria

- ✅ Pi maintains 14 days of local data
- ✅ Alerts received within 5 days of Pi going offline
- ✅ Database stores 2+ years of greenhouse data
- ✅ Weekly backups running automatically
- ✅ Year-over-year dashboard shows historical comparisons
- ✅ All systems tested and documented

## Documentation

For detailed planning and architecture information, see:
- 📋 [Executive Summary](../EXECUTIVE_SUMMARY.md)
- 📖 [Implementation Roadmap](../IMPLEMENTATION_ROADMAP.md)
- 🏗️ [Technical Plan](../LONG_TERM_STORAGE_PLAN.md)
- 🎫 [GitHub Issues README](./README.md)

## Notes

- Each sub-issue is independent and provides value on its own
- Phases can be implemented over multiple weeks as time allows
- All infrastructure components already exist (K8s, NAS, Pi)
- No cloud services or subscriptions required

## Testing Checklist

After completing all phases:
- [ ] Pi continues to function after 14+ days without HA connectivity
- [ ] Offline alerts trigger within 5 days
- [ ] Historical data queryable for 2+ years
- [ ] Backups complete successfully each week
- [ ] Dashboard shows year-over-year comparisons
- [ ] All documentation updated

---

**Ready to build a production-grade greenhouse monitoring system!** 🌱🚀
