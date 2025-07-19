package repository

import models.FavoriteExercise
import FavoriteExercises
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import java.util.*

class FavoriteExercisesRepository {

    fun getAllByUserId(userId: UUID): List<FavoriteExercise> = transaction {
        FavoriteExercises.select { FavoriteExercises.userId eq userId }
            .map { toFavoriteExercise(it) }
    }

    fun addFavorite(favorite: FavoriteExercise) = transaction {
        FavoriteExercises.insert {
            it[id] = favorite.id
            it[userId] = favorite.userId
            it[exerciseId] = favorite.exerciseId
        }
    }

    fun deleteFavorite(id: UUID): Boolean = transaction {
        FavoriteExercises.deleteWhere { FavoriteExercises.id eq id } > 0
    }

    fun isFavorite(userId: UUID, exerciseId: UUID): Boolean = transaction {
        FavoriteExercises.select {
            (FavoriteExercises.userId eq userId) and (FavoriteExercises.exerciseId eq exerciseId)
        }.count() > 0
    }

    private fun toFavoriteExercise(row: ResultRow): FavoriteExercise = FavoriteExercise(
        id = row[FavoriteExercises.id],
        userId = row[FavoriteExercises.userId],
        exerciseId = row[FavoriteExercises.exerciseId]
    )
}
