import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.CurrentTimestamp
import org.jetbrains.exposed.sql.javatime.timestamp


object WeightLog : Table("weight_log") {
    val id = uuid("id").autoGenerate()
    val userId = uuid("user_id").references(Users.id, onDelete = ReferenceOption.CASCADE)
    val weight = decimal("weight", 5, 2)
    val loggedAt = timestamp("logged_at").defaultExpression(CurrentTimestamp())

    override val primaryKey = PrimaryKey(id)
}
