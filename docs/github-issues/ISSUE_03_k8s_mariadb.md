# Issue #3: Deploy MariaDB on Kubernetes for Long-Term Storage

## Labels
`infrastructure`, `kubernetes`, `database`, `priority-high`, `phase-3`

## Milestone
Phase 3: MariaDB on Kubernetes

## Description

Deploy MariaDB on Kubernetes cluster with SSD-backed storage to serve as the long-term database for HomeAssistant's recorder component. This enables multi-year data retention for year-over-year analysis.

## Goals

- Deploy production-ready MariaDB StatefulSet on K8s
- Configure 100GB SSD-backed storage
- Set up database for HomeAssistant
- Ensure high availability and reliability
- Test connectivity from HomeAssistant

## Prerequisites

- Access to Kubernetes cluster
- `kubectl` configured
- Storage class with SSD backing available

## Tasks

### 1. Create Namespace

- [ ] Create dedicated namespace for greenhouse services
  ```bash
  kubectl create namespace greenhouse
  ```

### 2. Create MariaDB Secret

- [ ] Generate secure passwords
- [ ] Create Kubernetes secret:
  ```yaml
  apiVersion: v1
  kind: Secret
  metadata:
    name: mariadb-secrets
    namespace: greenhouse
  type: Opaque
  stringData:
    root-password: <generate_secure_password>
    user-password: <generate_secure_password>
  ```

### 3. Create PersistentVolumeClaim

- [ ] Create 100GB PVC with SSD storage class:
  ```yaml
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: mariadb-data
    namespace: greenhouse
  spec:
    accessModes:
      - ReadWriteOnce
    storageClassName: <your-ssd-storage-class>
    resources:
      requests:
        storage: 100Gi
  ```

### 4. Create ConfigMap for MariaDB Configuration

- [ ] Create ConfigMap with optimized settings:
  ```yaml
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: mariadb-config
    namespace: greenhouse
  data:
    custom.cnf: |
      [mysqld]
      # Performance settings for time-series data
      max_connections=50
      innodb_buffer_pool_size=2G
      innodb_log_file_size=256M
      innodb_flush_log_at_trx_commit=2
      innodb_flush_method=O_DIRECT
      
      # Character set for HomeAssistant
      character-set-server=utf8mb4
      collation-server=utf8mb4_unicode_ci
      
      # Logging
      slow_query_log=1
      slow_query_log_file=/var/log/mysql/slow.log
      long_query_time=2
  ```

### 5. Deploy MariaDB StatefulSet

- [ ] Create StatefulSet manifest:
  ```yaml
  apiVersion: apps/v1
  kind: StatefulSet
  metadata:
    name: mariadb
    namespace: greenhouse
  spec:
    serviceName: mariadb
    replicas: 1
    selector:
      matchLabels:
        app: mariadb
    template:
      metadata:
        labels:
          app: mariadb
      spec:
        containers:
        - name: mariadb
          image: mariadb:11.2
          env:
          - name: MARIADB_ROOT_PASSWORD
            valueFrom:
              secretKeyRef:
                name: mariadb-secrets
                key: root-password
          - name: MARIADB_DATABASE
            value: homeassistant
          - name: MARIADB_USER
            value: hass
          - name: MARIADB_PASSWORD
            valueFrom:
              secretKeyRef:
                name: mariadb-secrets
                key: user-password
          ports:
          - containerPort: 3306
            name: mysql
          volumeMounts:
          - name: data
            mountPath: /var/lib/mysql
          - name: config
            mountPath: /etc/mysql/conf.d
          resources:
            requests:
              memory: "2Gi"
              cpu: "500m"
            limits:
              memory: "4Gi"
              cpu: "2000m"
          livenessProbe:
            exec:
              command:
              - mysqladmin
              - ping
              - -h
              - localhost
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
          readinessProbe:
            exec:
              command:
              - mysqladmin
              - ping
              - -h
              - localhost
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 1
        volumes:
        - name: config
          configMap:
            name: mariadb-config
    volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: <your-ssd-storage-class>
        resources:
          requests:
            storage: 100Gi
  ```

