# Issue #5: Automated Weekly Backups to NAS

## Labels
`infrastructure`, `backup`, `kubernetes`, `priority-medium`, `phase-5`

## Milestone
Phase 5: Automated Backups to NAS

## Description

Implement automated weekly backups of the MariaDB database to Synology NAS for disaster recovery. Backups will be compressed SQL dumps stored on NAS via NFS mount, with 12-week retention.

## Goals

- Create weekly backup CronJob in Kubernetes
- Mount Synology NAS via NFS
- Compress and archive database dumps
- Implement 12-week backup rotation
- Monitor backup job success/failure
- Document restore procedures

## Prerequisites

- Issue #3 completed (MariaDB running on K8s)
- Synology NAS accessible from K8s cluster
- NFS export configured on NAS

## Tasks

### 1. Configure NFS Export on Synology NAS

On your Synology NAS:

- [ ] Create shared folder: `/volume1/backups/greenhouse`

- [ ] Enable NFS:
  - Control Panel → File Services → NFS → Enable NFS
  - Select NFS v4.1

- [ ] Configure NFS permissions:
  - Right-click shared folder → NFS Permissions
  - Create rule:
    - Server: `<k8s-cluster-network>` (e.g., `192.168.1.0/24`)
    - Privilege: Read/Write
    - Squash: Map all users to admin
    - Security: sys

- [ ] Note NAS IP and export path:
  ```
  NAS_IP: 192.168.1.100
  EXPORT: /volume1/backups/greenhouse
  ```

### 2. Create NFS PersistentVolume in K8s

- [ ] Create PV pointing to NAS:
  ```yaml
  apiVersion: v1
  kind: PersistentVolume
  metadata:
    name: nas-backup-pv
  spec:
    capacity:
      storage: 100Gi  # Symbolic - NFS doesn't enforce
    accessModes:
      - ReadWriteMany
    persistentVolumeReclaimPolicy: Retain
    nfs:
      server: 192.168.1.100  # Your NAS IP
      path: /volume1/backups/greenhouse
      readOnly: false
  ```

- [ ] Create PVC:
  ```yaml
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: nas-backup
    namespace: greenhouse
  spec:
    accessModes:
      - ReadWriteMany
    resources:
      requests:
        storage: 100Gi
    volumeName: nas-backup-pv
  ```

### 3. Create Backup Script ConfigMap

- [ ] Create backup script:
  ```yaml
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: backup-scripts
    namespace: greenhouse
  data:
    backup.sh: |
      #!/bin/bash
      set -e
      
      echo "==================================="
      echo "Greenhouse Database Backup"
      echo "Started: $(date)"
      echo "==================================="
      
      # Configuration
      BACKUP_DIR="/backup"
      TIMESTAMP=$(date +%Y%m%d-%H%M%S)
      BACKUP_FILE="greenhouse-db-${TIMESTAMP}.sql"
      BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
      
      # Database credentials from environment
      DB_HOST="${MARIADB_HOST}"
      DB_PORT="${MARIADB_PORT}"
      DB_NAME="${MARIADB_DATABASE}"
      DB_USER="${MARIADB_USER}"
      DB_PASS="${MARIADB_PASSWORD}"
      
      # Create backup directory if not exists
      mkdir -p "${BACKUP_DIR}"
      
      # Dump database
      echo "Creating database dump..."
      mysqldump \
        --host="${DB_HOST}" \
        --port="${DB_PORT}" \
        --user="${DB_USER}" \
        --password="${DB_PASS}" \
        --single-transaction \
        --quick \
        --lock-tables=false \
        "${DB_NAME}" > "${BACKUP_PATH}"
      
      # Check if dump was successful
      if [ ! -s "${BACKUP_PATH}" ]; then
        echo "ERROR: Backup file is empty!"
        exit 1
      fi
      
      # Get file size
      BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
      echo "Backup size: ${BACKUP_SIZE}"
      
      # Compress backup
      echo "Compressing backup..."
      gzip "${BACKUP_PATH}"
      COMPRESSED_FILE="${BACKUP_PATH}.gz"
      COMPRESSED_SIZE=$(du -h "${COMPRESSED_FILE}" | cut -f1)
      echo "Compressed size: ${COMPRESSED_SIZE}"
      
      # Remove old backups (keep 12 weeks = 84 days)
      echo "Cleaning old backups (older than 84 days)..."
      find "${BACKUP_DIR}" -name "greenhouse-db-*.sql.gz" -mtime +84 -delete
      
      # List remaining backups
      echo "Current backups:"
      ls -lh "${BACKUP_DIR}"/greenhouse-db-*.sql.gz | tail -n 12
      
      # Count backups
      BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/greenhouse-db-*.sql.gz 2>/dev/null | wc -l)
      echo "Total backups: ${BACKUP_COUNT}"
      
      echo "==================================="
      echo "Backup completed successfully!"
      echo "File: ${COMPRESSED_FILE}"
      echo "Completed: $(date)"
      echo "==================================="
      
    restore.sh: |
      #!/bin/bash
      # Restore script (for manual use)
      
      if [ -z "$1" ]; then
        echo "Usage: $0 <backup-file.sql.gz>"
        echo "Available backups:"
        ls -lh /backup/greenhouse-db-*.sql.gz
        exit 1
      fi
      
      BACKUP_FILE="$1"
      
      if [ ! -f "${BACKUP_FILE}" ]; then
        echo "ERROR: Backup file not found: ${BACKUP_FILE}"
        exit 1
      fi
      
      echo "WARNING: This will restore the database from backup!"
      echo "Backup file: ${BACKUP_FILE}"
      echo "Press ENTER to continue or CTRL+C to cancel..."
      read
      
      echo "Restoring database..."
      gunzip -c "${BACKUP_FILE}" | mysql \
        --host="${MARIADB_HOST}" \
        --port="${MARIADB_PORT}" \
        --user="${MARIADB_USER}" \
        --password="${MARIADB_PASSWORD}" \
        "${MARIADB_DATABASE}"
      
      echo "Restore completed!"
  ```

