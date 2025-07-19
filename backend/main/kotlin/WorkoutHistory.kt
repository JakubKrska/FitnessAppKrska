package com.example.models

import Users
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp
import org.jetbrains.exposed.sql.ReferenceOption

object WorkoutHistory : Table("workout_history") {
    val id = uuid("id").autoGenerate().uniqueIndex()
    val userId = uuid("user_id").references(Users.id, onDelete = ReferenceOption.CASCADE)
    val workoutPlanId = uuid("workout_plan_id").references(WorkoutPlans.id).nullable()
    val completedAt = timestamp("completed_at").defaultExpression(org.jetbrains.exposed.sql.javatime.CurrentTimestamp())

    override val primaryKey = PrimaryKey(id)
}
