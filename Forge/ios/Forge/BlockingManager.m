#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BlockingManager, NSObject)

RCT_EXTERN_METHOD(requestAuthorization:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(blockApp:(NSString *)bundleId
                  mode:(NSString *)mode
                  duration:(NSNumber *)duration
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(unblockApp:(NSString *)bundleId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isAppBlocked:(NSString *)bundleId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Required for main thread execution
+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end