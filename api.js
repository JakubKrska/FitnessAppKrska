import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const apiFetch = async (endpoint, options = {}) => {
    const token = await AsyncStorage.getItem("token");

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

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
