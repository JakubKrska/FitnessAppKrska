import React, {useState} from 'react';
import {View, Button, TextInput, Text, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../api';

export default function ReminderFormScreen({navigation}) {
    const [time, setTime] = useState('');
    const [days, setDays] = useState('');

    const submit = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            await apiFetch('/reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    time,
                    daysOfWeek: days.split(',').map((d) => d.trim()),
                    workoutPlanId: null,
                }),
            });

            Alert.alert('Připomínka přidána');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Chyba při ukládání', typeof err === 'string' ? err : 'Neznámá chyba.');
        }
    };

    return (
        <View style={{padding: 16}}>
            <Text>Zadej čas (např. 07:00)</Text>
            <TextInput value={time} onChangeText={setTime} style={{borderWidth: 1, marginBottom: 10}}/>
            <Text>Dny (např. Mon,Wed,Fri)</Text>
            <TextInput value={days} onChangeText={setDays} style={{borderWidth: 1, marginBottom: 10}}/>
            <Button title="Uložit připomínku" onPress={submit}/>
        </View>
    );
}
