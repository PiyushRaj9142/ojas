import React from 'react';
import { calculateStorageHealth } from '../src/utils/calculations';
import { SensorTelemetry } from '../src/types/sensor';

// Mock telemetry samples
const healthyTelemetry: SensorTelemetry = {
  temperature: 4.8,
  temperatureStatus: 'NORMAL',
  humidity: 90,
  humidityStatus: 'NORMAL',
  capacityUsedPercentage: 35,
  capacityUsedKg: 350,
  capacityMaxKg: 1000,
  capacityStatus: 'NORMAL',
  batteryLevel: 94,
  batteryVoltage: 48.2,
  batteryStatus: 'NORMAL',
  windGenerationKw: 1.8,
  windSpeed: 14.5,
  powerConsumptionKw: 0.9,
  powerAvailableKw: 4.2,
  batteryTemp: 24,
  coolingCompressorState: 'ACTIVE',
  ethylenePpm: 0.05,
  timestamp: new Date().toISOString(),
};

const warningTelemetry: SensorTelemetry = {
  ...healthyTelemetry,
  temperature: 6.2,
  batteryLevel: 22,
};

const criticalTelemetry: SensorTelemetry = {
  ...healthyTelemetry,
  temperature: 8.5,
  humidity: 60,
  batteryLevel: 10,
};

function testHealthStatusCalculations() {
  console.log('--- Testing System Status Calculations ---');
  
  // 1. Healthy State
  const healthScore1 = calculateStorageHealth(
    healthyTelemetry.temperature,
    healthyTelemetry.humidity,
    healthyTelemetry.batteryLevel,
    healthyTelemetry.capacityUsedPercentage
  );
  const isHealthy1 = healthScore1 >= 85 && healthyTelemetry.temperature <= 5.5 && healthyTelemetry.batteryLevel >= 25;
  const isWarning1 = !isHealthy1 && (healthScore1 >= 70 || healthyTelemetry.temperature <= 7.0);
  console.log(`Healthy Telemetry -> Score: ${healthScore1}%, isHealthy: ${isHealthy1}, isWarning: ${isWarning1} (Expected: isHealthy=true)`);
  if (!isHealthy1) throw new Error('Healthy telemetry check failed');

  // 2. Warning State
  const healthScore2 = calculateStorageHealth(
    warningTelemetry.temperature,
    warningTelemetry.humidity,
    warningTelemetry.batteryLevel,
    warningTelemetry.capacityUsedPercentage
  );
  const isHealthy2 = healthScore2 >= 85 && warningTelemetry.temperature <= 5.5 && warningTelemetry.batteryLevel >= 25;
  const isWarning2 = !isHealthy2 && (healthScore2 >= 70 || warningTelemetry.temperature <= 7.0);
  console.log(`Warning Telemetry -> Score: ${healthScore2}%, isHealthy: ${isHealthy2}, isWarning: ${isWarning2} (Expected: isWarning=true)`);
  if (isHealthy2 || !isWarning2) throw new Error('Warning telemetry check failed');

  // 3. Critical State
  const healthScore3 = calculateStorageHealth(
    criticalTelemetry.temperature,
    criticalTelemetry.humidity,
    criticalTelemetry.batteryLevel,
    criticalTelemetry.capacityUsedPercentage
  );
  const isHealthy3 = healthScore3 >= 85 && criticalTelemetry.temperature <= 5.5 && criticalTelemetry.batteryLevel >= 25;
  const isWarning3 = !isHealthy3 && (healthScore3 >= 70 || criticalTelemetry.temperature <= 7.0);
  const isCritical3 = !isHealthy3 && !isWarning3;
  console.log(`Critical Telemetry -> Score: ${healthScore3}%, isHealthy: ${isHealthy3}, isWarning: ${isWarning3}, isCritical: ${isCritical3} (Expected: isCritical=true)`);
  if (isHealthy3 || isWarning3 || !isCritical3) throw new Error('Critical telemetry check failed');

  console.log('✅ All status icon state transitions validated successfully!');
}

testHealthStatusCalculations();
