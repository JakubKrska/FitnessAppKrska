package com.example.models

import Exercises
import org.jetbrains.exposed.sql.Table

object WorkoutExercises : Table("workout_exercises") {
    val id = uuid("id").autoGenerate()
    val workoutPlanId = uuid("workout_plan_id").references(WorkoutPlans.id)
    val exerciseId = uuid("exercise_id").references(Exercises.id)
    val sets = integer("sets") // Počet sérií
    val reps = integer("reps") // Počet opakování
    val orderIndex = integer("order_index") // Počet opakování

    override val primaryKey = PrimaryKey(id)
}
