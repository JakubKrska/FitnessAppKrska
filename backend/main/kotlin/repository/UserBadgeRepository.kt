package repository

import UserBadges
import models.UserBadge
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class UserBadgeRepository {

    fun getBadgesForUser(userId: UUID): List<UserBadge> = transaction {
        UserBadges.select { UserBadges.userId eq userId }
            .map { toUserBadge(it) }
    }

    fun addUserBadge(userBadge: UserBadge): Boolean = transaction {
        UserBadges.insertIgnore {
            it[id] = userBadge.id
            it[userId] = userBadge.userId
            it[badgeId] = userBadge.badgeId
            it[unlockedAt] = userBadge.unlockedAt
        }.insertedCount > 0
    }

    private fun toUserBadge(row: ResultRow): UserBadge = UserBadge(
        id = row[UserBadges.id],
        userId = row[UserBadges.userId],
        badgeId = row[UserBadges.badgeId],
        unlockedAt = row[UserBadges.unlockedAt]
    )
}
