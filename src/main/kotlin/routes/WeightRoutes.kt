package routes

import authUtils.getUserId
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import repository.WeightLogRepository
import requests.UpdateWeightRequest
import responses.toResponse
import java.util.*

@Serializable
data class WeightUpdateRequest(val weight: Double) {
    fun validate(): List<String> {
        val errors = mutableListOf<String>()
        if (weight <= 0) errors.add("Weight must be greater than 0")
        return errors
    }
}

fun Route.weightRoutes(weightRepository: WeightLogRepository) {

    authenticate("authUtils-jwt") {
        route("/weight") {

            // Získání všech váhových záznamů uživatele
            get {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, "Not authorized")
                    return@get
                }

                val weights = weightRepository.getForUser(userId).map { it.toResponse() }
                call.respond(weights)
            }

            // Přidání nového záznamu o váze
            post {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                    ?: return@post call.respond(HttpStatusCode.Unauthorized)

                val request = call.receive<UpdateWeightRequest>()
                val validationErrors = request.validate()
                if (validationErrors.isNotEmpty()) {
                    call.respond(HttpStatusCode.BadRequest, validationErrors)
                    return@post
                }

                val entry = weightRepository.addEntry(userId, request.weight)
                call.respond(HttpStatusCode.Created, entry)
            }
        }
    }
}
