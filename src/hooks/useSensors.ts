import { useState, useEffect } from 'react';
import { SensorTelemetry } from '../types/sensor';
import { INITIAL_SENSOR_DATA } from '../data/mockSensors';

export function useSensors(isDemoActive: boolean = false, demoOverride?: Partial<SensorTelemetry>) {
  const [telemetry, setTelemetry] = useState<SensorTelemetry>(INITIAL_SENSOR_DATA);

  useEffect(() => {
    if (isDemoActive && demoOverride) {
      setTelemetry(prev => ({
        ...prev,
        ...demoOverride,
      }));
      return;
    }

    // Live continuous physical simulation loop
    const interval = setInterval(() => {
      setTelemetry(prev => {
        // Natural wind speed variation (6.0 - 11.5 m/s)
        const windVariation = (Math.random() - 0.5) * 0.4;
        const newWindSpeed = Math.max(5.5, Math.min(12.0, +(prev.windSpeed + windVariation).toFixed(1)));
        
        // Generation is proportional to wind speed cube / aerodynamics
        const newGenerationKw = +(Math.pow(newWindSpeed / 8.0, 2.2) * 2.2).toFixed(1);
        
        // Power consumption of cooling compressor (1.4 - 2.0 kW)
        const newConsumptionKw = prev.coolingCompressorState === 'ACTIVE' ? 1.6 : prev.coolingCompressorState === 'TURBO' ? 2.4 : 0.4;
        
        // Net power balance
        const newAvailableKw = +(newGenerationKw - newConsumptionKw).toFixed(1);
        
        // Battery SOC slowly adjusts based on surplus or deficit
        let newBattery = prev.batteryLevel;
        if (newAvailableKw > 0) {
          newBattery = Math.min(100, +(prev.batteryLevel + 0.1).toFixed(1));
        } else {
          newBattery = Math.max(15, +(prev.batteryLevel - 0.1).toFixed(1));
        }
        
        // Chamber temperature natural slight oscillation (4.6 - 5.0 °C)
        const tempDrift = (Math.random() - 0.5) * 0.1;
        const newTemp = Math.max(3.8, Math.min(6.2, +(prev.temperature + tempDrift).toFixed(1)));
        
        // Humidity natural oscillation (70 - 75%)
        const humDrift = Math.floor((Math.random() - 0.5) * 2);
        const newHumidity = Math.max(68, Math.min(78, prev.humidity + humDrift));

        return {
          ...prev,
          windSpeed: newWindSpeed,
          windGenerationKw: newGenerationKw,
          powerConsumptionKw: newConsumptionKw,
          powerAvailableKw: newAvailableKw,
          batteryLevel: newBattery,
          temperature: newTemp,
          humidity: newHumidity,
          timestamp: new Date().toISOString(),
        };
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isDemoActive, demoOverride]);

  return { telemetry, setTelemetry };
}
