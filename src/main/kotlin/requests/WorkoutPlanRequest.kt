package requests

import models.WorkoutPlan
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class WorkoutPlanRequest(
    val name: String,
    val description: String?,
    val experienceLevel: String?,
    val goal: String?,
    val isDefault: Boolean = false
) {
    fun validate(): List<String> {
        val errors = mutableListOf<String>()
        if (name.isBlank()) errors.add("Name is required")
        if (experienceLevel.isNullOrBlank()) errors.add("Experience level is required")
        if (goal.isNullOrBlank()) errors.add("Goal is required")
        return errors
    }

    fun toModel(userId: UUID): WorkoutPlan {
        return WorkoutPlan(
            id = UUID.randomUUID(),
            userId = userId,
            name = name,
            description = description,
            experienceLevel = experienceLevel ?: "",
            goal = goal ?: "",
            isDefault = isDefault
        )
    }
}
