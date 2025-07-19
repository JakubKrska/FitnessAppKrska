package requests

import kotlinx.serialization.Serializable

@Serializable
data class GoalUpdateRequest(
    val goal: String
)
