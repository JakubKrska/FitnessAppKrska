package repository

import Exercises
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import models.Exercise

class ExerciseRepository {

    fun getAllExercisesForUser(userId: UUID?): List<Exercise> = transaction {
        if (userId != null) {
            Exercises.select {
                (Exercises.authorId eq userId) or (Exercises.authorId.isNull())
            }.map { toExercise(it) }
        } else {
            Exercises.select {
                Exercises.authorId.isNull()
            }.map { toExercise(it) }
        }
    }

    fun getExerciseById(exerciseId: UUID): Exercise? = transaction {
        Exercises.select { Exercises.id eq exerciseId }
            .mapNotNull { toExercise(it) }
            .singleOrNull()
    }

    fun addExercise(exercise: Exercise) = transaction {
        Exercises.insert {
            it[id] = exercise.id
            it[name] = exercise.name
            it[description] = exercise.description
            it[imageUrl] = exercise.imageUrl
            it[muscleGroup] = exercise.muscleGroup ?: ""
            it[difficulty] = exercise.difficulty ?: ""
            it[authorId] = exercise.authorId
        }
    }

    fun updateExercise(id: UUID, updated: Exercise): Boolean = transaction {
        Exercises.update({ Exercises.id eq id }) {
            it[name] = updated.name
            it[description] = updated.description
            it[imageUrl] = updated.imageUrl
            it[muscleGroup] = updated.muscleGroup ?: ""
            it[difficulty] = updated.difficulty ?: ""
            it[authorId] = updated.authorId
        } > 0
    }

    fun deleteExercise(id: UUID): Boolean = transaction {
        Exercises.deleteWhere { Exercises.id eq id } > 0
    }

    private fun toExercise(row: ResultRow): Exercise = Exercise(
        id = row[Exercises.id],
        name = row[Exercises.name],
        description = row[Exercises.description],
        imageUrl = row[Exercises.imageUrl],
        muscleGroup = row[Exercises.muscleGroup],
        difficulty = row[Exercises.difficulty],
        authorId = row[Exercises.authorId]
    )

    fun getPublicExercises(): List<Exercise> = transaction {
        Exercises.select { Exercises.authorId.isNull() }
            .map { toExercise(it) }
    }

    fun getVisibleExercisesForUser(userId: UUID): List<Exercise> = transaction {
        Exercises.select {
            (Exercises.authorId eq userId) or Exercises.authorId.isNull()
        }.map { toExercise(it) }
    }
}
