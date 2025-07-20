import org.jetbrains.exposed.sql.Table
import java.util.UUID

object Exercises : Table("exercises") {
    val id = uuid("id").autoGenerate()
    val name = varchar("name", 255)
    val description = text("description").nullable()
    val imageUrl = varchar("image_url", 255).nullable()
    val muscleGroup = varchar("muscle_group", 50)
    val difficulty = varchar("difficulty", 50)
    val authorId = uuid("author_id").nullable()

    override val primaryKey = PrimaryKey(id)
}
