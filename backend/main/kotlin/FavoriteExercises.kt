import Exercises
import Users
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.ReferenceOption

object FavoriteExercises : Table("favorite_exercises") {
    val id = uuid("id").autoGenerate().uniqueIndex()
    val userId = uuid("user_id").references(Users.id, onDelete = ReferenceOption.CASCADE)
    val exerciseId = uuid("exercise_id").references(Exercises.id, onDelete = ReferenceOption.CASCADE)

    override val primaryKey = PrimaryKey(id)
}
