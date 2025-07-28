import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const exportToCSV = async (performance, exerciseMap) => {
    const header = "Cvik,Série,Opakování,Váha (kg),Celkem (kg)";

    const rows = performance.map(p => {
        const name = exerciseMap[p.exerciseId] || "Cvik";
        const sets = p.setsCompleted;
        const reps = p.repsCompleted;
        const weight = p.weightUsed ?? 0;
        const total = sets * reps * weight;

        return `${name},${sets},${reps},${weight},${total}`;
    });

    const csv = [header, ...rows].join("\n");
    const fileUri = FileSystem.documentDirectory + "trenink_summary.csv";

    try {
        await FileSystem.writeAsStringAsync(fileUri, csv, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Sdílet tréninkový soubor CSV',
        });
    } catch (err) {
        console.error("Chyba při exportu CSV:", err);
    }
};