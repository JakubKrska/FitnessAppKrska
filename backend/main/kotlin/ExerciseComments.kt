import Exercises
import Users
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp
import java.util.UUID

object ExerciseComments : Table("exercise_comments") {
    val id = uuid("id").autoGenerate().uniqueIndex()
    val userId = uuid("user_id").references(Users.id, onDelete = ReferenceOption.CASCADE)
    val exerciseId = uuid("exercise_id").references(Exercises.id, onDelete = ReferenceOption.CASCADE)
    val commentText = text("comment_text")
    val createdAt = timestamp("created_at").defaultExpression(org.jetbrains.exposed.sql.javatime.CurrentTimestamp())

    override val primaryKey = PrimaryKey(id)
}
