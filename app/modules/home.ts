import { onMount, onDestroy } from 'svelte';
  import { getBatteryLevel, addBatteryListener } from './battery';

  let time = new Date().toLocaleTimeString();
  let date = new Date().toLocaleDateString();
  let temp = "22°C";
  let batteryLevel: number | undefined;

  setInterval(() => {
    time = new Date().toLocaleTimeString();
  }, 1000);

  onMount(() => {
    batteryLevel = getBatteryLevel();

    addBatteryListener((level: number) => {
      batteryLevel = level;
    });

    return () => {
      if (Application.android) {
        Application.android.unregisterBroadcastReceiver(android.content.Intent.ACTION_BATTERY_CHANGED);
      }
    };
  });