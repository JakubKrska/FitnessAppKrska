package routes

import repository.WorkoutPlanRepository
import authUtils.getUserId
import authUtils.isOwnerOrAdmin
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import requests.WorkoutPlanRequest
import java.util.*


fun Route.workoutPlanRoutes(workoutPlanRepository: WorkoutPlanRepository) {
    authenticate("authUtils-jwt") {
        route("/workout-plans") {

            get {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized)
                    return@get
                }

                val plans = workoutPlanRepository.getAllVisiblePlansForUser(userId)
                call.respond(plans)
            }

            get("/{id}") {
                val id = call.parameters["id"]?.let { runCatching { UUID.fromString(it) }.getOrNull() }
                if (id == null) return@get call.respond(HttpStatusCode.BadRequest, "Invalid ID")

                val plan = workoutPlanRepository.getWorkoutPlanById(id)
                if (plan != null) call.respond(plan)
                else call.respond(HttpStatusCode.NotFound, "Workout plan not found")
            }

            post {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized)
                    return@post
                }

                val request = call.receive<WorkoutPlanRequest>()
                val errors = request.validate()
                if (errors.isNotEmpty()) return@post call.respond(HttpStatusCode.BadRequest, errors)

                val newPlan = request.toModel(userId)
                workoutPlanRepository.addWorkoutPlan(newPlan)
                call.respond(HttpStatusCode.Created, "Workout plan created")
            }

            put("/{id}") {
                val id = call.parameters["id"]?.let { runCatching { UUID.fromString(it) }.getOrNull() }
                val principal = call.principal<JWTPrincipal>()

                if (id == null || principal == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid request or token")
                    return@put
                }

                val existing = workoutPlanRepository.getWorkoutPlanById(id)
                if (existing == null) return@put call.respond(HttpStatusCode.NotFound)

                if (existing.userId == null || !isOwnerOrAdmin(principal, existing.userId)) {
                    return@put call.respond(HttpStatusCode.Forbidden, "Not allowed to edit this workout plan")
                }

                val request = call.receive<WorkoutPlanRequest>()
                val errors = request.validate()
                if (errors.isNotEmpty()) return@put call.respond(HttpStatusCode.BadRequest, errors)

                val updated = request.toModel(existing.userId).copy(id = existing.id)
                val success = workoutPlanRepository.updateWorkoutPlan(id, updated)

                call.respond(if (success) HttpStatusCode.OK else HttpStatusCode.InternalServerError)
            }

            delete("/{id}") {

                val id = call.parameters["id"]?.let { runCatching { UUID.fromString(it) }.getOrNull() }
                val principal = call.principal<JWTPrincipal>()

                if (id == null || principal == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid request or token")
                    return@delete
                }

                val existing = workoutPlanRepository.getWorkoutPlanById(id)
                if (existing == null) return@delete call.respond(HttpStatusCode.NotFound)

                if (!isOwnerOrAdmin(principal, existing.userId ?: return@delete call.respond(HttpStatusCode.Forbidden))) {
                    return@delete call.respond(HttpStatusCode.Forbidden, "Not allowed to delete this workout plan")
                }

                val success = workoutPlanRepository.deleteWorkoutPlan(id)
                call.respond(if (success) HttpStatusCode.OK else HttpStatusCode.InternalServerError)
            }
        }
    }
}
