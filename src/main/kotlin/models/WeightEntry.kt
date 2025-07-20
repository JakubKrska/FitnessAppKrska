package models

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class WeightEntry(
    @Contextual val id: UUID,
    @Contextual val userId: UUID,
    val weight: Double,
    val loggedAt: String
)