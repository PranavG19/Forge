import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {feedbackService} from '../../services/feedback/FeedbackService';
import {SoundType} from '../../services/feedback/FeedbackService';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes: number;
}

interface SubtaskListProps {
  subtasks: Subtask[];
  onSubtasksChange: (subtasks: Subtask[]) => void;
  onSubtaskComplete: (subtaskId: string, completed: boolean) => void;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  onSubtasksChange,
  onSubtaskComplete,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingTime, setEditingTime] = useState('');

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim() === '') return;

    const newSubtask: Subtask = {
      id: `subtask_${Date.now()}`,
      title: newSubtaskTitle,
      completed: false,
      estimatedMinutes: 15, // Default to 15 minutes
    };

    onSubtasksChange([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = (id: string) => {
    onSubtasksChange(subtasks.filter(subtask => subtask.id !== id));
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    onSubtaskComplete(id, completed);

    // Play sound on completion
    if (completed) {
      feedbackService.playSound(SoundType.TASK_COMPLETE);
    }
  };

  const handleStartEditing = (subtask: Subtask) => {
    setEditingSubtask(subtask.id);
    setEditingTitle(subtask.title);
    setEditingTime(subtask.estimatedMinutes.toString());
  };

  const handleSaveEditing = () => {
    if (!editingSubtask) return;

    const updatedSubtasks = subtasks.map(subtask => {
      if (subtask.id === editingSubtask) {
        return {
          ...subtask,
          title: editingTitle,
          estimatedMinutes: parseInt(editingTime) || 0,
        };
      }
      return subtask;
    });

    onSubtasksChange(updatedSubtasks);
    setEditingSubtask(null);
  };

  const renderItem = ({item, drag, isActive}: RenderItemParams<Subtask>) => {
    const isEditing = item.id === editingSubtask;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={drag}
          disabled={isActive || isEditing}
          style={[
            styles.subtaskItem,
            isActive && styles.subtaskItemActive,
            item.completed && styles.subtaskItemCompleted,
          ]}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editingTitle}
                onChangeText={setEditingTitle}
                autoFocus
              />
              <View style={styles.timeInputContainer}>
                <TextInput
                  style={styles.timeInput}
                  value={editingTime}
                  onChangeText={setEditingTime}
                  keyboardType="numeric"
                  placeholder="Min"
                />
                <Text style={styles.timeLabel}>min</Text>
              </View>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEditing}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.subtaskContent}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  item.completed && styles.checkboxChecked,
                ]}
                onPress={() => handleToggleComplete(item.id, !item.completed)}>
                {item.completed && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.titleContainer}
                onPress={() => handleStartEditing(item)}>
                <Text
                  style={[
                    styles.subtaskTitle,
                    item.completed && styles.subtaskTitleCompleted,
                  ]}>
                  {item.title}
                </Text>
                <Text style={styles.subtaskTime}>
                  {item.estimatedMinutes} min
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSubtask(item.id)}>
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subtasks</Text>

      <DraggableFlatList
        data={subtasks}
        onDragEnd={({data}) => onSubtasksChange(data)}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        containerStyle={styles.list}
      />

      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          value={newSubtaskTitle}
          onChangeText={setNewSubtaskTitle}
          placeholder="Add a subtask..."
          placeholderTextColor="#666"
          onSubmitEditing={handleAddSubtask}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddSubtask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  list: {
    maxHeight: 300,
  },
  subtaskItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  subtaskItemActive: {
    backgroundColor: colors.surface,
    opacity: 0.7,
  },
  subtaskItemCompleted: {
    opacity: 0.6,
  },
  subtaskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtaskTitle: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
  },
  subtaskTime: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  deleteButtonText: {
    fontSize: 20,
    color: colors.status.error,
    fontWeight: 'bold',
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  editInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 4,
    padding: spacing.sm,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  timeInput: {
    width: 40,
    backgroundColor: colors.background,
    borderRadius: 4,
    padding: spacing.sm,
    color: colors.text.primary,
    textAlign: 'center',
  },
  timeLabel: {
    color: colors.text.secondary,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
