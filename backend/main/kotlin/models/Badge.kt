package models

import java.util.*

data class Badge(
    val id: UUID,
    val name: String,
    val description: String?,
    val icon: String?,
    val conditionType: String,
    val conditionValue: String?,
    val createdAt: String
)
