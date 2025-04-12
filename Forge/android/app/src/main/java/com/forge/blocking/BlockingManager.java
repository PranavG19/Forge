package com.forge.blocking;

import android.app.Activity;
import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Process;
import android.provider.Settings;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.concurrent.TimeUnit;

public class BlockingManager extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private final Map<String, String> blockedApps = new HashMap<>();
    private final Map<String, String> blockingModes = new HashMap<>();
    private final Map<String, Long> timerDurations = new HashMap<>();

    public BlockingManager(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "UsageStatsManager";
    }

    @ReactMethod
    public void requestPermission(Promise promise) {
        boolean hasPermission = hasUsageStatsPermission();
        
        if (hasPermission) {
            promise.resolve(true);
            return;
        }
        
        // Open settings to request permission
        try {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity != null) {
                Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
                currentActivity.startActivity(intent);
                
                // Note: We can't know if the user granted permission after returning from settings
                // The app will need to check again after the user returns
                promise.resolve(false);
            } else {
                promise.reject("activity_not_found", "Current activity is null");
            }
        } catch (Exception e) {
            promise.reject("permission_error", "Failed to request usage stats permission", e);
        }
    }

    @ReactMethod
    public void setAppRestriction(String packageName, String mode, Double duration, Promise promise) {
        if (!hasUsageStatsPermission()) {
            promise.reject("permission_denied", "Usage stats permission not granted");
            return;
        }

        try {
            // Store the app restriction in memory
            blockedApps.put(packageName, packageName);
            blockingModes.put(packageName, mode);
            
            if (duration != null) {
                long durationMs = (long) (duration * 1000); // Convert seconds to milliseconds
                timerDurations.put(packageName, durationMs);
            }
            
            // Start the blocking service
            Intent serviceIntent = new Intent(reactContext, BlockingService.class);
            serviceIntent.putExtra("packageName", packageName);
            serviceIntent.putExtra("mode", mode);
            if (duration != null) {
                serviceIntent.putExtra("duration", duration.longValue());
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
            
            // Send event to JS
            WritableMap params = Arguments.createMap();
            params.putString("packageName", packageName);
            params.putBoolean("isRestricted", true);
            sendEvent("appRestrictionChanged", params);
            
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("restriction_error", "Failed to set app restriction", e);
        }
    }

    @ReactMethod
    public void removeAppRestriction(String packageName, Promise promise) {
        try {
            // Remove from memory
            blockedApps.remove(packageName);
            blockingModes.remove(packageName);
            timerDurations.remove(packageName);
            
            // Stop the service for this app
            Intent serviceIntent = new Intent(reactContext, BlockingService.class);
            serviceIntent.putExtra("action", "remove");
            serviceIntent.putExtra("packageName", packageName);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
            
            // Send event to JS
            WritableMap params = Arguments.createMap();
            params.putString("packageName", packageName);
            params.putBoolean("isRestricted", false);
            sendEvent("appRestrictionChanged", params);
            
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("restriction_error", "Failed to remove app restriction", e);
        }
    }

    @ReactMethod
    public void isAppRestricted(String packageName, Promise promise) {
        promise.resolve(blockedApps.containsKey(packageName));
    }

    @ReactMethod
    public void getUsageStats(double startTime, double endTime, Promise promise) {
        if (!hasUsageStatsPermission()) {
            promise.reject("permission_denied", "Usage stats permission not granted");
            return;
        }

        try {
            UsageStatsManager usageStatsManager = (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
            long startTimeMs = (long) startTime;
            long endTimeMs = (long) endTime;
            
            List<UsageStats> stats = usageStatsManager.queryUsageStats(
                    UsageStatsManager.INTERVAL_DAILY, startTimeMs, endTimeMs);
            
            WritableArray result = Arguments.createArray();
            
            for (UsageStats usageStats : stats) {
                WritableMap stat = Arguments.createMap();
                stat.putString("packageName", usageStats.getPackageName());
                stat.putDouble("firstTimeStamp", usageStats.getFirstTimeStamp());
                stat.putDouble("lastTimeStamp", usageStats.getLastTimeStamp());
                stat.putDouble("totalTimeInForeground", usageStats.getTotalTimeInForeground());
                result.pushMap(stat);
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("usage_stats_error", "Failed to get usage stats", e);
        }
    }

    private boolean hasUsageStatsPermission() {
        AppOpsManager appOps = (AppOpsManager) reactContext.getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), reactContext.getPackageName());
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    private void sendEvent(String eventName, WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}