package models

import kotlinx.serialization.Serializable
import kotlinx.serialization.Contextual
import java.util.*
import java.time.Instant

@Serializable
data class WorkoutHistoryEntry(
    @Contextual val id: UUID,
    @Contextual val userId: UUID,
    @Contextual val workoutPlanId: UUID?,
    @Contextual val completedAt: Instant
)
