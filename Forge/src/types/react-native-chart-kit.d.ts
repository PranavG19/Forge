declare module 'react-native-chart-kit' {
  import {Component} from 'react';
  import {ViewProps} from 'react-native';

  export interface ChartConfig {
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    color?: (opacity?: number) => string;
    labelColor?: (opacity?: number) => string;
    strokeWidth?: number;
    barPercentage?: number;
    useShadowColorFromDataset?: boolean;
    [key: string]: any;
  }

  export interface AbstractChartProps {
    width: number;
    height: number;
    backgroundColor?: string;
    chartConfig: ChartConfig;
    style?: any;
    withHorizontalLabels?: boolean;
    withVerticalLabels?: boolean;
    withInnerLines?: boolean;
    withOuterLines?: boolean;
    withDots?: boolean;
    withShadow?: boolean;
    withScrollableDot?: boolean;
    yAxisLabel?: string;
    yAxisSuffix?: string;
    yAxisInterval?: number;
    yLabelsOffset?: number;
    xLabelsOffset?: number;
    hidePointsAtIndex?: number[];
    formatYLabel?: (label: string) => string;
    formatXLabel?: (label: string) => string;
    getDotColor?: (dataPoint: any, index: number) => string;
    getDotProps?: (dataPoint: any, index: number) => object;
  }

  export interface PieChartProps extends AbstractChartProps {
    data: Array<{
      name: string;
      population: number;
      color: string;
      legendFontColor: string;
      legendFontSize: number;
    }>;
    accessor: string;
    backgroundColor?: string;
    paddingLeft?: string;
    absolute?: boolean;
    hasLegend?: boolean;
    center?: [number, number];
  }

  export class PieChart extends Component<PieChartProps> {}
}
