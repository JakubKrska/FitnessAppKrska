package models

import java.util.*

data class WorkoutPerformance(
    val id: UUID,
    val workoutHistoryId: UUID,
    val exerciseId: UUID,
    val setsCompleted: Int,
    val repsCompleted: Int,
    val weightUsed: Double?
)