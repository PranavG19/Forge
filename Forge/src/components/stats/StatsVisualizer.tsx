import React from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ContributionGraph,
} from 'react-native-chart-kit';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {
  DailyStats,
  WeeklyStats,
  MonthlyStats,
} from '../../services/analytics/StatsAggregator';

const screenWidth = Dimensions.get('window').width;

interface StatsVisualizerProps {
  dailyStats?: DailyStats[];
  weeklyStats?: WeeklyStats;
  monthlyStats?: MonthlyStats;
  style?: any;
}

export const StatsVisualizer: React.FC<StatsVisualizerProps> = ({
  dailyStats,
  weeklyStats,
  monthlyStats,
  style,
}) => {
  const chartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // Orange color
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const renderFocusTimeChart = () => {
    if (!dailyStats || dailyStats.length === 0) return null;

    // Prepare data for the line chart
    const data = {
      labels: dailyStats.map(stat => {
        const date = new Date(stat.date);
        return date.toLocaleDateString('en-US', {weekday: 'short'});
      }),
      datasets: [
        {
          data: dailyStats.map(stat => stat.focusTime / 60), // Convert minutes to hours
          color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // Orange
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Focus Time (Hours)</Text>
        <LineChart
          data={data}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderTaskCompletionChart = () => {
    if (!dailyStats || dailyStats.length === 0) return null;

    // Prepare data for the bar chart
    const data = {
      labels: dailyStats.map(stat => {
        const date = new Date(stat.date);
        return date.toLocaleDateString('en-US', {weekday: 'short'});
      }),
      datasets: [
        {
          data: dailyStats.map(stat => stat.tasksCompleted),
          color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // Orange
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tasks Completed</Text>
        <BarChart
          data={data}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>
    );
  };

  const renderTimeDistributionChart = () => {
    if (!weeklyStats) return null;

    // Prepare data for the pie chart
    const data = [
      {
        name: 'Focus',
        time: weeklyStats.totalFocusTime,
        color: colors.timer.focus.background,
        legendFontColor: colors.text.primary,
        legendFontSize: 12,
      },
      {
        name: 'Rest',
        time: weeklyStats.totalRestTime,
        color: colors.timer.rest.background,
        legendFontColor: colors.text.primary,
        legendFontSize: 12,
      },
    ];

    // Calculate percentages
    const total = data.reduce((sum, item) => sum + item.time, 0);
    const pieData = data.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.time / total) * 100) : 0,
      population: Math.round(item.time / 60), // Convert to hours for display
    }));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Time Distribution (Hours)</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  const renderHeatmap = () => {
    if (!dailyStats || dailyStats.length === 0) return null;

    // Prepare data for the contribution graph (heatmap)
    const commitsData = dailyStats.map(stat => ({
      date: stat.date,
      count: Math.ceil(stat.focusTime / 30), // 1 count per 30 minutes of focus
    }));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Focus Intensity</Text>
        <ContributionGraph
          values={commitsData}
          endDate={new Date()}
          numDays={dailyStats.length}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  const renderProductivityMetrics = () => {
    if (!weeklyStats) return null;

    // Calculate average daily focus time in hours
    const avgDailyFocusHours = weeklyStats.totalFocusTime / (60 * 7);

    // Calculate task completion rate (tasks per day)
    const tasksPerDay = weeklyStats.totalTasksCompleted / 7;

    // Calculate breach rate (breaches per day)
    const breachesPerDay = weeklyStats.totalBreachCount / 7;

    return (
      <View style={styles.metricsContainer}>
        <Text style={styles.chartTitle}>Weekly Metrics</Text>

        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {avgDailyFocusHours.toFixed(1)}
            </Text>
            <Text style={styles.metricLabel}>Avg. Hours/Day</Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricValue}>{tasksPerDay.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Tasks/Day</Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricValue}>{breachesPerDay.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Breaches/Day</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {weeklyStats.totalTasksCompleted}
            </Text>
            <Text style={styles.metricLabel}>Total Tasks</Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {weeklyStats.totalNorthStarTasksCompleted}
            </Text>
            <Text style={styles.metricLabel}>North Star Tasks</Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricValue}>{weeklyStats.totalExpGained}</Text>
            <Text style={styles.metricLabel}>XP Gained</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, style]}>
      {renderProductivityMetrics()}
      {renderFocusTimeChart()}
      {renderTaskCompletionChart()}
      {renderTimeDistributionChart()}
      {renderHeatmap()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chartContainer: {
    marginVertical: spacing.md,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  chart: {
    borderRadius: 8,
    marginVertical: spacing.sm,
  },
  metricsContainer: {
    marginVertical: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
});
