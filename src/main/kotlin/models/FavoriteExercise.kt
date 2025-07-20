package models

import java.util.*

data class FavoriteExercise(
    val id: UUID,
    val userId: UUID,
    val exerciseId: UUID
)