### 4. Create Backup CronJob

- [ ] Create CronJob:
  ```yaml
  apiVersion: batch/v1
  kind: CronJob
  metadata:
    name: mariadb-backup
    namespace: greenhouse
  spec:
    # Every Sunday at 2 AM
    schedule: "0 2 * * 0"
    successfulJobsHistoryLimit: 3
    failedJobsHistoryLimit: 3
    jobTemplate:
      spec:
        template:
          spec:
            restartPolicy: OnFailure
            containers:
            - name: backup
              image: mariadb:11.2
              command: ["/bin/bash", "/scripts/backup.sh"]
              env:
              - name: MARIADB_HOST
                value: "mariadb.greenhouse.svc.cluster.local"
              - name: MARIADB_PORT
                value: "3306"
              - name: MARIADB_DATABASE
                value: "homeassistant"
              - name: MARIADB_USER
                value: "hass"
              - name: MARIADB_PASSWORD
                valueFrom:
                  secretKeyRef:
                    name: mariadb-secrets
                    key: user-password
              volumeMounts:
              - name: backup
                mountPath: /backup
              - name: scripts
                mountPath: /scripts
              resources:
                requests:
                  memory: "256Mi"
                  cpu: "100m"
                limits:
                  memory: "1Gi"
                  cpu: "500m"
            volumes:
            - name: backup
              persistentVolumeClaim:
                claimName: nas-backup
            - name: scripts
              configMap:
                name: backup-scripts
                defaultMode: 0755
  ```

### 5. Test Backup Manually

- [ ] Create a test job (immediate execution):
  ```yaml
  apiVersion: batch/v1
  kind: Job
  metadata:
    name: mariadb-backup-test
    namespace: greenhouse
  spec:
    template:
      spec:
        restartPolicy: OnFailure
        containers:
        - name: backup
          image: mariadb:11.2
          command: ["/bin/bash", "/scripts/backup.sh"]
          env:
          - name: MARIADB_HOST
            value: "mariadb.greenhouse.svc.cluster.local"
          - name: MARIADB_PORT
            value: "3306"
          - name: MARIADB_DATABASE
            value: "homeassistant"
          - name: MARIADB_USER
            value: "hass"
          - name: MARIADB_PASSWORD
            valueFrom:
              secretKeyRef:
                name: mariadb-secrets
                key: user-password
          volumeMounts:
          - name: backup
            mountPath: /backup
          - name: scripts
            mountPath: /scripts
        volumes:
        - name: backup
          persistentVolumeClaim:
            claimName: nas-backup
        - name: scripts
          configMap:
            name: backup-scripts
            defaultMode: 0755
  ```

- [ ] Apply and monitor:
  ```bash
  kubectl apply -f backup-test-job.yaml
  kubectl logs -f job/mariadb-backup-test -n greenhouse
  ```

- [ ] Verify backup on NAS:
  ```bash
  # On NAS or via NFS mount
  ls -lh /volume1/backups/greenhouse/
  ```

