
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table


object ExerciseComments : Table("exercise_comments") {
    val id = uuid("id").autoGenerate().uniqueIndex()
    val userId = uuid("user_id").references(Users.id, onDelete = ReferenceOption.CASCADE)
    val exerciseId = uuid("exercise_id").references(Exercises.id, onDelete = ReferenceOption.CASCADE)
    val commentText = text("comment_text")


    override val primaryKey = PrimaryKey(id)
}
