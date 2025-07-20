package repository

import models.Badge
import Badges
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class BadgeRepository {

    fun getAllBadges(): List<Badge> = transaction {
        Badges.selectAll().map { toBadge(it) }
    }

    fun getBadgeById(id: UUID): Badge? = transaction {
        Badges.select { Badges.id eq id }
            .mapNotNull { toBadge(it) }
            .singleOrNull()
    }

    private fun toBadge(row: ResultRow): Badge = Badge(
        id = row[Badges.id],
        name = row[Badges.name],
        description = row[Badges.description],
        icon = row[Badges.icon],
        conditionType = row[Badges.conditionType],
        conditionValue = row[Badges.conditionValue],
        createdAt = row[Badges.createdAt].toString()
    )
}
