import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {Platform} from 'react-native';
import {
  appBlockingService,
  BlockedApp,
  BlockMode,
} from '../../services/blocking/AppBlockingService';
import {colors} from '../../theme/colors';

interface AppSelectorProps {
  mode: 'Focus' | 'Rest';
}

interface AppInfo {
  // Ensure blockMode is explicitly typed as BlockMode
  packageName: string;
  name: string;
  selected: boolean;
  blockMode: BlockMode; // This ensures type safety
  timerDuration?: number;
}

const AppSelector: React.FC<AppSelectorProps> = ({mode}) => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [selectedMode, setSelectedMode] = useState<BlockMode>('FULL');
  const [timerDuration, setTimerDuration] = useState(30);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setLoading(true);
    try {
      // In a real implementation, we would get the list of installed apps
      // For now, we'll use mock data with proper typing
      const mockApps: AppInfo[] = [
        {
          packageName: 'com.twitter.android',
          name: 'X',
          selected: false,
          blockMode: 'FULL',
        },
        {
          packageName: 'com.instagram.android',
          name: 'Instagram',
          selected: false,
          blockMode: 'FULL',
        },
        {
          packageName: 'com.facebook.android',
          name: 'Facebook',
          selected: false,
          blockMode: 'FULL',
        },
        {
          packageName: 'com.youtube.android',
          name: 'YouTube',
          selected: false,
          blockMode: 'FULL',
        },
        {
          packageName: 'com.tiktok.android',
          name: 'TikTok',
          selected: false,
          blockMode: 'FULL',
        },
        {
          packageName: 'com.reddit.android',
          name: 'Reddit',
          selected: false,
          blockMode: 'FULL',
        },
        {
          packageName: 'com.snapchat.android',
          name: 'Snapchat',
          selected: false,
          blockMode: 'FULL',
        },
        {
          packageName: 'com.whatsapp',
          name: 'WhatsApp',
          selected: false,
          blockMode: 'FULL',
        },
      ];

      // Get currently blocked apps
      const blockedApps =
        mode === 'Focus'
          ? appBlockingService.getFocusBlockedApps()
          : appBlockingService.getRestBlockedApps();

      // Mark apps as selected if they're in the blocked list
      // Ensure proper typing for the updated apps
      const updatedApps: AppInfo[] = mockApps.map(app => {
        const blockedApp = blockedApps.find(
          a => a.packageName === app.packageName,
        );
        if (blockedApp) {
          return {
            ...app,
            selected: true,
            blockMode: blockedApp.mode as BlockMode,
            timerDuration: blockedApp.timerDuration,
          };
        }
        return app;
      });

      setApps(updatedApps);
    } catch (error) {
      console.error('Failed to load apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppPress = (app: AppInfo) => {
    setSelectedApp(app);
    setSelectedMode(app.blockMode || 'FULL');
    setTimerDuration(app.timerDuration || 30);
    setModalVisible(true);
  };

  const handleSaveAppSettings = () => {
    if (!selectedApp) return;

    const updatedApps: AppInfo[] = apps.map(app => {
      if (app.packageName === selectedApp.packageName) {
        return {
          ...app,
          selected: true,
          blockMode: selectedMode,
          timerDuration: selectedMode === 'TIMER' ? timerDuration : undefined,
        };
      }
      return app;
    });

    setApps(updatedApps);
    saveBlockedApps(updatedApps);
    setModalVisible(false);
  };

  const handleRemoveApp = () => {
    if (!selectedApp) return;

    const updatedApps: AppInfo[] = apps.map(app => {
      if (app.packageName === selectedApp.packageName) {
        return {
          ...app,
          selected: false,
          blockMode: 'FULL' as BlockMode,
          timerDuration: undefined,
        };
      }
      return app;
    });

    setApps(updatedApps);
    saveBlockedApps(updatedApps);
    setModalVisible(false);
  };

  const saveBlockedApps = (appsList: AppInfo[]) => {
    const blockedApps: BlockedApp[] = appsList
      .filter(app => app.selected)
      .map(app => ({
        packageName: app.packageName,
        name: app.name,
        mode: app.blockMode,
        timerDuration: app.timerDuration,
      }));

    if (mode === 'Focus') {
      appBlockingService.setBlockedApps(blockedApps, true);
    } else {
      appBlockingService.setBlockedApps(blockedApps, false);
    }
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderAppItem = ({item}: {item: AppInfo}) => (
    <TouchableOpacity
      style={[styles.appItem, item.selected && styles.selectedAppItem]}
      onPress={() => handleAppPress(item)}>
      <View style={styles.appIconPlaceholder}>
        <Text style={styles.appIconText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.name}</Text>
        {item.selected && (
          <Text style={styles.appMode}>
            {item.blockMode === 'FULL'
              ? 'Full Block'
              : item.blockMode === 'REMINDER'
              ? 'Reminder'
              : `Timer (${item.timerDuration}s)`}
          </Text>
        )}
      </View>
      <View style={styles.checkboxContainer}>
        {item.selected && (
          <View style={styles.checkbox}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode} Mode Apps</Text>
      <Text style={styles.subtitle}>
        Select apps to block during {mode.toLowerCase()} mode
      </Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search apps..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={filteredApps}
          renderItem={renderAppItem}
          keyExtractor={item => item.packageName}
          style={styles.appList}
          contentContainerStyle={styles.appListContent}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedApp?.name || 'App'} Settings
            </Text>

            <Text style={styles.modalLabel}>Blocking Mode</Text>
            <View style={styles.modeContainer}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  selectedMode === 'FULL' && styles.selectedMode,
                ]}
                onPress={() => setSelectedMode('FULL')}>
                <Text
                  style={[
                    styles.modeButtonText,
                    selectedMode === 'FULL' && styles.selectedModeText,
                  ]}>
                  Full Block
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  selectedMode === 'REMINDER' && styles.selectedMode,
                ]}
                onPress={() => setSelectedMode('REMINDER')}>
                <Text
                  style={[
                    styles.modeButtonText,
                    selectedMode === 'REMINDER' && styles.selectedModeText,
                  ]}>
                  Reminder
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  selectedMode === 'TIMER' && styles.selectedMode,
                ]}
                onPress={() => setSelectedMode('TIMER')}>
                <Text
                  style={[
                    styles.modeButtonText,
                    selectedMode === 'TIMER' && styles.selectedModeText,
                  ]}>
                  Timer
                </Text>
              </TouchableOpacity>
            </View>

            {selectedMode === 'TIMER' && (
              <View style={styles.timerContainer}>
                <Text style={styles.timerLabel}>Timer Duration (seconds)</Text>
                <View style={styles.timerButtons}>
                  {[10, 20, 30, 60].map(duration => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.timerButton,
                        timerDuration === duration &&
                          styles.selectedTimerButton,
                      ]}
                      onPress={() => setTimerDuration(duration)}>
                      <Text
                        style={[
                          styles.timerButtonText,
                          timerDuration === duration &&
                            styles.selectedTimerButtonText,
                        ]}>
                        {duration}s
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveApp}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAppSettings}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
  appList: {
    maxHeight: 300,
  },
  appListContent: {
    paddingBottom: 8,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#222',
    marginBottom: 8,
  },
  selectedAppItem: {
    backgroundColor: '#333',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  appIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appIconText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  appMode: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedMode: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  selectedModeText: {
    color: '#000',
  },
  timerContainer: {
    marginBottom: 16,
  },
  timerLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedTimerButton: {
    backgroundColor: colors.primary,
  },
  timerButtonText: {
    color: '#fff',
  },
  selectedTimerButtonText: {
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#444',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  removeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    backgroundColor: colors.status.error,
    marginRight: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontWeight: '500',
  },
});

export default AppSelector;
