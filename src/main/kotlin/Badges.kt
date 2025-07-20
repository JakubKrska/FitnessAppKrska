import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp
import org.jetbrains.exposed.sql.javatime.CurrentTimestamp

object Badges : Table("badges") {
    val id = uuid("id")
    val name = text("name")
    val description = text("description").nullable()
    val icon = text("icon").nullable()
    val conditionType = text("condition_type")
    val conditionValue = text("condition_value").nullable()
    val createdAt = timestamp("created_at").defaultExpression(CurrentTimestamp())

    override val primaryKey = PrimaryKey(id)
}