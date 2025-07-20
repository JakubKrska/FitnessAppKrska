// screens/ChangePasswordScreen.js
import React, {useState} from 'react';
import {View, TextInput, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppButton from '../components/ui/AppButton';
import AppTitle from '../components/ui/AppTitle';
import {spacing, colors} from '../components/ui/theme';

const ChangePasswordScreen = ({navigation}) => {
    const [form, setForm] = useState({
        oldPassword: '',
        newPassword: '',
    });

    const handleChange = async () => {
        const token = await AsyncStorage.getItem('token');

        const res = await fetch('http://localhost:8081/users/change-password', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            Alert.alert('Heslo změněno.');
            navigation.goBack();
        } else {
            const err = await res.text();
            Alert.alert('Chyba', err);
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
