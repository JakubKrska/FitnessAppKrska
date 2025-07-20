package authUtils

import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import java.util.*

fun JWTPrincipal.getUserId(): UUID? =
    this.payload.getClaim("userId")?.asString()?.let(UUID::fromString)

fun JWTPrincipal.getRole(): String =
    this.payload.getClaim("role")?.asString() ?: "USER"

fun isAdmin(principal: JWTPrincipal?): Boolean =
    principal?.getRole() == "ADMIN"

fun isOwnerOrAdmin(principal: JWTPrincipal?, ownerId: UUID?): Boolean {
    val userId = principal?.getUserId()
    val role = principal?.getRole()
    return userId == ownerId || role == "ADMIN"
}

fun ApplicationCall.getUserIdFromToken(): UUID {
    val principal = this.principal<JWTPrincipal>()
        ?: throw Exception("Chybí nebo neplatný token")

    val userIdString = principal.payload.getClaim("userId")?.asString()
        ?: throw Exception("Uživatelské ID nebylo nalezeno v tokenu")

    return UUID.fromString(userIdString)
}
