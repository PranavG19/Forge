import Foundation
import FamilyControls
import DeviceActivity
import ManagedSettings

@objc(BlockingManager)
class BlockingManager: NSObject {
  
  private let store = ManagedSettingsStore()
  private var activitySelection: FamilyActivitySelection?
  private var blockingMode: String = "FULL"
  private var timerDuration: TimeInterval = 0
  
  @objc func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let center = AuthorizationCenter.shared
    
    Task {
      do {
        try await center.requestAuthorization(for: .individual)
        resolve(true)
      } catch {
        print("Authorization failed: \(error.localizedDescription)")
        reject("authorization_error", "Failed to get Screen Time authorization", error)
      }
    }
  }
  
  @objc func blockApp(_ bundleId: String, mode: String, duration: NSNumber?, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    self.blockingMode = mode
    
    if let duration = duration {
      self.timerDuration = TimeInterval(truncating: duration)
    }
    
    // Create a selection with the specific app
    let applications = ApplicationTokens(bundleIdentifiers: [bundleId])
    let selection = FamilyActivitySelection(applications: applications)
    self.activitySelection = selection
    
    do {
      switch mode {
      case "FULL":
        // Full blocking mode
        self.store.shield.applications = selection.applicationTokens
        self.store.shield.applicationCategories = .all()
        resolve(nil)
        
      case "REMINDER":
        // Reminder mode - just show a reminder but allow usage
        self.store.shield.applications = nil
        self.store.shield.applicationCategories = nil
        
        // Set a reminder instead
        self.store.reminders.applications = selection.applicationTokens
        resolve(nil)
        
      case "TIMER":
        // Timer mode - block after a certain duration
        if duration == nil || duration?.intValue == 0 {
          reject("invalid_duration", "Timer mode requires a duration", nil)
          return
        }
        
        // Set up a scheduled control
        let timerSeconds = TimeInterval(truncating: duration!)
        let schedule = DeviceActivitySchedule(
          intervalStart: DateComponents(hour: 0, minute: 0),
          intervalEnd: DateComponents(hour: 23, minute: 59),
          repeats: true
        )
        
        let center = DeviceActivityCenter()
        let activity = DeviceActivityName("AppBlocking")
        
        do {
          try center.startMonitoring(activity, during: schedule)
          
          // Set up the timer threshold
          let threshold = DeviceActivityCenter.Threshold(
            applications: selection.applicationTokens,
            threshold: timerSeconds
          )
          
          try center.setTimeLimitWarningThreshold(threshold, for: activity)
          resolve(nil)
        } catch {
          reject("timer_error", "Failed to set up timer blocking", error)
        }
        
      default:
        reject("invalid_mode", "Invalid blocking mode", nil)
      }
    } catch {
      reject("blocking_error", "Failed to block app", error)
    }
  }
  
  @objc func unblockApp(_ bundleId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Remove all shields and restrictions
    self.store.shield.applications = nil
    self.store.shield.applicationCategories = nil
    self.store.reminders.applications = nil
    
    // Stop any active monitoring
    let center = DeviceActivityCenter()
    center.stopMonitoring([DeviceActivityName("AppBlocking")])
    
    resolve(nil)
  }
  
  @objc func isAppBlocked(_ bundleId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Check if the app is in the current shields
    let applications = self.store.shield.applications
    let isBlocked = applications?.contains { token in
      // This is a simplification - in reality, we'd need to map the token back to a bundle ID
      // which is more complex and requires additional APIs
      return true // Placeholder
    } ?? false
    
    resolve(isBlocked)
  }
}

// Extension to handle DeviceActivity events
extension BlockingManager: DeviceActivityMonitorObserver {
  func deviceActivityMonitorDidUpdate(_ event: DeviceActivityMonitorUpdateEvent) {
    // Handle threshold events
    if event.eventType == .thresholdReached {
      // Apply full blocking when the timer threshold is reached
      if let selection = self.activitySelection {
        self.store.shield.applications = selection.applicationTokens
      }
    }
  }
}