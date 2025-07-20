package models

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.LocalTime
import java.util.*

@Serializable
data class Reminder(
    @Contextual val id: UUID,
    @Contextual val userId: UUID,
    @Contextual val time: LocalTime,
    val daysOfWeek: List<String>,
    @Contextual val workoutPlanId: UUID?
)