### 6. Create Service

- [ ] Create ClusterIP service:
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: mariadb
    namespace: greenhouse
  spec:
    selector:
      app: mariadb
    ports:
    - port: 3306
      targetPort: 3306
      name: mysql
    type: ClusterIP
  ```

### 7. Initialize Database

- [ ] Verify pod is running:
  ```bash
  kubectl get pods -n greenhouse
  ```

- [ ] Test database connection:
  ```bash
  kubectl exec -it mariadb-0 -n greenhouse -- \
    mysql -u hass -p homeassistant
  ```

- [ ] Create initial schema (if needed):
  ```sql
  SHOW DATABASES;
  USE homeassistant;
  SHOW TABLES;
  ```

### 8. Configure Network Access for HomeAssistant

**Option A: Service Exposure (if HA is in K8s)**
- [ ] Use service DNS: `mariadb.greenhouse.svc.cluster.local`

**Option B: NodePort (if HA is external)**
- [ ] Create NodePort service:
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: mariadb-external
    namespace: greenhouse
  spec:
    type: NodePort
    selector:
      app: mariadb
    ports:
    - port: 3306
      targetPort: 3306
      nodePort: 30306  # Choose available port 30000-32767
  ```

**Option C: LoadBalancer (if available)**
- [ ] Use LoadBalancer service for external IP

### 9. Test Connectivity from HomeAssistant

- [ ] From HA host, test connection:
  ```bash
  mysql -h <k8s-node-ip> -P 30306 -u hass -p homeassistant
  ```
  
- [ ] Verify connection string works:
  ```
  mysql://hass:<password>@<k8s-node-ip>:30306/homeassistant
  ```

### 10. Set Up Monitoring

- [ ] Configure Prometheus ServiceMonitor (if using Prometheus):
  ```yaml
  apiVersion: monitoring.coreos.com/v1
  kind: ServiceMonitor
  metadata:
    name: mariadb
    namespace: greenhouse
  spec:
    selector:
      matchLabels:
        app: mariadb
    endpoints:
    - port: mysql
  ```

- [ ] Set up disk usage alerts
- [ ] Monitor query performance
- [ ] Track connection count

## File Structure

Create these files in `k8s/mariadb/`:
```
k8s/
└── mariadb/
    ├── namespace.yaml
    ├── secret.yaml.example
    ├── configmap.yaml
    ├── statefulset.yaml
    ├── service.yaml
    ├── service-external.yaml  # If using NodePort/LoadBalancer
    └── README.md
```

## Testing Checklist

- [ ] Pod starts successfully
- [ ] PVC is bound and using SSD storage class
- [ ] Database `homeassistant` exists
- [ ] User `hass` can connect
- [ ] Can create/read tables
- [ ] Connection from HA host works
- [ ] Liveness/readiness probes pass
- [ ] Pod survives restart (data persists)
- [ ] Performance is acceptable (<100ms for simple queries)

## Success Criteria

- ✅ MariaDB pod running in K8s
- ✅ 100GB SSD storage allocated and bound
- ✅ Database accessible from HomeAssistant host
- ✅ Connection string validated
- ✅ Liveness and readiness probes passing
- ✅ Data persists across pod restarts

## Security Considerations

- [ ] Strong passwords generated
- [ ] Secrets stored in Kubernetes Secrets
- [ ] Network policies configured (optional)
- [ ] Non-root user for database operations
- [ ] Regular password rotation documented

## Documentation

- [ ] Create `k8s/mariadb/README.md` with:
  - Deployment instructions
  - Connection information
  - Maintenance procedures
  - Troubleshooting guide
  - Backup/restore procedures
- [ ] Update main README with K8s setup
- [ ] Document connection string format

## Dependencies

None - can be done in parallel with Phase 1 & 2

## Related Issues

- #4 - HomeAssistant Database Migration (uses this database)
- #5 - Automated Backups (backs up this database)

## Time Estimate

2-3 hours
