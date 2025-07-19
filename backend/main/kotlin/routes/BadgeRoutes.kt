package routes

import authUtils.getUserId
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import models.UserBadge
import repository.BadgeRepository
import repository.UserBadgeRepository
import java.time.Instant
import java.util.*

fun Route.badgeRoutes(
    badgeRepository: BadgeRepository,
    userBadgeRepository: UserBadgeRepository
) {
    authenticate("authUtils-jwt") {
        route("/badges") {

            get {
                call.respond(badgeRepository.getAllBadges())
            }

            get("/me") {
                val principal = call.principal<JWTPrincipal>() ?: return@get call.respond(HttpStatusCode.Unauthorized)
                val userId = principal.getUserId() ?: return@get call.respond(HttpStatusCode.BadRequest)

                val userBadges = userBadgeRepository.getBadgesForUser(userId)
                val allBadges = badgeRepository.getAllBadges().associateBy { it.id }

                val response = userBadges.mapNotNull { ub ->
                    allBadges[ub.badgeId]?.let { badge ->
                        BadgeWithUnlock(
                            id = badge.id,
                            name = badge.name,
                            description = badge.description,
                            icon = badge.icon,
                            unlockedAt = ub.unlockedAt.toString()
                        )
                    }
                }

                call.respond(response)
            }

            post("/unlock") {
                val principal = call.principal<JWTPrincipal>() ?: return@post call.respond(HttpStatusCode.Unauthorized)
                val userId = principal.getUserId() ?: return@post call.respond(HttpStatusCode.BadRequest)

                val badgeIdParam = call.request.queryParameters["badgeId"]
                val badgeId = try {
                    UUID.fromString(badgeIdParam)
                } catch (e: Exception) {
                    return@post call.respond(HttpStatusCode.BadRequest, "Neplatné ID odznaku")
                }

                val badge = badgeRepository.getBadgeById(badgeId)
                    ?: return@post call.respond(HttpStatusCode.NotFound, "Odznak nenalezen")

                val userBadge = UserBadge(
                    id = UUID.randomUUID(),
                    userId = userId,
                    badgeId = badgeId,
                    unlockedAt = Instant.now()
                )

                val success = userBadgeRepository.addUserBadge(userBadge)

                if (success) {
                    call.respond(HttpStatusCode.Created, "Odznak odemčen!")
                } else {
                    call.respond(HttpStatusCode.OK, "Odznak už byl odemčen.")
                }
            }
        }
    }
}

@Serializable
data class BadgeWithUnlock(
    @Contextual val id: UUID,
    val name: String,
    val description: String?,
    val icon: String?,
    val unlockedAt: String
)
