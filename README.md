# Greenhouse Monitor

Raspberry Pi Greenhouse Environmental Monitor with DHT11 sensor

![greenhouse-monitor-dashboard.png](images/greenhouse-monitor-dashboard.png)
## Overview

Greenhouse Monitor is a full-stack TypeScript application for monitoring and recording environmental conditions in a greenhouse using a Raspberry Pi and DHT11 temperature/humidity sensor. The project includes a React-based dashboard with real-time sensor readings and system monitoring.

## Features

- Real-time temperature and humidity monitoring
- Automatic classification of growing conditions
- 16x2 LCD display support with sleep mode to prevent screen burn-in
- Raspberry Pi system monitoring (CPU temperature, memory, disk usage)
- Beautiful React dashboard with responsive design using Tailwind CSS
- Historical data logging with configurable intervals
- Development mode with hardware simulation for testing without a Raspberry Pi

## Hardware Requirements

- Raspberry Pi (any model with GPIO pins)
- DHT11 temperature and humidity sensor
- Optional: 16x2 LCD display (I2C interface)

## Software Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- Raspberry Pi OS (for deployment to Raspberry Pi)
- I2C enabled on the Raspberry Pi (for LCD display)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/greenhouse-monitor.git
   cd greenhouse-monitor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

## Running the Application

### Development Environment (Simulated Hardware)

For development on computers without connected sensors:
