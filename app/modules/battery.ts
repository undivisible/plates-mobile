import { Application, Device } from '@nativescript/core';

let batteryLevel: number | undefined;

export function getBatteryLevel(): number | undefined {
  if (Device.os === 'Android') {
    const context = Application.android.context;
    const batteryManager = context.getSystemService(android.content.Context.BATTERY_SERVICE);
    if (android.os.Build.VERSION.SDK_INT >= 21) {
      batteryLevel = batteryManager.getIntProperty(android.os.BatteryManager.BATTERY_PROPERTY_CAPACITY);
    } else {
      const intent = context.registerReceiver(undefined, new android.content.IntentFilter(android.content.Intent.ACTION_BATTERY_CHANGED));
      batteryLevel = intent.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1);
    }
  } else if (Device.os === 'iOS') {
    UIDevice.currentDevice.batteryMonitoringEnabled = true;
    batteryLevel = Math.floor(UIDevice.currentDevice.batteryLevel * 100);
  }

  return batteryLevel;
}

export function addBatteryListener(callback: (level: number) => void): void {
  if (Device.os === 'Android') {
    Application.android.registerBroadcastReceiver(android.content.Intent.ACTION_BATTERY_CHANGED, (context, intent) => {
      const level = intent.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1);
      callback(level);
    });
  } else if (Device.os === 'iOS') {
    const NSString = ObjC.classes.NSString;
    UIDevice.currentDevice.batteryMonitoringEnabled = true;
    UIDevice.currentDevice.addObserverForKeyPathOptionsContext(
      NSString.stringWithString('batteryLevel'),
      0,
      null,
      () => {
        const level = Math.floor(UIDevice.currentDevice.batteryLevel * 100);
        callback(level);
      }
    );
  }
}

