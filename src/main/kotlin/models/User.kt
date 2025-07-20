package models

import java.util.*

data class User(
    val id: UUID,
    val name: String,
    val email: String,
    val passwordHash: String,
    val age: Int?,
    val height: Int?,
    val gender: String?,
    val goal: String,
    val experienceLevel: String,
    val createdAt: String,
    val updatedAt: String,
    val weight: Int?,
    val role: String = "USER"
)