import { Application, Device } from '@nativescript/core';

declare const android: any;
declare const UIDevice: any;
declare const ObjC: any;

let batteryLevel: number | undefined;
let batteryReceiver: any; // For Android cleanup

export function getBatteryLevel(): number | undefined {
    try {
        if (Device.os === 'Android') {
            const context = Application.android.context;
            const batteryManager = context.getSystemService(android.content.Context.BATTERY_SERVICE);
            if (android.os.Build.VERSION.SDK_INT >= 21) {
                batteryLevel = batteryManager.getIntProperty(android.os.BatteryManager.BATTERY_PROPERTY_CAPACITY);
            } else {
                const intentFilter = new android.content.IntentFilter(android.content.Intent.ACTION_BATTERY_CHANGED);
                const intent = context.registerReceiver(null, intentFilter);
                if (intent) {
                    batteryLevel = intent.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1);
                }
            }
        } else if (Device.os === 'iOS') {
            UIDevice.currentDevice.batteryMonitoringEnabled = true;
            batteryLevel = Math.floor(UIDevice.currentDevice.batteryLevel * 100);
        }

        return batteryLevel;
    } catch (error) {
        console.error('Error getting battery level:', error);
        return undefined;
    }
}

export function addBatteryListener(callback: (level: number) => void): () => void {
    try {
        if (Device.os === 'Android') {
            batteryReceiver = new android.content.BroadcastReceiver({
                onReceive: function(context: any, intent: any) {
                    const level = intent.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1);
                    callback(level);
                }
            });

            Application.android.registerBroadcastReceiver(
                android.content.Intent.ACTION_BATTERY_CHANGED,
                batteryReceiver
            );
        } else if (Device.os === 'iOS') {
            const NSString = ObjC.classes.NSString;
            UIDevice.currentDevice.batteryMonitoringEnabled = true;
            const observer = UIDevice.currentDevice.addObserverForKeyPathOptionsContext(
                NSString.stringWithString('batteryLevel'),
                0,
                null,
                () => {
                    const level = Math.floor(UIDevice.currentDevice.batteryLevel * 100);
                    callback(level);
                }
            );

            // Return cleanup function
            return () => {
                if (Device.os === 'iOS') {
                    UIDevice.currentDevice.removeObserver(observer);
                    UIDevice.currentDevice.batteryMonitoringEnabled = false;
                }
            };
        }

        // Return cleanup function for Android
        return () => {
            if (Device.os === 'Android' && batteryReceiver) {
                Application.android.unregisterBroadcastReceiver(batteryReceiver);
                batteryReceiver = null;
            }
        };
    } catch (error) {
        console.error('Error setting up battery listener:', error);
        return () => {}; // Return empty cleanup function
    }
}
