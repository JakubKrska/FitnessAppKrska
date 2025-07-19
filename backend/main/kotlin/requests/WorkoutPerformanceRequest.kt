package requests

import models.WorkoutPerformance
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class WorkoutPerformanceRequest(
    @Contextual val workoutHistoryId: UUID,
    @Contextual val exerciseId: UUID,
    val setsCompleted: Int,
    val repsCompleted: Int,
    val weightUsed: Double?
) {
    fun validate(): List<String> {
        val errors = mutableListOf<String>()
        if (setsCompleted <= 0) errors.add("Sets completed must be greater than 0")
        if (repsCompleted <= 0) errors.add("Reps completed must be greater than 0")
        return errors
    }

    fun toModel(id: UUID = UUID.randomUUID()): WorkoutPerformance {
        return WorkoutPerformance(
            id = id,
            workoutHistoryId = workoutHistoryId,
            exerciseId = exerciseId,
            setsCompleted = setsCompleted,
            repsCompleted = repsCompleted,
            weightUsed = weightUsed
        )
    }
}
