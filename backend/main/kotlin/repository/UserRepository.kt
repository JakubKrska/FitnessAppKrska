package repository


import models.User
import Users
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.mindrot.jbcrypt.BCrypt
import java.util.UUID
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq

class UserRepository {

    fun getAllUsers(): List<User> = transaction {
        Users.selectAll().map { toUser(it) }
    }

    fun getUserById(userId: UUID): User? = transaction {
        Users.select { Users.id eq userId }
            .mapNotNull { toUser(it) }
            .singleOrNull()
    }

    fun addUser(user: User) = transaction {
        Users.insert {
            it[id] = user.id
            it[name] = user.name
            it[email] = user.email
            it[passwordHash] = user.passwordHash
            it[age] = user.age
            it[height] = user.height
            it[weight] = user.weight
            it[gender] = user.gender
            it[goal] = user.goal
            it[experienceLevel] = user.experienceLevel
            it[role] = user.role
        }
    }

    fun updateUser(userId: UUID, updatedUser: User, newPlainPassword: String?): Boolean = transaction {
        Users.update({ Users.id eq userId }) {
            it[name] = updatedUser.name
            it[email] = updatedUser.email
            if (newPlainPassword != null) {
                it[passwordHash] = BCrypt.hashpw(newPlainPassword, BCrypt.gensalt())
            }
            it[age] = updatedUser.age
            it[height] = updatedUser.height
            it[weight] = updatedUser.weight
            it[gender] = updatedUser.gender
            it[goal] = updatedUser.goal
            it[experienceLevel] = updatedUser.experienceLevel
            it[role] = updatedUser.role
            it[updatedAt] = org.jetbrains.exposed.sql.javatime.CurrentTimestamp()
        } > 0
    }

    fun deleteUser(userId: UUID): Boolean = transaction {
        Users.deleteWhere{ Users.id eq userId } > 0
    }

    fun findUserByEmail(email: String): User? = transaction {
        Users.select { Users.email eq email }
            .mapNotNull { toUser(it) }
            .singleOrNull()
    }

    private fun toUser(row: ResultRow): User = User(
        id = row[Users.id],
        name = row[Users.name],
        email = row[Users.email],
        passwordHash = row[Users.passwordHash],
        age = row[Users.age],
        height = row[Users.height],
        weight = row[Users.weight],
        gender = row[Users.gender],
        goal = row[Users.goal],
        experienceLevel = row[Users.experienceLevel],
        role = row[Users.role],
        createdAt = row[Users.createdAt].toString(),
        updatedAt = row[Users.updatedAt].toString()
    )
    fun updateUserGoal(userId: UUID, newGoal: String): Boolean = transaction {
        Users.update({ Users.id eq userId }) {
            it[goal] = newGoal
        } > 0
    }
}
