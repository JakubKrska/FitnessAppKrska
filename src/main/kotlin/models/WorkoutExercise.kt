import kotlinx.serialization.Serializable
import kotlinx.serialization.Contextual
import java.util.*

@Serializable
data class WorkoutExercise(
    @Contextual val id: UUID,
    @Contextual val workoutPlanId: UUID,
    @Contextual val exerciseId: UUID,
    val sets: Int,
    val reps: Int,
    val orderIndex: Int
)
