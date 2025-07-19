package requests

import models.WorkoutHistoryEntry
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant
import java.util.*

@Serializable
data class WorkoutHistoryRequest(
    @Contextual val workoutPlanId: UUID?
) {
    fun validate(): List<String> {
        val errors = mutableListOf<String>()
        // if (workoutPlanId == null) errors.add("Workout plan ID is required")
        return errors
    }

    fun toModel(userId: UUID): WorkoutHistoryEntry {
        return WorkoutHistoryEntry(
            id = UUID.randomUUID(),
            userId = userId,
            workoutPlanId = workoutPlanId,
            completedAt = Instant.now()
        )
    }
}
