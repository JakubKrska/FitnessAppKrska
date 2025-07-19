package repository

import models.WeightEntry
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant
import java.util.*

class WeightLogRepository {

    fun getForUser(userId: UUID): List<WeightEntry> = transaction {
        WeightLog.select { WeightLog.userId eq userId }
            .orderBy(WeightLog.loggedAt to SortOrder.ASC)
            .map { toEntry(it) }
    }

    fun addEntry(userId: UUID, weight: Double): WeightEntry = transaction {
        val id = UUID.randomUUID()
        val now = Instant.now()

        WeightLog.insert {
            it[this.id] = id
            it[this.userId] = userId
            it[this.weight] = weight.toBigDecimal()
            it[this.loggedAt] = now
        }

        WeightEntry(id, userId, weight, now.toString())
    }

    private fun toEntry(row: ResultRow): WeightEntry = WeightEntry(
        id = row[WeightLog.id],
        userId = row[WeightLog.userId],
        weight = row[WeightLog.weight].toDouble(),
        loggedAt = row[WeightLog.loggedAt].toString()
    )
}
