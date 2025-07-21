import React, {useState} from 'react';
import {View, TextInput, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppButton from '../components/ui/AppButton';
import AppTitle from '../components/ui/AppTitle';
import {spacing, colors} from '../components/ui/theme';
import { apiFetch } from '../api';

const ChangePasswordScreen = ({navigation}) => {
    const [form, setForm] = useState({
        oldPassword: '',
        newPassword: '',
    });

    const handleChange = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await apiFetch('/users/change-password', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            Alert.alert('Heslo změněno.');
            navigation.goBack();
        } catch (err) {
            const message = typeof err === 'string' ? err : 'Nepodařilo se změnit heslo.';
            Alert.alert('Chyba', message);
        }
    };

    return (
        <View style={styles.container}>
            <AppTitle>Změna hesla</AppTitle>

            <TextInput
                secureTextEntry
                placeholder="Původní heslo"
                style={styles.input}
                value={form.oldPassword}
                onChangeText={(text) => setForm({...form, oldPassword: text})}
            />
            <TextInput
                secureTextEntry
                placeholder="Nové heslo"
                style={styles.input}
                value={form.newPassword}
                onChangeText={(text) => setForm({...form, newPassword: text})}
            />

            <AppButton title="Změnit heslo" onPress={handleChange}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray,
        padding: spacing.medium,
        marginBottom: spacing.medium,
        borderRadius: 8,
    },
});

export default ChangePasswordScreen;
