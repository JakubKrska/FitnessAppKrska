package requests

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class ReminderRequest(
    val time: String,
    val daysOfWeek: List<String>,
    @Contextual val workoutPlanId: UUID? = null
)
