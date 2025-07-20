import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table

object WorkoutPlans : Table("workout_plans") {
    val id = uuid("id").autoGenerate().uniqueIndex()
    val userId = uuid("user_id").references(Users.id, onDelete = ReferenceOption.CASCADE)
    val name = varchar("name", 255)
    val description = text("description").nullable()
    val experienceLevel = varchar("experience_level", 50)
    val goal = varchar("goal", 50)
    val isDefault = bool("is_default").default(false)

    override val primaryKey = PrimaryKey(id)
}