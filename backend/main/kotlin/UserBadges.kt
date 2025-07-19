import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp
import org.jetbrains.exposed.sql.javatime.CurrentTimestamp

object UserBadges : Table("user_badge") {
    val id = uuid("id")
    val userId = uuid("user_id")
    val badgeId = uuid("badge_id")
    val unlockedAt = timestamp("unlocked_at").defaultExpression(CurrentTimestamp())

    override val primaryKey = PrimaryKey(id)
    init {
        uniqueIndex(userId, badgeId)
    }
}