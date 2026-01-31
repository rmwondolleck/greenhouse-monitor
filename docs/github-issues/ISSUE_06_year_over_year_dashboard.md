# Issue #6: Year-over-Year Analysis Dashboard

## Labels
`enhancement`, `frontend`, `analytics`, `priority-medium`, `phase-6`

## Milestone
Phase 6: Year-over-Year Analysis Dashboard

## Description

Build a comprehensive year-over-year analysis feature in the React dashboard that allows comparison of greenhouse environmental data across multiple years. This enables identification of seasonal patterns and long-term trends.

## Goals

- Create API endpoints for historical data queries
- Add year-over-year comparison charts
- Implement date range selector
- Display statistics (min, max, avg) by year
- Export data for external analysis
- Responsive UI that works on mobile

## Prerequisites

- Issue #4 completed (HA using MariaDB with 2+ years of data)
- Long-term statistics enabled in HomeAssistant
- Historical data available for comparison

## Tasks

### 1. Design Database Queries

- [ ] Research HomeAssistant statistics tables:
  - `statistics_short_term` (10 days, 5-minute intervals)
  - `statistics` (hourly aggregates)
  - `statistics_meta` (metadata for statistics)

- [ ] Create SQL queries for year-over-year:
  ```sql
  -- Get same date range across multiple years
  SELECT 
    YEAR(created) as year,
    MONTH(created) as month,
    DAY(created) as day,
    AVG(mean) as avg_temp,
    MIN(min) as min_temp,
    MAX(max) as max_temp
  FROM statistics s
  JOIN statistics_meta sm ON s.metadata_id = sm.id
  WHERE sm.statistic_id = 'sensor.greenhouse_temperature'
    AND MONTH(created) = ? AND DAY(created) = ?
  GROUP BY year, month, day
  ORDER BY year;
  ```

- [ ] Create queries for:
  - Single day across years
  - Date range across years (e.g., all Januaries)
  - Monthly averages by year
  - Seasonal comparisons

### 2. Create Backend API Endpoints

Add new routes to `server.ts`:

- [ ] **GET `/api/historical/year-over-year`**
  ```typescript
  Query params:
    - month: number (1-12)
    - day: number (1-31)
    - metric: 'temperature' | 'humidity'
  
  Response:
    {
      date: { month: 1, day: 15 },
      metric: 'temperature',
      data: [
        { year: 2024, avg: 72.5, min: 65, max: 80, count: 24 },
        { year: 2025, avg: 73.2, min: 66, max: 81, count: 24 },
        { year: 2026, avg: 71.8, min: 64, max: 79, count: 24 }
      ]
    }
  ```

- [ ] **GET `/api/historical/date-range`**
  ```typescript
  Query params:
    - startMonth: number
    - startDay: number
    - endMonth: number
    - endDay: number
    - years: number[] (array of years to compare)
    - metric: string
  
  Response:
    {
      range: { start: {month:1,day:1}, end: {month:3,day:31} },
      metric: 'temperature',
      years: {
        2024: [ {date:'2024-01-01', avg:70, min:65, max:75}, ... ],
        2025: [ {date:'2025-01-01', avg:71, min:66, max:76}, ... ],
        2026: [ {date:'2026-01-01', avg:69, min:64, max:74}, ... ]
      }
    }
  ```

- [ ] **GET `/api/historical/monthly-stats`**
  ```typescript
  Query params:
    - years: number[]
    - metric: string
  
  Response:
    {
      metric: 'temperature',
      months: [
        {
          month: 1,
          name: 'January',
          years: {
            2024: { avg: 68, min: 55, max: 80 },
            2025: { avg: 70, min: 58, max: 82 },
            2026: { avg: 69, min: 56, max: 81 }
          }
        },
        // ... months 2-12
      ]
    }
  ```

- [ ] **GET `/api/historical/export`**
  ```typescript
  Query params: same as date-range
  Response: CSV file download
  ```

### 3. Create MariaDB Connection Helper

