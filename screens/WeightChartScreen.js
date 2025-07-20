import React, {useEffect, useState} from 'react';
import {View, Dimensions, ScrollView, StyleSheet, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LineChart} from 'react-native-chart-kit';

import AppTitle from '../components/ui/AppTitle';
import {colors, spacing} from '../components/ui/theme';

const WeightChartScreen = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeights = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const res = await fetch('http://localhost:8081/weight', {
                    headers: {Authorization: `Bearer ${token}`},
                });

                const text = await res.text();
                const json = JSON.parse(text);
                const sorted = json.map(entry => ({
                    ...entry,
                    date: new Date(entry.loggedAt).toLocaleDateString(),
                }));

                setData(sorted);
            } catch (err) {
                console.error('Chyba při načítání váhových dat:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchWeights();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary}/>
            </View>
        );
    }

    if (data.length === 0) {
        return (
            <View style={styles.center}>
                <AppTitle>Žádné záznamy</AppTitle>
            </View>
        );
    }

    const chartData = {
        labels: data.map((d, i) => (i % 2 === 0 ? d.date : '')),
        datasets: [
            {
                data: data.map(d => d.weight),
                strokeWidth: 2,
            },
        ],
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Vývoj váhy</AppTitle>

            <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 32}
                height={260}
                yAxisSuffix=" kg"
                chartConfig={{
                    backgroundColor: colors.white,
                    backgroundGradientFrom: colors.white,
                    backgroundGradientTo: colors.white,
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
                    labelColor: () => colors.gray,
                    propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: colors.primary,
                    },
                }}
                style={{
                    marginVertical: spacing.medium,
                    borderRadius: 12,
                    alignSelf: 'center',
                }}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        padding: spacing.large,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.large,
        backgroundColor: colors.background,
    },
});

export default WeightChartScreen;
