package requests

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class ReminderRequest(
    val time: String, // expected format: "HH:mm"
    val daysOfWeek: List<String>,
    @Contextual val workoutPlanId: UUID? = null
)
