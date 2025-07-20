package routes

import repository.WorkoutHistoryRepository
import authUtils.getUserId
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import repository.WorkoutPlanRepository
import requests.WorkoutHistoryRequest
import responses.toResponse
import java.util.*

fun Route.workoutHistoryRoutes(
    workoutHistoryRepository: WorkoutHistoryRepository,
    workoutPlanRepository: WorkoutPlanRepository
) {
    authenticate("authUtils-jwt") {
        route("/workout-history") {

            get {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, "Unauthorized")
                    return@get
                }

                val entries = workoutHistoryRepository.getAllHistoryEntries()
                    .filter { it.userId == userId }

                val response = entries.map { entry ->
                    val workoutPlanName = entry.workoutPlanId?.let { id ->
                        val plan = workoutPlanRepository.getWorkoutPlanById(id)
                        println("Hledám plán pro id: $id, výsledek: ${plan?.name}")
                        plan?.name
                    }
                    entry.toResponse(workoutPlanName)
                }

                call.respond(response)
            }

            get("/{id}") {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                val id = call.parameters["id"]?.let(UUID::fromString)

                val entry = id?.let { workoutHistoryRepository.getWorkoutHistoryById(it) }

                if (entry == null || entry.userId != userId) {
                    call.respond(HttpStatusCode.Forbidden, "Access denied")
                    return@get
                }

                call.respond(entry)
            }

            post {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, "Unauthorized")
                    return@post
                }

                val request = call.receive<WorkoutHistoryRequest>()
                val validationErrors = request.validate()
                if (validationErrors.isNotEmpty()) {
                    call.respond(HttpStatusCode.BadRequest, validationErrors)
                    return@post
                }

                val newEntry = request.toModel(userId)
                workoutHistoryRepository.addWorkoutHistoryEntry(newEntry)
                call.respond(HttpStatusCode.Created, "Workout history entry added")
            }

            delete("/{id}") {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                val id = call.parameters["id"]?.let(UUID::fromString)

                val entry = id?.let { workoutHistoryRepository.getWorkoutHistoryById(it) }

                if (entry == null || entry.userId != userId) {
                    call.respond(HttpStatusCode.Forbidden, "Access denied")
                    return@delete
                }

                val success = workoutHistoryRepository.deleteWorkoutHistoryEntry(id)
                call.respond(if (success) HttpStatusCode.OK else HttpStatusCode.InternalServerError)
            }
        }
    }
}
