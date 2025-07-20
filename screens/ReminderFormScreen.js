// screens/ReminderFormScreen.js
import React, {useState} from 'react';
import {View, Button, TextInput, Text, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReminderFormScreen({navigation}) {
    const [time, setTime] = useState('');
    const [days, setDays] = useState('');

    const submit = async () => {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch('http://<YOUR_API>/reminders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                time,
                daysOfWeek: days.split(',').map((d) => d.trim()),
                workoutPlanId: null, // nebo zvol plán
            }),
        });

        if (res.ok) {
            Alert.alert('Připomínka přidána');
            navigation.goBack();
        } else {
            Alert.alert('Chyba při ukládání');
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
