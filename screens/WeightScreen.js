import React, { useEffect, useState } from 'react';
import {
    View,
    Dimensions,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Text,
} from 'react-native';

import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

import AppTitle from '../components/ui/AppTitle';
import AppTextInput from '../components/ui/AppTextInput';
import AppButton from '../components/ui/AppButton';
import { colors, spacing } from '../components/ui/theme';
import { apiFetch } from '../api';

const WeightScreen = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weightInput, setWeightInput] = useState('');
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    const fetchWeights = async () => {
        try {
            const weights = await apiFetch('/weight');
            const sorted = weights.map(entry => ({
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

    useEffect(() => {
        fetchWeights();
    }, []);

    const handleAddWeight = async () => {
        const parsed = parseFloat(weightInput.replace(',', '.'));

        if (!parsed || parsed <= 0) {
            setError('Zadej platnou váhu ve formátu např. 72.5');
            return;
        }

        try {
            // 1. Přidání záznamu do váhové historie
            await apiFetch('/weight', {
                method: 'POST',
                body: JSON.stringify({ weight: parsed }),
            });

            // 2. Aktualizace váhy v profilu (pouze váha, přes nový endpoint)
            await apiFetch('/users/me/weight', {
                method: 'PUT',
                body: JSON.stringify({ weight: parsed }),
            });

            Alert.alert('Záznam přidán');
            setWeightInput('');
            setError(null);
            fetchWeights(); // Refresh grafu
        } catch (err) {
            console.error('Chyba při odeslání váhy:', err);
            Alert.alert('Nepodařilo se odeslat váhu.');
        }
    };

    const chartData = {
        labels: data.map((d, i) => (i % 2 === 0 ? d.date : '')),
        datasets: [{ data: data.map(d => d.weight), strokeWidth: 2 }],
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Vývoj váhy</AppTitle>

            {data.length === 0 ? (
                <Text>Žádné záznamy</Text>
            ) : (
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
            )}

            <AppTitle>Zaznamenat novou váhu</AppTitle>

            <AppTextInput
                placeholder="Váha v kg"
                keyboardType="numeric"
                value={weightInput}
                onChangeText={(val) => {
                    setWeightInput(val);
                    setError(null);
                }}
            />
            {error && <Text style={styles.error}>{error}</Text>}

            <AppButton title="Přidat váhu" onPress={handleAddWeight} />

            <AppButton
                title="Zpět na Dashboard"
                onPress={() => navigation.navigate('MainTabs', { screen: 'Dashboard' })}
                style={{ marginTop: spacing.medium }}
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
    error: {
        color: colors.danger,
        marginBottom: spacing.small,
    },
});

export default WeightScreen;
