import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

export async function scheduleDailyNotification(time, days, message) {
    const [hour, minute] = time.split(':').map(Number);
    for (const day of days) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Připomínka tréninku",
                body: message,
            },
            trigger: {
                hour,
                minute,
                repeats: true,
                weekday: dayToNumber(day),
            },
        });
    }
}

function dayToNumber(day) {
    return {
        Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6, Sat: 7, Sun: 1,
    }[day];
}