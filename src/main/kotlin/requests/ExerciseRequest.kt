package requests

import models.Exercise
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class ExerciseRequest(
    val name: String,
    val description: String?,
    val imageUrl: String?,
    val muscleGroup: String?,
    val difficulty: String?
) {
    fun validate(): List<String> {
        val errors = mutableListOf<String>()
        if (name.isBlank()) errors.add("Name is required")
        if (muscleGroup.isNullOrBlank()) errors.add("Muscle group is required")
        if (difficulty.isNullOrBlank()) errors.add("Difficulty is required")
        return errors
    }

    fun toModel(authorId: UUID?): Exercise {
        return Exercise(
            id = UUID.randomUUID(),
            name = name,
            description = description,
            imageUrl = imageUrl,
            muscleGroup = muscleGroup,
            difficulty = difficulty,
            authorId = authorId
        )
    }
}