- [ ] Create `src/database/mariadb-client.ts`:
  ```typescript
  import mysql from 'mysql2/promise';
  
  export class MariaDBClient {
    private pool: mysql.Pool;
    
    constructor() {
      this.pool = mysql.createPool({
        host: process.env.MARIADB_HOST,
        port: parseInt(process.env.MARIADB_PORT || '3306'),
        user: process.env.MARIADB_USER,
        password: process.env.MARIADB_PASSWORD,
        database: process.env.MARIADB_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
    
    async getYearOverYear(month: number, day: number, metric: string) {
      // Implementation
    }
    
    async getDateRange(...) {
      // Implementation
    }
    
    async getMonthlyStats(...) {
      // Implementation
    }
  }
  ```

### 4. Create React Components

- [ ] **Component: `YearOverYearDashboard.tsx`**
  - Main container component
  - Date selector
  - Metric selector (temp/humidity)
  - Tab navigation (Single Day, Date Range, Monthly)

- [ ] **Component: `SingleDayComparison.tsx`**
  - Input: Select month and day
  - Display: Line chart showing that day across all years
  - Stats table: avg/min/max for each year

- [ ] **Component: `DateRangeComparison.tsx`**
  - Input: Select date range (e.g., Jan 1 - Mar 31)
  - Input: Select years to compare
  - Display: Multi-line chart (one line per year)
  - Highlight current year

- [ ] **Component: `MonthlyStats.tsx`**
  - Display: Bar chart showing monthly averages by year
  - Table view: sortable by month/year

- [ ] **Component: `YearSelector.tsx`**
  - Multi-select dropdown for years
  - "All years" option
  - "Last 3 years" quick select

- [ ] **Component: `MetricSelector.tsx`**
  - Radio buttons or toggle for Temperature/Humidity
  - Future: support CPU temp, etc.

### 5. Add Charts Library

- [ ] Install Recharts (or Chart.js):
  ```bash
  npm install recharts
  npm install @types/recharts --save-dev
  ```

- [ ] Create reusable chart components:
  - `LineChart.tsx` - Year-over-year trends
  - `BarChart.tsx` - Monthly comparisons
  - `StatsCard.tsx` - Min/Max/Avg display

### 6. Implement Export Functionality

- [ ] Add export button to each view
- [ ] Generate CSV with year-over-year data
- [ ] Download with descriptive filename: `greenhouse-jan15-yoy-2024-2026.csv`

### 7. Mobile Responsive Design

- [ ] Ensure charts resize properly
- [ ] Stack controls vertically on mobile
- [ ] Touch-friendly date pickers
- [ ] Horizontal scrolling for large charts

### 8. Add Loading States & Error Handling

- [ ] Show loading spinner while fetching data
- [ ] Handle "no data available" gracefully
- [ ] Show error messages for failed requests
- [ ] Retry mechanism for failed API calls

### 9. Add Navigation

- [ ] Add "Year-over-Year Analysis" link to main dashboard
- [ ] Breadcrumb navigation
- [ ] Back button to real-time dashboard

## UI Mockup

```
┌────────────────────────────────────────────────┐
│  Greenhouse Monitor                       🏠 ◄ │
├────────────────────────────────────────────────┤
│  📊 Year-over-Year Analysis                    │
│                                                │
│  ┌─────────┬─────────┬──────────┐            │
│  │ Single  │  Range  │ Monthly  │            │
│  │  Day*   │         │          │            │
│  └─────────┴─────────┴──────────┘            │
│                                                │
│  Select Date:  [▼ January ] [▼ 15 ]          │
│  Metric:       (•) Temperature  ( ) Humidity   │
│  Years:        [▼ All Years ▼]                │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │         Temperature on January 15        │ │
│  │  85°F┤                                   │ │
│  │      │      ╱──╲                         │ │
│  │  75°F┤    ╱      ╲    ╱──╲              │ │
│  │      │  ╱          ╲╱      ╲             │ │
│  │  65°F┤╱                      ╲           │ │
│  │      └────────────────────────────────   │ │
│  │       2024    2025    2026               │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Statistics by Year:                           │
│  ┌────────┬──────┬─────┬─────┬───────┐       │
│  │ Year   │ Avg  │ Min │ Max │ Count │       │
│  ├────────┼──────┼─────┼─────┼───────┤       │
│  │ 2024   │ 72°F │ 65° │ 80° │  24   │       │
│  │ 2025   │ 73°F │ 66° │ 81° │  24   │       │
│  │ 2026   │ 72°F │ 64° │ 79° │  24   │       │
│  └────────┴──────┴─────┴─────┴───────┘       │
│                                                │
│  [📥 Export to CSV]                           │
└────────────────────────────────────────────────┘
```

