package requests

import WorkoutExercise
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class WorkoutExerciseRequest(
    @Contextual val workoutPlanId: UUID,
    @Contextual val exerciseId: UUID,
    val sets: Int,
    val reps: Int,
    val orderIndex: Int
) {
    fun validate(): List<String> {
        val errors = mutableListOf<String>()
        if (sets <= 0) errors.add("Sets must be greater than 0")
        if (reps <= 0) errors.add("Reps must be greater than 0")
        return errors
    }

    fun toModel(): WorkoutExercise {
        return WorkoutExercise(
            id = UUID.randomUUID(),
            workoutPlanId = workoutPlanId,
            exerciseId = exerciseId,
            sets = sets,
            reps = reps,
            orderIndex = orderIndex
        )
    }
}
