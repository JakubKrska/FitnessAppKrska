import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { API_URL } = Constants.expoConfig.extra;

export const apiFetch = async (endpoint, options = {}) => {
    const token = await AsyncStorage.getItem("token");

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    console.log("Volám endpoint:", `${API_URL}${endpoint}`);

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Chyba API");
    }

    return res.json();
};
