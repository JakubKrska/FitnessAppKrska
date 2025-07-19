package models

import java.util.*

data class ExerciseComment(
    val id: UUID,
    val userId: UUID,
    val exerciseId: UUID,
    val commentText: String,
    val createdAt: String
)

