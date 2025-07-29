package repository

import models.Reminder
import Reminders
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*
import java.time.LocalTime
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq

class ReminderRepository {

    fun addReminder(reminder: Reminder) = transaction {
        Reminders.insert {
            it[id] = reminder.id
            it[userId] = reminder.userId
            it[time] = reminder.time
            it[daysOfWeek] = reminder.daysOfWeek.joinToString(",")
            it[workoutPlanId] = reminder.workoutPlanId
        }
    }

    fun getRemindersByUser(userId: UUID): List<Reminder> = transaction {
        Reminders.select { Reminders.userId eq userId }
            .map { row ->
                val days = row[Reminders.daysOfWeek].split(",")
                Reminder(
                    id = row[Reminders.id],
                    userId = row[Reminders.userId],
                    time = row[Reminders.time],
                    daysOfWeek = days,
                    workoutPlanId = row[Reminders.workoutPlanId]
                )
            }
    }

    fun deleteReminder(id: UUID): Boolean = transaction {
        Reminders.deleteWhere { Reminders.id eq id } > 0
    }

    fun getRemindersForUser(userId: UUID): List<Reminder> = transaction {
        Reminders.select { Reminders.userId eq userId }
            .map {
                Reminder(
                    id = it[Reminders.id],
                    userId = it[Reminders.userId],
                    time = it[Reminders.time],
                    daysOfWeek = it[Reminders.daysOfWeek].split(","),
                    workoutPlanId = it[Reminders.workoutPlanId]
                )
            }
    }
    fun updateReminder(reminder: Reminder): Boolean = transaction {
        Reminders.update({ Reminders.id eq reminder.id }) {
            it[time] = reminder.time
            it[daysOfWeek] = reminder.daysOfWeek.joinToString(",")
            it[workoutPlanId] = reminder.workoutPlanId
        } > 0
    }
}
