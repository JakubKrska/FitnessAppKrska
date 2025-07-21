import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../api';

const useUser = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                if (!token) throw new Error("Token nenalezen");

                const data = await apiFetch("/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser(data);
            } catch (err) {
                console.error("Chyba načtení uživatele:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return {user, loading};
};

export default useUser;
