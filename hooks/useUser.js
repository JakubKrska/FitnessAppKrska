import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useUser = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const res = await fetch("http://localhost:8081/users/me", {
                    headers: {Authorization: `Bearer ${token}`},
                });
                const data = await res.json();
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
