package repository

import com.example.models.WorkoutHistory
import models.WorkoutHistoryEntry
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import java.time.ZoneId
import java.util.*

class WorkoutHistoryRepository {

    fun getAllHistoryEntries(): List<WorkoutHistoryEntry> = transaction {
        WorkoutHistory.selectAll().map { toEntry(it) }
    }

    fun getWorkoutHistoryById(id: UUID): WorkoutHistoryEntry? = transaction {
        WorkoutHistory.select { WorkoutHistory.id eq id }
            .mapNotNull { toEntry(it) }
            .singleOrNull()
    }

    fun addWorkoutHistoryEntry(entry: WorkoutHistoryEntry) = transaction {
        WorkoutHistory.insert {
            it[id] = entry.id
            it[userId] = entry.userId
            it[workoutPlanId] = entry.workoutPlanId
            it[completedAt] = entry.completedAt
        }
    }


    fun deleteWorkoutHistoryEntry(id: UUID): Boolean = transaction {
        WorkoutHistory.deleteWhere { WorkoutHistory.id eq id } > 0
    }

    fun getHistoryCountForUser(userId: UUID): Int = transaction {
        WorkoutHistory.select { WorkoutHistory.userId eq userId }.count().toInt()
    }


    private fun toEntry(row: ResultRow): WorkoutHistoryEntry = WorkoutHistoryEntry(
        id = row[WorkoutHistory.id],
        userId = row[WorkoutHistory.userId],
        workoutPlanId = row[WorkoutHistory.workoutPlanId],
        completedAt = row[WorkoutHistory.completedAt]
    )

    fun getActiveDaysForUser(userId: UUID): Int = transaction {
        WorkoutHistory
            .select { WorkoutHistory.userId eq userId }
            .map { it[WorkoutHistory.completedAt].atZone(ZoneId.systemDefault()).toLocalDate() }
            .distinct()
            .count()
    }
}
