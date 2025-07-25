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

            // Odebrání oblíbeného cviku
            delete("/by-exercise/{exerciseId}") {
                val exerciseId = call.parameters["exerciseId"]?.let(UUID::fromString)
                val userId = call.principal<JWTPrincipal>()?.getUserId()

                if (exerciseId == null || userId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid ID or unauthorized")
                    return@delete
                }

                val favorites = repo.getAllByUserId(userId)
                val favorite = favorites.find { it.exerciseId == exerciseId }

                if (favorite == null) {
                    call.respond(HttpStatusCode.NotFound, "Favorite not found")
                    return@delete
                }

                val success = repo.deleteFavorite(favorite.id)
                call.respond(if (success) HttpStatusCode.OK else HttpStatusCode.InternalServerError)
            }
        }
    }
}
