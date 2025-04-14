import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Project, Task} from '../../models/Task';
import {taskService} from '../../services/task/TaskService';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {PieChart} from 'react-native-chart-kit';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Projects'>;

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  onPress: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({project, tasks, onPress}) => {
  // Calculate project completion percentage
  const getCompletionPercentage = () => {
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(
      task => task.status === 'COMPLETED',
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  // Data for pie chart
  const chartData = [
    {
      name: 'Completed',
      population: completionPercentage,
      color: colors.status.success,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
    {
      name: 'Remaining',
      population: 100 - completionPercentage,
      color: colors.border.default,
      legendFontColor: colors.text.secondary,
      legendFontSize: 12,
    },
  ];

  return (
    <TouchableOpacity
      style={[
        styles.projectCard,
        project.isNorthStar && styles.northStarProject,
      ]}
      onPress={() => onPress(project)}
      activeOpacity={0.7}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle}>{project.title}</Text>
        {project.isNorthStar && (
          <View style={styles.northStarBadge}>
            <Text style={styles.northStarText}>North Star</Text>
          </View>
        )}
      </View>

      {project.description && (
        <Text style={styles.projectDescription}>{project.description}</Text>
      )}

      <View style={styles.projectStats}>
        <View style={styles.statsText}>
          <Text style={styles.tasksCount}>{tasks.length} tasks</Text>
          <Text style={styles.completionText}>
            {completionPercentage}% complete
          </Text>
        </View>

        {tasks.length > 0 && (
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={80}
              height={80}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute={false}
              hasLegend={false}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const ProjectsScreen: React.FC<Props> = ({navigation}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<{[key: string]: Task[]}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // For future dark mode toggle

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const projectsList = await taskService.getProjects();
      setProjects(projectsList);

      // Load tasks for each project
      const tasksMap: {[key: string]: Task[]} = {};
      for (const project of projectsList) {
        const tasks = await taskService.getTasksByProject(project.id);
        tasksMap[project.id] = tasks;
      }
      setProjectTasks(tasksMap);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects(false);
    setRefreshing(false);
  };

  const handleProjectPress = (project: Project) => {
    // Navigate to project details screen (to be implemented)
    // For now, we'll just navigate back to TodoList
    navigation.navigate('TodoList');
  };

  const handleCreateProject = () => {
    // Navigate to create project screen (to be implemented)
    // For now, we'll just create a dummy project
    const createDummyProject = async () => {
      try {
        await taskService.createProject(
          'New Project',
          'A description for the new project',
          false,
        );
        await loadProjects(false);
      } catch (error) {
        console.error('Error creating project:', error);
        setError('Failed to create project. Please try again.');
      }
    };

    createDummyProject();
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No projects yet</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateProject}>
        <Text style={styles.createButtonText}>Create Project</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? colors.darkMode.background
            : colors.background,
        },
      ]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: isDarkMode
              ? colors.darkMode.border.default
              : colors.border.default,
          },
        ]}>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {
                color: isDarkMode
                  ? colors.darkMode.text.primary
                  : colors.text.primary,
              },
            ]}>
            Projects
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateProject}>
            <Text style={styles.createButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.header} />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <ProjectCard
              project={item}
              tasks={projectTasks[item.id] || []}
              onPress={handleProjectPress}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            projects.length === 0 ? styles.emptyListContent : null,
          ]}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.header}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.container.padding,
  },
  title: {
    fontSize: spacing.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'System',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: colors.status.error + '20', // 20% opacity
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: spacing.borderRadius.md,
  },
  errorText: {
    color: colors.status.error,
    textAlign: 'center',
    fontSize: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: spacing.md,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  createButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.header,
  },
  createButtonText: {
    color: colors.text.primary,
    fontSize: spacing.md,
    fontWeight: 'bold',
  },
  projectCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  northStarProject: {
    borderColor: colors.northStar,
    borderLeftWidth: 4,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  projectTitle: {
    fontSize: spacing.md + 2,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
  },
  northStarBadge: {
    backgroundColor: colors.northStar,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: spacing.borderRadius.sm,
  },
  northStarText: {
    color: '#FFFFFF',
    fontSize: spacing.sm - 2,
    fontWeight: 'bold',
  },
  projectDescription: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
    marginBottom: spacing.sm,
  },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  statsText: {
    flex: 1,
  },
  tasksCount: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
  },
  completionText: {
    color: colors.text.primary,
    fontSize: spacing.md,
    fontWeight: 'bold',
  },
  chartContainer: {
    width: 80,
    height: 80,
  },
});
