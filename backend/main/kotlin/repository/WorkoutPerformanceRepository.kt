package repository

import models.WorkoutPerformance
import com.example.models.WorkoutPerformances
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import java.util.*

class WorkoutPerformanceRepository {

    fun getAllByHistoryId(historyId: UUID): List<WorkoutPerformance> = transaction {
        WorkoutPerformances.select { WorkoutPerformances.workoutHistoryId eq historyId }
            .map { toWorkoutPerformance(it) }
    }

    fun getById(id: UUID): WorkoutPerformance? = transaction {
        WorkoutPerformances.select { WorkoutPerformances.id eq id }
            .mapNotNull { toWorkoutPerformance(it) }
            .singleOrNull()
    }

    fun addPerformance(performance: WorkoutPerformance) = transaction {
        WorkoutPerformances.insert {
            it[id] = performance.id
            it[workoutHistoryId] = performance.workoutHistoryId
            it[exerciseId] = performance.exerciseId
            it[setsCompleted] = performance.setsCompleted
            it[repsCompleted] = performance.repsCompleted
            it[weightUsed] = performance.weightUsed?.toFloat()
        }
    }
    fun getAllByExerciseId(exerciseId: UUID): List<WorkoutPerformance> = transaction {
        WorkoutPerformances.select {
            WorkoutPerformances.exerciseId eq exerciseId
        }.map { toWorkoutPerformance(it) }
    }

    fun updatePerformance(id: UUID, updated: WorkoutPerformance): Boolean = transaction {
        WorkoutPerformances.update({ WorkoutPerformances.id eq id }) {
            it[workoutHistoryId] = updated.workoutHistoryId
            it[exerciseId] = updated.exerciseId
            it[setsCompleted] = updated.setsCompleted
            it[repsCompleted] = updated.repsCompleted
            it[weightUsed] = updated.weightUsed?.toFloat()
        } > 0
    }

    fun deletePerformance(id: UUID): Boolean = transaction {
        WorkoutPerformances.deleteWhere { WorkoutPerformances.id eq id } > 0
    }

    private fun toWorkoutPerformance(row: ResultRow): WorkoutPerformance = WorkoutPerformance(
        id = row[WorkoutPerformances.id],
        workoutHistoryId = row[WorkoutPerformances.workoutHistoryId],
        exerciseId = row[WorkoutPerformances.exerciseId],
        setsCompleted = row[WorkoutPerformances.setsCompleted],
        repsCompleted = row[WorkoutPerformances.repsCompleted],
        weightUsed = row[WorkoutPerformances.weightUsed]?.toDouble()
    )
}
