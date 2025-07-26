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

    const url = `${API_URL}${endpoint}`;
    console.log("📡 Volám endpoint:", url);

    const res = await fetch(url, {
        ...options,
        headers,
    });

    const text = await res.text();

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.warn("⚠️ Odpověď není validní JSON:", text);
        data = null;
    }

    if (!res.ok) {
        console.error("❌ API error:", {
            status: res.status,
            body: text
        });
        const errorMessage = data?.message || text || "Chyba API";
        throw new Error(errorMessage);
    }
    if (res.ok) {
        console.log("✅ API OK:", {
            status: res.status,
            endpoint: url,
            response: data,
        });
    }
    if (options?.method === 'DELETE') {
        console.log("📤 DELETE request to:", url);
    }

    return data;
};
