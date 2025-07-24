package requests

import models.User
import kotlinx.serialization.Serializable

@Serializable
data class UpdateUserRequest(
    val name: String,
    val age: Int?,
    val height: Int?,
    val weight: Double?,
    val gender: String?,
    val goal: String,
    val experienceLevel: String,
    val plainPassword: String? = null
) {
    fun validate(): List<String> {
        val errors = mutableListOf<String>()
        if (name.isBlank()) errors.add("Name is required")
        if (goal.isBlank()) errors.add("Goal is required")
        if (experienceLevel.isBlank()) errors.add("Experience level is required")
        return errors
    }
}

fun UpdateUserRequest.toUpdatedUser(existing: User): User {
    return existing.copy(
        name = name,
        age = age,
        height = height,
        weight = weight,
        gender = gender,
        goal = goal,
        experienceLevel = experienceLevel
    )

}
