package requests

import models.FavoriteExercise
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class FavoriteExerciseRequest(
    @Contextual val exerciseId: UUID
)

fun FavoriteExerciseRequest.toModel(userId: UUID): FavoriteExercise {
    return FavoriteExercise(
        id = UUID.randomUUID(),
        userId = userId,
        exerciseId = exerciseId
    )
}
