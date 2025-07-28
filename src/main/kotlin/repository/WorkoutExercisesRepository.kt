package repository

import WorkoutExercise
import WorkoutExercises
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import java.util.*

class WorkoutExercisesRepository {

    fun getAllByPlanId(planId: UUID): List<WorkoutExercise> = transaction {
        WorkoutExercises.select { WorkoutExercises.workoutPlanId eq planId }
            .orderBy(WorkoutExercises.orderIndex)
            .map { toWorkoutExercise(it) }
    }

    fun getById(id: UUID): WorkoutExercise? = transaction {
        WorkoutExercises.select { WorkoutExercises.id eq id }
            .mapNotNull { toWorkoutExercise(it) }
            .singleOrNull()
    }

    fun addWorkoutExercise(exercise: WorkoutExercise) = transaction {
        WorkoutExercises.insert {
            it[id] = exercise.id
            it[workoutPlanId] = exercise.workoutPlanId
            it[exerciseId] = exercise.exerciseId
            it[sets] = exercise.sets
            it[reps] = exercise.reps
            it[orderIndex] = exercise.orderIndex
        }
    }

    fun updateWorkoutExercise(id: UUID, updated: WorkoutExercise): Boolean = transaction {
        WorkoutExercises.update({ WorkoutExercises.id eq id }) {
            it[workoutPlanId] = updated.workoutPlanId
            it[exerciseId] = updated.exerciseId
            it[sets] = updated.sets
            it[reps] = updated.reps
            it[orderIndex] = updated.orderIndex
        } > 0
    }

    fun deleteWorkoutExercise(id: UUID): Boolean = transaction {
        WorkoutExercises.deleteWhere { WorkoutExercises.id eq id } > 0
    }

    fun copyExercisesFromPlanToPlan(sourcePlanId: UUID, targetPlanId: UUID) = transaction {
        val exercises = getAllByPlanId(sourcePlanId)
        exercises.forEach { ex ->
            WorkoutExercises.insert {
                it[id] = UUID.randomUUID()
                it[workoutPlanId] = targetPlanId
                it[exerciseId] = ex.exerciseId
                it[sets] = ex.sets
                it[reps] = ex.reps
                it[orderIndex] = ex.orderIndex
            }
        }
    }


    private fun toWorkoutExercise(row: ResultRow): WorkoutExercise = WorkoutExercise(
        id = row[WorkoutExercises.id],
        workoutPlanId = row[WorkoutExercises.workoutPlanId],
        exerciseId = row[WorkoutExercises.exerciseId],
        sets = row[WorkoutExercises.sets],
        reps = row[WorkoutExercises.reps],
        orderIndex = row[WorkoutExercises.orderIndex]
    )
}
