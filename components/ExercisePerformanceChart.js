import React from 'react';
import {View, Dimensions, StyleSheet, Text} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {colors, spacing} from './ui/theme';

const screenWidth = Dimensions.get('window').width;

const ExercisePerformanceChart = ({dataPoints}) => {
    if (dataPoints.length === 0) {
        return <Text style={styles.noData}>Žádná data k zobrazení.</Text>;
    }

    const chartData = {
        labels: dataPoints.map(dp => dp.date),
        datasets: [
            {
                data: dataPoints.map(dp => dp.weight || 0),
                color: () => colors.primary,
            },
        ],
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vývoj váhy u cviku</Text>
            <LineChart
                data={chartData}
                width={screenWidth - spacing.large * 2}
                height={220}
                chartConfig={{
                    backgroundColor: colors.background,
                    backgroundGradientFrom: colors.background,
                    backgroundGradientTo: colors.background,
                    color: () => colors.primary,
                    labelColor: () => colors.text,
                    strokeWidth: 2,
                    propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: colors.primary,
                    },
                }}
                bezier
                style={{borderRadius: 8}}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.large,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.small,
        color: colors.text,
        textAlign: 'center',
    },
    noData: {
        color: colors.gray,
        textAlign: 'center',
        marginTop: spacing.large,
    },
});

export default ExercisePerformanceChart;
