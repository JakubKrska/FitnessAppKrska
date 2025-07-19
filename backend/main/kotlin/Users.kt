import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.CurrentTimestamp
import org.jetbrains.exposed.sql.javatime.timestamp

object Users : Table("users") {
    val id = uuid("id").autoGenerate().uniqueIndex()
    val name = varchar("name", 255)
    val email = varchar("email", 255).uniqueIndex()
    val passwordHash = text("password_hash")
    val age = integer("age").nullable()
    val height = integer("height").nullable()
    val weight = integer("weight").nullable()
    val gender = varchar("gender", 50).nullable()
    val goal = varchar("goal", 50)
    val experienceLevel = varchar("experience_level", 50)
    val createdAt = timestamp("created_at").defaultExpression(CurrentTimestamp())
    val updatedAt = timestamp("updated_at").defaultExpression(CurrentTimestamp())
    val role = varchar("role", 50).default("USER") // Přidání role


    override val primaryKey = PrimaryKey(id)
}


