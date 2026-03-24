#!/usr/bin/env node

import { initializeDatabase } from './connection.js';
import dotenv from 'dotenv';

dotenv.config();

initializeDatabase()
  .then(() => {
    console.log('Database schema created successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error initializing database:', error);
    process.exit(1);
  });
