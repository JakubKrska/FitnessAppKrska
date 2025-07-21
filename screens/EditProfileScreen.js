import React, {useState, useEffect} from "react";
import {
    ScrollView,
    Alert,
    StyleSheet,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Picker} from "@react-native-picker/picker";

import AppTitle from "../components/ui/AppTitle";
import AppTextInput from "../components/ui/AppTextInput";
import AppButton from "../components/ui/AppButton";
import {colors, spacing} from "../components/ui/theme";
import { apiFetch } from "../api";

const EditProfileScreen = ({route, navigation}) => {
    const {user, onProfileUpdated} = route.params || {};

    const [formData, setFormData] = useState({
        name: "",
        plainPassword: "",
        age: "",
        height: "",
        weight: "",
        gender: "",
        goal: "",
        experienceLevel: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                plainPassword: "",
                age: user.age?.toString() || "",
                height: user.height?.toString() || "",
                weight: user.weight?.toString() || "",
                gender: user.gender || "",
                goal: user.goal || "",
                experienceLevel: user.experienceLevel || "",
            });
        }
    }, [user]);

    const handleChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const validate = () => {
        const {name, age, height, weight} = formData;
        if (!name || !age || !height || !weight) {
            Alert.alert("Chyba", "Vyplň prosím všechna povinná pole.");
            return false;
        }
        if (isNaN(age) || age <= 0 || age > 120) {
            Alert.alert("Chyba", "Zadej platný věk.");
            return false;
        }
        if (isNaN(height) || height < 100 || height > 250) {
            Alert.alert("Chyba", "Zadej platnou výšku v cm.");
            return false;
        }
        if (isNaN(weight) || weight < 30 || weight > 300) {
            Alert.alert("Chyba", "Zadej platnou váhu v kg.");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const token = await AsyncStorage.getItem("token");
            const payload = {
                ...formData,
                ...(formData.plainPassword === "" && {plainPassword: undefined}),
            };

            await apiFetch(`/users/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            Alert.alert("Profil upraven");
            if (onProfileUpdated) onProfileUpdated();
            navigation.goBack();
        } catch (err) {
            console.error("Chyba:", err);
            Alert.alert("Nepodařilo se upravit profil");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Úprava profilu</AppTitle>

            <AppTextInput placeholder="Jméno" value={formData.name} onChangeText={(val) => handleChange("name", val)} />
            <AppTextInput placeholder="Nové heslo (volitelné)" secureTextEntry value={formData.plainPassword} onChangeText={(val) => handleChange("plainPassword", val)} />
            <AppTextInput placeholder="Věk" keyboardType="numeric" value={formData.age} onChangeText={(val) => handleChange("age", val)} />
            <AppTextInput placeholder="Výška (cm)" keyboardType="numeric" value={formData.height} onChangeText={(val) => handleChange("height", val)} />
            <AppTextInput placeholder="Váha (kg)" keyboardType="numeric" value={formData.weight} onChangeText={(val) => handleChange("weight", val)} />

            <TextLabel label="Pohlaví" />
            <Picker selectedValue={formData.gender} onValueChange={(val) => handleChange("gender", val)} style={styles.picker}>
                <Picker.Item label="Vyber..." value="" />
                <Picker.Item label="Muž" value="male" />
                <Picker.Item label="Žena" value="female" />
                <Picker.Item label="Jiné" value="other" />
            </Picker>

            <TextLabel label="Cíl" />
            <Picker selectedValue={formData.goal} onValueChange={(val) => handleChange("goal", val)} style={styles.picker}>
                <Picker.Item label="Vyber..." value="" />
                <Picker.Item label="Hubnutí" value="Hubnutí" />
                <Picker.Item label="Zůstat fit" value="Zůstat fit" />
                <Picker.Item label="Nabrat svaly" value="Nabrat svaly" />
            </Picker>

            <TextLabel label="Zkušenosti" />
            <Picker selectedValue={formData.experienceLevel} onValueChange={(val) => handleChange("experienceLevel", val)} style={styles.picker}>
                <Picker.Item label="Vyber..." value="" />
                <Picker.Item label="Začátečník" value="Začátečník" />
                <Picker.Item label="Pokročilý" value="Pokročilý" />
                <Picker.Item label="Expert" value="Expert" />
            </Picker>

            <AppButton title="Uložit změny" onPress={handleSubmit} />
        </ScrollView>
    );
};

const TextLabel = ({label}) => (
    <View style={{marginTop: spacing.medium, marginBottom: spacing.small}}>
        <AppTitle style={{fontSize: 16}}>{label}</AppTitle>
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        padding: spacing.large,
        flexGrow: 1,
    },
    picker: {
        backgroundColor: colors.white,
        borderColor: colors.gray,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: spacing.small,
        marginBottom: spacing.medium,
    },
});

export default EditProfileScreen;
