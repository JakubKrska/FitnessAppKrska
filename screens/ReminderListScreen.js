import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Button, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import { apiFetch } from '../api';

export default function ReminderListScreen({navigation}) {
    const [reminders, setReminders] = useState([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) fetchReminders();
    }, [isFocused]);

    const fetchReminders = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const data = await apiFetch('/reminders', {
                headers: {Authorization: `Bearer ${token}`},
            });
            setReminders(data);
        } catch (err) {
            Alert.alert("Chyba", "Nepodařilo se načíst připomínky.");
        }
    };

    const deleteReminder = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await apiFetch(`/reminders/${id}`, {
                method: 'DELETE',
                headers: {Authorization: `Bearer ${token}`},
            });
            fetchReminders();
        } catch (err) {
            Alert.alert("Chyba", "Nepodařilo se smazat připomínku.");
        }
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
