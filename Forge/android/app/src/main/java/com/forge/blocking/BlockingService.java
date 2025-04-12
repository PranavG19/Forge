package com.forge.blocking;

import android.app.ActivityManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class BlockingService extends Service {
    private static final String TAG = "BlockingService";
    private static final String CHANNEL_ID = "ForgeBlockingChannel";
    private static final int NOTIFICATION_ID = 1001;
    private static final int CHECK_INTERVAL_MS = 1000; // Check every second

    private final Map<String, String> blockedApps = new HashMap<>();
    private final Map<String, String> blockingModes = new HashMap<>();
    private final Map<String, Long> timerStartTimes = new HashMap<>();
    private final Map<String, Long> timerDurations = new HashMap<>();
    
    private ScheduledExecutorService scheduler;
    private Handler mainHandler;
    private UsageStatsManager usageStatsManager;
    private PackageManager packageManager;

    @Override
    public void onCreate() {
        super.onCreate();
        
        mainHandler = new Handler(Looper.getMainLooper());
        usageStatsManager = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
        packageManager = getPackageManager();
        
        createNotificationChannel();
        startForeground(NOTIFICATION_ID, createNotification("Monk Mode: Forge is monitoring apps"));
        
        scheduler = Executors.newSingleThreadScheduledExecutor();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            return START_STICKY;
        }
        
        String action = intent.getStringExtra("action");
        String packageName = intent.getStringExtra("packageName");
        
        if ("remove".equals(action) && packageName != null) {
            // Remove app from blocking
            blockedApps.remove(packageName);
            blockingModes.remove(packageName);
            timerStartTimes.remove(packageName);
            timerDurations.remove(packageName);
            
            // If no more apps to block, stop the service
            if (blockedApps.isEmpty()) {
                stopSelf();
                return START_NOT_STICKY;
            }
        } else if (packageName != null) {
            // Add app to blocking
            String mode = intent.getStringExtra("mode");
            blockedApps.put(packageName, packageName);
            blockingModes.put(packageName, mode);
            
            if ("TIMER".equals(mode)) {
                long duration = intent.getLongExtra("duration", 0);
                if (duration > 0) {
                    timerStartTimes.put(packageName, System.currentTimeMillis());
                    timerDurations.put(packageName, duration * 1000); // Convert to milliseconds
                }
            }
            
            // Start monitoring if not already started
            if (scheduler.isShutdown()) {
                scheduler = Executors.newSingleThreadScheduledExecutor();
            }
            
            scheduler.scheduleAtFixedRate(
                    this::checkForegroundApp,
                    0,
                    CHECK_INTERVAL_MS,
                    TimeUnit.MILLISECONDS
            );
        }
        
        return START_STICKY;
    }

    private void checkForegroundApp() {
        try {
            long endTime = System.currentTimeMillis();
            long startTime = endTime - 10000; // Look at last 10 seconds
            
            // Get usage stats
            List<UsageStats> stats = usageStatsManager.queryUsageStats(
                    UsageStatsManager.INTERVAL_DAILY, startTime, endTime);
            
            if (stats == null || stats.isEmpty()) {
                return;
            }
            
            // Find the most recently used app
            SortedMap<Long, UsageStats> sortedStats = new TreeMap<>();
            for (UsageStats usageStats : stats) {
                sortedStats.put(usageStats.getLastTimeUsed(), usageStats);
            }
            
            if (sortedStats.isEmpty()) {
                return;
            }
            
            // Get the most recent app
            UsageStats mostRecent = sortedStats.get(sortedStats.lastKey());
            String packageName = mostRecent.getPackageName();
            
            // Check if this is a blocked app
            if (blockedApps.containsKey(packageName)) {
                String mode = blockingModes.get(packageName);
                
                if ("FULL".equals(mode)) {
                    // Full blocking - launch our app instead
                    launchMainApp();
                    sendBreachEvent(packageName);
                } else if ("REMINDER".equals(mode)) {
                    // Show a reminder notification
                    showReminderNotification(packageName);
                } else if ("TIMER".equals(mode)) {
                    // Check if timer has expired
                    Long startTime = timerStartTimes.get(packageName);
                    Long duration = timerDurations.get(packageName);
                    
                    if (startTime != null && duration != null) {
                        long elapsedTime = System.currentTimeMillis() - startTime;
                        
                        if (elapsedTime > duration) {
                            // Timer expired, block the app
                            launchMainApp();
                            sendBreachEvent(packageName);
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking foreground app", e);
        }
    }

    private void launchMainApp() {
        try {
            Intent intent = packageManager.getLaunchIntentForPackage(getPackageName());
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error launching main app", e);
        }
    }

    private void showReminderNotification(String packageName) {
        try {
            String appName = packageManager.getApplicationLabel(
                    packageManager.getApplicationInfo(packageName, 0)).toString();
            
            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle("Monk Mode Active")
                    .setContentText("You're trying to use " + appName + " while in Monk Mode")
                    .setSmallIcon(android.R.drawable.ic_dialog_alert)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .build();
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.notify(NOTIFICATION_ID + 1, notification);
        } catch (Exception e) {
            Log.e(TAG, "Error showing reminder notification", e);
        }
    }

    private void sendBreachEvent(String packageName) {
        ReactInstanceManager reactInstanceManager = ((ReactApplication) getApplication())
                .getReactNativeHost().getReactInstanceManager();
        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
        
        if (reactContext != null) {
            WritableMap params = Arguments.createMap();
            params.putString("packageName", packageName);
            params.putString("error", "App access attempt while blocked");
            
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("appRestrictionError", params);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Forge App Blocking",
                    NotificationManager.IMPORTANCE_LOW);
            
            channel.setDescription("Used to monitor app usage during Monk Mode");
            channel.enableLights(true);
            channel.setLightColor(Color.RED);
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private Notification createNotification(String text) {
        Intent notificationIntent = packageManager.getLaunchIntentForPackage(getPackageName());
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);
        
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Monk Mode: Forge")
                .setContentText(text)
                .setSmallIcon(android.R.drawable.ic_lock_lock)
                .setContentIntent(pendingIntent)
                .build();
    }

    @Override
    public void onDestroy() {
        if (scheduler != null && !scheduler.isShutdown()) {
            scheduler.shutdownNow();
        }
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}