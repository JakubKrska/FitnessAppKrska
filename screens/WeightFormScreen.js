import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTextInput from '../components/ui/AppTextInput';
import AppButton from '../components/ui/AppButton';
import AppTitle from '../components/ui/AppTitle';
import {colors, spacing} from '../components/ui/theme';

const WeightFormScreen = ({navigation}) => {
    const [weight, setWeight] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!weight || parseFloat(weight) <= 0) {
            setError('Zadej platnou váhu.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch('http://localhost:8081/weight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({weight: parseFloat(weight)}),
            });

            if (res.ok) {
                Alert.alert('Záznam přidán');
                setWeight('');
                navigation.goBack();
            } else {
                const err = await res.json();
                Alert.alert('Chyba', JSON.stringify(err));
            }
        } catch (err) {
            console.error('Chyba při odeslání váhy:', err);
            Alert.alert('Nepodařilo se odeslat váhu.');
        }
    };

    return (
        <View style={styles.container}>
            <AppTitle>Zaznamenat novou váhu</AppTitle>

            <AppTextInput
                placeholder="Váha v kg"
                keyboardType="numeric"
                value={weight}
                onChangeText={(val) => {
                    setWeight(val);
                    setError(null);
                }}
            />
            {error && <View><Text style={styles.error}>{error}</Text></View>}

            <AppButton title="Přidat" onPress={handleSubmit}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        flex: 1,
        padding: spacing.large,
        justifyContent: 'center',
    },
    error: {
        color: colors.danger,
        marginBottom: spacing.small,
    },
});

export default WeightFormScreen;
