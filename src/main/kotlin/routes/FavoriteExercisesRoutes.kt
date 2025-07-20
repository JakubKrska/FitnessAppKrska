package routes

import repository.FavoriteExercisesRepository
import authUtils.getUserId
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import requests.FavoriteExerciseRequest
import requests.toModel
import java.util.*

fun Route.favoriteExercisesRoutes(repo: FavoriteExercisesRepository) {

    authenticate("authUtils-jwt") {
        route("/favorites") {

            // Získání oblíbených cviků uživatele
            get {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized)
                    return@get
                }

                val favorites = repo.getAllByUserId(userId)
                call.respond(favorites)
            }

            // Přidání oblíbeného cviku
            post {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized)
                    return@post
                }

                val request = call.receive<FavoriteExerciseRequest>()
                val favorite = request.toModel(userId)
                repo.addFavorite(favorite)
                call.respond(HttpStatusCode.Created, "Added to favorites")
            }

            // Smazání oblíbeného cviku
            delete("/{id}") {
                val id = call.parameters["id"]?.let(UUID::fromString)
                val userId = call.principal<JWTPrincipal>()?.getUserId()

                if (id == null || userId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid ID or unauthorized")
                    return@delete
                }

                val userFavorites = repo.getAllByUserId(userId)
                if (userFavorites.none { it.id == id }) {
                    call.respond(HttpStatusCode.Forbidden, "You don't have permission to delete this favorite")
                    return@delete
                }

                val success = repo.deleteFavorite(id)
                call.respond(if (success) HttpStatusCode.OK else HttpStatusCode.InternalServerError)
            }
        }
    }
}
