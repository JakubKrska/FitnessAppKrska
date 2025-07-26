package routes

import repository.WorkoutExercisesRepository
import repository.WorkoutPlanRepository
import authUtils.isOwnerOrAdmin
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import requests.WorkoutExerciseRequest
import responses.WorkoutExerciseResponse
import responses.toResponse
import java.util.*

fun Route.workoutExercisesRoutes(
    repo: WorkoutExercisesRepository,
    workoutPlanRepo: WorkoutPlanRepository
) {
    authenticate("authUtils-jwt") {
        route("/workout-exercises") {

            // GET: všechny cviky v plánu (vrací DTO)
            get("/{planId}") {
                val planId = call.parameters["planId"]?.let(UUID::fromString)
                if (planId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid plan ID")
                    return@get
                }

                val exercises = repo.getAllByPlanId(planId)
                call.respond<List<WorkoutExerciseResponse>>(exercises.map { it.toResponse() })

            }

            // GET: jeden konkrétní cvik v plánu (DTO)
            get("/exercise/{id}") {
                val id = call.parameters["id"]?.let(UUID::fromString)
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                    return@get
                }

                val ex = repo.getById(id)
                if (ex != null) {
                    call.respond(ex.toResponse())
                } else {
                    call.respond(HttpStatusCode.NotFound, "Exercise not found")
                }
            }

            // POST: přidání cviku do plánu
            post {
                val principal = call.principal<JWTPrincipal>()
                val request = call.receive<WorkoutExerciseRequest>()
                val errors = request.validate()

                if (errors.isNotEmpty()) {
                    call.respond(HttpStatusCode.BadRequest, errors)
                    return@post
                }

                val plan = workoutPlanRepo.getWorkoutPlanById(request.workoutPlanId)
                if (plan == null || plan.userId == null || !isOwnerOrAdmin(principal, plan.userId)) {
                    call.respond(HttpStatusCode.Forbidden, "You do not have permission to modify this plan")
                    return@post
                }

                val exercise = request.toModel()
                repo.addWorkoutExercise(exercise)
                call.respond(HttpStatusCode.Created, exercise.toResponse())
            }

            // PUT: úprava cviku v rámci plánu
            put("/{id}") {
                val id = call.parameters["id"]?.let(UUID::fromString)
                val principal = call.principal<JWTPrincipal>()

                if (id == null || principal == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid ID or unauthorized")
                    return@put
                }

                val existing = repo.getById(id)
                val plan = existing?.let { workoutPlanRepo.getWorkoutPlanById(it.workoutPlanId) }

                if (existing == null || plan == null || plan.userId == null || !isOwnerOrAdmin(
                        principal,
                        plan.userId
                    )
                ) {
                    call.respond(HttpStatusCode.Forbidden, "You cannot update this exercise")
                    return@put
                }

                val request = call.receive<WorkoutExerciseRequest>()
                val errors = request.validate()
                if (errors.isNotEmpty()) {
                    call.respond(HttpStatusCode.BadRequest, errors)
                    return@put
                }

                val updated = request.toModel().copy(id = id)
                val success = repo.updateWorkoutExercise(id, updated)
                call.respond(if (success) HttpStatusCode.OK else HttpStatusCode.InternalServerError)
            }

            // DELETE: odebrání cviku z plánu (bez kontroly vlastnictví)
            delete("/{id}") {
                val id = call.parameters["id"]?.let(UUID::fromString)

                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                    return@delete
                }

                val success = repo.deleteWorkoutExercise(id)
                call.respond(if (success) HttpStatusCode.OK else HttpStatusCode.InternalServerError)
            }
        }
    }
}