## Environment Variables

Add to Pi `.env`:
```bash
# MariaDB Connection (optional - can query via HA API instead)
MARIADB_HOST=k8s-node-ip
MARIADB_PORT=30306
MARIADB_USER=hass_readonly  # Create read-only user
MARIADB_PASSWORD=<secure_password>
MARIADB_DATABASE=homeassistant
```

## Testing Checklist

- [ ] API endpoints return correct data
- [ ] Charts display properly with multiple years
- [ ] Date selector works correctly
- [ ] Year selector filters data
- [ ] Export generates valid CSV
- [ ] Mobile view is responsive
- [ ] Loading states show during API calls
- [ ] Error messages display when no data
- [ ] Works with 1 year of data (no comparison yet)
- [ ] Works with 5+ years of data
- [ ] Performance: queries complete in <2 seconds

## Success Criteria

- ✅ Can compare same day across multiple years
- ✅ Can compare date range (e.g., winter) across years
- ✅ Monthly statistics display for all years
- ✅ Charts are clear and easy to read
- ✅ Export functionality works
- ✅ Mobile responsive
- ✅ Page loads in <2 seconds
- ✅ Queries return in <1 second

## Future Enhancements

- [ ] Add "this day in history" widget to main dashboard
- [ ] Anomaly detection (days significantly different from historical avg)
- [ ] Degree-days calculation for growing seasons
- [ ] Compare with weather data APIs
- [ ] Overlay outdoor sensor data (Issue #7)
- [ ] Predictive analytics (ML model)

## Documentation

- [ ] Update README with year-over-year feature
- [ ] Add API documentation for new endpoints
- [ ] Screenshot of year-over-year dashboard
- [ ] User guide for analysis features

## Dependencies

- **Requires**: Issue #4 (HA database with historical data)
- **Recommend**: 2+ years of data for meaningful comparison

## Related Issues

- #4 - HomeAssistant Database Migration (provides data)
- #7 - Outdoor Sensor Support (will integrate with this)

## Time Estimate

4-6 hours

## Database Schema Reference

HomeAssistant statistics tables:

```sql
-- Statistics metadata
CREATE TABLE statistics_meta (
  id INTEGER PRIMARY KEY,
  statistic_id VARCHAR(255) UNIQUE,  -- e.g., 'sensor.greenhouse_temperature'
  source VARCHAR(32),
  unit_of_measurement VARCHAR(255),
  has_mean BOOLEAN,
  has_sum BOOLEAN
);

-- Short-term statistics (10 days, 5-min resolution)
CREATE TABLE statistics_short_term (
  id INTEGER PRIMARY KEY,
  created DATETIME,
  metadata_id INTEGER,
  start DATETIME,
  mean DOUBLE,
  min DOUBLE,
  max DOUBLE,
  last_reset DATETIME,
  state DOUBLE,
  sum DOUBLE
);

-- Long-term statistics (hourly, forever)
CREATE TABLE statistics (
  id INTEGER PRIMARY KEY,
  created DATETIME,
  metadata_id INTEGER,
  start DATETIME,
  mean DOUBLE,
  min DOUBLE,
  max DOUBLE,
  last_reset DATETIME,
  state DOUBLE,
  sum DOUBLE
);
```
