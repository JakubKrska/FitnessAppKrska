package com.example.models

import Exercises
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.ReferenceOption

object WorkoutPerformances : Table("workout_performance") {
    val id = uuid("id").autoGenerate().uniqueIndex()
    val workoutHistoryId = uuid("workout_history_id").references(WorkoutHistory.id, onDelete = ReferenceOption.CASCADE)
    val exerciseId = uuid("exercise_id").references(Exercises.id, onDelete = ReferenceOption.CASCADE)
    val setsCompleted = integer("sets_completed")
    val repsCompleted = integer("reps_completed")
    val weightUsed = float("weight_used").nullable()

    override val primaryKey = PrimaryKey(id)
}
