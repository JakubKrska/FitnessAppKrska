package routes

import authUtils.JwtConfig
import models.User
import repository.UserRepository
import authUtils.getUserId
import authUtils.isAdmin
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import org.mindrot.jbcrypt.BCrypt
import requests.UpdateUserRequest
import requests.toUpdatedUser
import java.util.*
import requests.RegisterRequest
import responses.toResponse
import java.time.Instant

@Serializable
data class LoginRequest(val email: String, val password: String)

fun Route.userRoutes(userRepository: UserRepository) {

    route("/authUtils") {
        post("/register") {
            val request = call.receive<RegisterRequest>()
            val errors = request.validate()
            if (errors.isNotEmpty()) {
                call.respond(HttpStatusCode.BadRequest, errors)
                return@post
            }

            val existingUser = userRepository.findUserByEmail(request.email)
            if (existingUser != null) {
                call.respond(HttpStatusCode.Conflict, "User already exists")
                return@post
            }

            val now = Instant.now().toString()
            val newUser = User(
                id = UUID.randomUUID(),
                name = request.name,
                email = request.email,
                passwordHash = BCrypt.hashpw(request.password, BCrypt.gensalt()),
                age = null,
                height = null,
                weight = null,
                gender = null,
                goal = "",
                experienceLevel = "",
                createdAt = now,
                updatedAt = now,
                role = "USER"
            )
            userRepository.addUser(newUser)
            call.respond(HttpStatusCode.Created, mapOf("message" to "User registered"))
        }

        post("/login") {
            val request = call.receive<LoginRequest>()
            val foundUser = userRepository.findUserByEmail(request.email)

            if (foundUser == null || !BCrypt.checkpw(request.password, foundUser.passwordHash)) {
                call.respond(HttpStatusCode.Unauthorized, "Invalid credentials")
                return@post
            }

            val token = JwtConfig.generateToken(foundUser.id.toString(), foundUser.role)
            call.respond(mapOf("token" to token))
        }
    }

    authenticate("authUtils-jwt") {
        route("/users") {

            get {
                val principal = call.principal<JWTPrincipal>()
                if (!isAdmin(principal)) {
                    call.respond(HttpStatusCode.Forbidden, "Only admins can list users")
                    return@get
                }

                val users = userRepository.getAllUsers()
                call.respond(users)
            }

            get("/{id}") {
                val id = call.parameters["id"]?.let { UUID.fromString(it) }
                val principal = call.principal<JWTPrincipal>()
                val currentUserId = principal?.getUserId()

                if (id == null || principal == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid ID or unauthorized")
                    return@get
                }

                if (id != currentUserId && !isAdmin(principal)) {
                    call.respond(HttpStatusCode.Forbidden, "You can only view your own data")
                    return@get
                }

                val user = userRepository.getUserById(id)
                if (user != null) {
                    call.respond(user.toResponse())
                } else {
                    call.respond(HttpStatusCode.NotFound, "User not found")
                }
            }

            get("/me") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.getUserId()

                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, "Not authorized")
                    return@get
                }

                val user = userRepository.getUserById(userId)
                if (user != null) {
                    call.respond(user.toResponse())
                } else {
                    call.respond(HttpStatusCode.NotFound, "User not found")
                }
            }

            // 🔧 Nový endpoint pro onboarding: POST /users/me/goal
            post("/me/goal") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.getUserId()

                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, "Not authorized")
                    return@post
                }

                val body = call.receive<Map<String, String?>>()
                val goal = body["goal"]

                if (goal.isNullOrBlank()) {
                    call.respond(HttpStatusCode.BadRequest, "Chybějící nebo neplatný cíl")
                    return@post
                }

                val user = userRepository.getUserById(userId)
                if (user == null) {
                    call.respond(HttpStatusCode.NotFound, "Uživatel nenalezen")
                    return@post
                }

                val updated = user.copy(goal = goal)
                val success = userRepository.updateUser(userId, updated, null)

                if (success) {
                    call.respond(HttpStatusCode.OK, mapOf("success" to true))
                } else {
                    call.respond(HttpStatusCode.InternalServerError, "Nepodařilo se uložit cíl")
                }
            }

            patch("/me") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.getUserId()

                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, "Not authorized")
                    return@patch
                }

                val body = call.receive<Map<String, String?>>()
                val goal = body["goal"]

                if (goal == null || goal.isBlank()) {
                    call.respond(HttpStatusCode.BadRequest, "Chybějící nebo neplatný cíl")
                    return@patch
                }

                val user = userRepository.getUserById(userId)
                if (user == null) {
                    call.respond(HttpStatusCode.NotFound, "Uživatel nenalezen")
                    return@patch
                }

                val updated = user.copy(goal = goal)
                val success = userRepository.updateUser(userId, updated, null)

                if (success) {
                    call.respond(HttpStatusCode.OK, "Cíl uložen")
                } else {
                    call.respond(HttpStatusCode.InternalServerError, "Nepodařilo se uložit cíl")
                }
            }

            put("/{id}") {
                val id = call.parameters["id"]?.let { UUID.fromString(it) }
                val principal = call.principal<JWTPrincipal>()
                val currentUserId = principal?.getUserId()

                if (id == null || principal == null || currentUserId != id) {
                    call.respond(HttpStatusCode.Forbidden, "You can only update your own account")
                    return@put
                }

                val request = call.receive<UpdateUserRequest>()
                val validationErrors = request.validate()
                if (validationErrors.isNotEmpty()) {
                    call.respond(HttpStatusCode.BadRequest, validationErrors)
                    return@put
                }

                val existing = userRepository.getUserById(id)
                if (existing == null) {
                    call.respond(HttpStatusCode.NotFound, "User not found")
                    return@put
                }

                val updatedUser = request.toUpdatedUser(existing).copy(updatedAt = Instant.now().toString())
                val success = userRepository.updateUser(id, updatedUser, request.plainPassword)

                if (success) {
                    call.respond(HttpStatusCode.OK, "User updated")
                } else {
                    call.respond(HttpStatusCode.InternalServerError, "Failed to update user")
                }
            }

            delete("/{id}") {
                val principal = call.principal<JWTPrincipal>()
                if (!isAdmin(principal)) {
                    call.respond(HttpStatusCode.Forbidden, "Only admins can delete users")
                    return@delete
                }

                val id = call.parameters["id"]?.let { UUID.fromString(it) }
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                    return@delete
                }

                val success = userRepository.deleteUser(id)
                if (success) {
                    call.respond(HttpStatusCode.OK, "User deleted")
                } else {
                    call.respond(HttpStatusCode.NotFound, "User not found")
                }
            }
        }
    }
}
