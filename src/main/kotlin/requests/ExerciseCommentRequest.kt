package requests

import models.ExerciseComment
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class ExerciseCommentRequest(
    @Contextual val exerciseId: UUID,
    val commentText: String
) {
    fun validate(): List<String> {
        val errors = mutableListOf<String>()
        if (commentText.isBlank()) errors.add("Comment cannot be blank")
        return errors
    }
}

fun ExerciseCommentRequest.toModel(userId: UUID): ExerciseComment {
    return ExerciseComment(
        id = UUID.randomUUID(),
        userId = userId,
        exerciseId = this.exerciseId,
        commentText = this.commentText,
    )
}
