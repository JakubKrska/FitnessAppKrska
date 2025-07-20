import org.jetbrains.exposed.sql.Table
import java.time.LocalTime
import org.jetbrains.exposed.sql.javatime.time

object Reminders : Table("reminders") {
    val id = uuid("id").autoGenerate().uniqueIndex()
    val userId = uuid("user_id").index()
    val time = time("time")
    val daysOfWeek = text("days_of_week")
    val workoutPlanId = uuid("workout_plan_id").nullable()

    override val primaryKey = PrimaryKey(id)
}
