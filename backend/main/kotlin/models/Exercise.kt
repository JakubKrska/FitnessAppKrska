package models

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class Exercise(
    @Contextual val id: UUID,
    val name: String,
    val description: String?,
    val imageUrl: String?,
    val muscleGroup: String?,
    val difficulty: String?,
    @Contextual val authorId: UUID?
)
