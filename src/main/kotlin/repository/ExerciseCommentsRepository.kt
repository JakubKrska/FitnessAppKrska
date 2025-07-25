package repository

import models.ExerciseComment
import ExerciseComments
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import java.util.*


class ExerciseCommentsRepository {

    fun getAllByExerciseId(exerciseId: UUID): List<ExerciseComment> = transaction {
        try {
            ExerciseComments
                .select { ExerciseComments.exerciseId eq exerciseId }
                .orderBy(ExerciseComments.createdAt, SortOrder.DESC)
                .map { toComment(it) }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    fun getCommentById(id: UUID): ExerciseComment? = transaction {
        ExerciseComments.select { ExerciseComments.id eq id }
            .mapNotNull { toComment(it) }
            .singleOrNull()
    }

    fun addComment(comment: ExerciseComment) = transaction {
        ExerciseComments.insert {
            it[id] = comment.id
            it[userId] = comment.userId
            it[exerciseId] = comment.exerciseId
            it[commentText] = comment.commentText
            // createdAt se nastaví automaticky přes defaultExpression
        }
    }

    fun updateComment(id: UUID, newText: String): Boolean = transaction {
        ExerciseComments.update({ ExerciseComments.id eq id }) {
            it[commentText] = newText
        } > 0
    }

    fun deleteComment(id: UUID): Boolean = transaction {
        ExerciseComments.deleteWhere { ExerciseComments.id eq id } > 0
    }

    private fun toComment(row: ResultRow): ExerciseComment = ExerciseComment(
        id = row[ExerciseComments.id],
        userId = row[ExerciseComments.userId],
        exerciseId = row[ExerciseComments.exerciseId],
        commentText = row[ExerciseComments.commentText],
        createdAt = row[ExerciseComments.createdAt].toString()
    )
}