### 6. Test Restore Procedure

⚠️ **Test in a separate database first!**

- [ ] Create test restore job:
  ```bash
  kubectl run -it --rm restore-test \
    --image=mariadb:11.2 \
    --restart=Never \
    -n greenhouse \
    --overrides='
    {
      "spec": {
        "containers": [{
          "name": "restore-test",
          "image": "mariadb:11.2",
          "stdin": true,
          "tty": true,
          "env": [
            {"name": "MARIADB_HOST", "value": "mariadb.greenhouse.svc.cluster.local"},
            {"name": "MARIADB_PORT", "value": "3306"},
            {"name": "MARIADB_DATABASE", "value": "homeassistant"},
            {"name": "MARIADB_USER", "value": "hass"},
            {"name": "MARIADB_PASSWORD", "valueFrom": {"secretKeyRef": {"name": "mariadb-secrets", "key": "user-password"}}}
          ],
          "volumeMounts": [
            {"name": "backup", "mountPath": "/backup"},
            {"name": "scripts", "mountPath": "/scripts"}
          ]
        }],
        "volumes": [
          {"name": "backup", "persistentVolumeClaim": {"claimName": "nas-backup"}},
          {"name": "scripts", "configMap": {"name": "backup-scripts", "defaultMode": 493}}
        ]
      }
    }' -- /bin/bash
  ```

- [ ] Inside the pod, run restore:
  ```bash
  bash /scripts/restore.sh /backup/greenhouse-db-YYYYMMDD-HHMMSS.sql.gz
  ```

### 7. Set Up Monitoring

- [ ] Create ServiceMonitor for backup job status (if using Prometheus)

- [ ] Add HA automation to alert on backup failure:
  ```yaml
  automation:
    - alias: "Greenhouse Backup Failed"
      trigger:
        - platform: state
          entity_id: sensor.greenhouse_backup_status
          to: "failed"
      action:
        - service: notify.persistent_notification
          data:
            title: "⚠️ Greenhouse Backup Failed"
            message: "Weekly database backup failed. Check K8s logs."
  ```

### 8. Document Procedures

- [ ] Create `docs/backup-restore.md` with:
  - Backup schedule
  - How to manually trigger backup
  - Restore procedures
  - Troubleshooting
  - Monitoring

## File Structure

Create these files in `k8s/backup/`:
```
k8s/
└── backup/
    ├── nfs-pv.yaml
    ├── nfs-pvc.yaml
    ├── backup-scripts-configmap.yaml
    ├── backup-cronjob.yaml
    ├── backup-test-job.yaml
    └── README.md
```

## Testing Checklist

- [ ] NFS mount accessible from K8s
- [ ] PV and PVC created successfully
- [ ] Backup script runs without errors
- [ ] Backup file created on NAS
- [ ] Backup file is compressed (.gz)
- [ ] Backup file is not empty (>1MB)
- [ ] Old backups are automatically deleted (>84 days)
- [ ] Restore procedure works
- [ ] CronJob schedule is correct (Sundays 2 AM)
- [ ] Logs are accessible via kubectl

## Success Criteria

- ✅ Weekly backups running automatically
- ✅ Backups stored on NAS via NFS
- ✅ Backup files compressed (<500MB per backup)
- ✅ 12 weeks of backups retained
- ✅ Restore procedure tested and documented
- ✅ Monitoring alerts configured
- ✅ Backup job completes in <10 minutes

## Troubleshooting

### NFS mount fails
- Check NAS IP and export path
- Verify NFS permissions on NAS
- Test mount from K8s node: `mount -t nfs 192.168.1.100:/volume1/backups/greenhouse /mnt/test`

### Backup job fails
- Check logs: `kubectl logs job/mariadb-backup-xxx -n greenhouse`
- Verify database credentials
- Check disk space on NAS

### Permission denied writing to NAS
- Check NFS squash settings
- Try setting `Squash: Map all users to admin`
- Check folder permissions on NAS

## Documentation

- [ ] Create `docs/backup-restore.md`
- [ ] Update README with backup information
- [ ] Document restore procedures
- [ ] Add troubleshooting guide

## Dependencies

- **Requires**: Issue #3 (MariaDB on K8s)
- **Requires**: Issue #4 (HA using MariaDB)

## Related Issues

- #3 - MariaDB on Kubernetes (backs up this database)
- #4 - HomeAssistant Database Migration (data being backed up)

## Time Estimate

2-3 hours
