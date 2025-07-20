// screens/ReminderListScreen.js
import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Button, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';

export default function ReminderListScreen({navigation}) {
    const [reminders, setReminders] = useState([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) fetchReminders();
    }, [isFocused]);

    const fetchReminders = async () => {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch('http://<YOUR_API>/reminders', {
            headers: {Authorization: `Bearer ${token}`},
        });
        const data = await res.json();
        setReminders(data);
    };

    const deleteReminder = async (id) => {
        const token = await AsyncStorage.getItem('token');
        await fetch(`http://<YOUR_API>/reminders/${id}`, {
            method: 'DELETE',
            headers: {Authorization: `Bearer ${token}`},
        });
        fetchReminders();
    };

    return (
        <View style={{flex: 1, padding: 16}}>
            <Button title="Přidat připomínku" onPress={() => navigation.navigate('AddReminder')}/>
            <FlatList
                data={reminders}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <View style={{marginVertical: 10}}>
                        <Text>Čas: {item.time}</Text>
                        <Text>Dny: {item.daysOfWeek.join(', ')}</Text>
                        <Button title="Smazat" onPress={() => deleteReminder(item.id)}/>
                    </View>
                )}
            />
        </View>
    );
}
