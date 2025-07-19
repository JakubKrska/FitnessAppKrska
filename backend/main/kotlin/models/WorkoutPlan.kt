package models

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class WorkoutPlan(
    @Contextual val id: UUID,
    @Contextual val userId: UUID?,
    val name: String,
    val description: String?,
    val experienceLevel: String?,
    val goal: String?,
    val isDefault: Boolean = false
)