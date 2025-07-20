import React from 'react';
import {Share} from 'react-native';
import AppButton from './ui/AppButton';

const ShareWorkoutButton = ({planName, sets, reps, exercises}) => {
    const handleShare = async () => {
        try {
            const message = `💪 Právě jsem dokončil trénink: ${planName}!\n\n🔢 Sérií: ${sets}\n🔁 Opakování: ${reps}\n🏋️‍♂️ Cviky: ${exercises}\n\n#Workout #Progress #FitnessJourney`;

            await Share.share({message});
        } catch (error) {
            alert("Sdílení selhalo: " + error.message);
        }
    };

    return <AppButton title="📤 Sdílej svůj výkon" onPress={handleShare}/>;
};

export default ShareWorkoutButton;
