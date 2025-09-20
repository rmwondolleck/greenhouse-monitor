// Load environment variables from .env file
import dotenv from 'dotenv';

// Load environment variables as early as possible
// This ensures they're available for the entire application
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

// Configuration
const config = {
    dataDirectory: process.env.GREENHOUSE_DATA_DIR || './data',
    dataFilename: 'greenhouse-data.json',
    maxDataEntries: parseInt(process.env.MAX_DATA_ENTRIES || '8760'), // 1 year of hourly data
    dataSaveInterval: parseInt(process.env.DATA_SAVE_INTERVAL || '300000'), // 5 minutes in ms
    cpuTempThreshold: parseInt(process.env.CPU_TEMP_THRESHOLD || '80'), // Celsius
