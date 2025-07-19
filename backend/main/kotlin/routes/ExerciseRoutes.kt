package routes

import repository.ExerciseRepository
import authUtils.getRole
import authUtils.getUserId
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import requests.ExerciseRequest
import responses.toResponse
import java.util.*

fun Route.exerciseRoutes(exerciseRepository: ExerciseRepository) {

    authenticate("authUtils-jwt") {
        route("/exercises") {

            get {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.getUserId()

                val exercises = if (userId != null) {
                    exerciseRepository.getVisibleExercisesForUser(userId)
                } else {
                    exerciseRepository.getPublicExercises()
                }

                call.respond(exercises.map { it.toResponse() })
            }

            get("/{id}") {
                val id = call.parameters["id"]?.let { UUID.fromString(it) }
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                    return@get
                }

                val exercise = exerciseRepository.getExerciseById(id)
                if (exercise != null) {
                    call.respond(exercise.toResponse())
                } else {
                    call.respond(HttpStatusCode.NotFound, "Exercise not found")
                }
            }

            authenticate("authUtils-jwt") {

                post {
                    val principal = call.principal<JWTPrincipal>()
                    val userId = principal?.getUserId()

                    if (userId == null) {
                        call.respond(HttpStatusCode.Unauthorized)
                        return@post
                    }

                    val request = call.receive<ExerciseRequest>()
                    val errors = request.validate()
                    if (errors.isNotEmpty()) {
                        call.respond(HttpStatusCode.BadRequest, errors)
                        return@post
                    }

                    val exercise = request.toModel(userId)
                    exerciseRepository.addExercise(exercise)
                    call.respond(HttpStatusCode.Created, "Exercise added")
                }

                put("/{id}") {
                    val id = call.parameters["id"]?.let { UUID.fromString(it) }
                    val principal = call.principal<JWTPrincipal>()
                    val userId = principal?.getUserId()
                    val role = principal?.getRole()

                    if (id == null || userId == null || principal == null) {
                        call.respond(HttpStatusCode.BadRequest, "Invalid ID or unauthorized")
                        return@put
                    }

                    val existing = exerciseRepository.getExerciseById(id)
                    if (existing == null) {
                        call.respond(HttpStatusCode.NotFound, "Exercise not found")
                        return@put
                    }

                    if (existing.authorId != userId && role != "ADMIN") {
                        call.respond(HttpStatusCode.Forbidden, "Not allowed to update this exercise")
                        return@put
                    }

                    val request = call.receive<ExerciseRequest>()
                    val errors = request.validate()
                    if (errors.isNotEmpty()) {
                        call.respond(HttpStatusCode.BadRequest, errors)
                        return@put
                    }

                    val updated = request.toModel(existing.authorId).copy(id = existing.id)
                    val success = exerciseRepository.updateExercise(id, updated)

                    if (success) {
                        call.respond(HttpStatusCode.OK, "Exercise updated")
                    } else {
                        call.respond(HttpStatusCode.InternalServerError, "Failed to update exercise")
                    }
                }

                delete("/{id}") {
                    val id = call.parameters["id"]?.let { UUID.fromString(it) }
                    val principal = call.principal<JWTPrincipal>()
                    val userId = principal?.getUserId()
                    val role = principal?.getRole()

                    if (id == null || userId == null) {
                        call.respond(HttpStatusCode.BadRequest, "Invalid ID or unauthorized")
                        return@delete
                    }

                    val existing = exerciseRepository.getExerciseById(id)
                    if (existing == null) {
                        call.respond(HttpStatusCode.NotFound, "Exercise not found")
                        return@delete
                    }

                    if (existing.authorId != userId && role != "ADMIN") {
                        call.respond(HttpStatusCode.Forbidden, "Not allowed to delete this exercise")
                        return@delete
                    }

                    val deleted = exerciseRepository.deleteExercise(id)
                    call.respond(if (deleted) HttpStatusCode.OK else HttpStatusCode.InternalServerError)
                }
            }
            get("/exercises/{id}") {
                val id = call.parameters["id"]?.let { UUID.fromString(it) }
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                    return@get
                }

                val exercise = exerciseRepository.getExerciseById(id)
                if (exercise != null) {
                    call.respond(exercise.toResponse())
                } else {
                    call.respond(HttpStatusCode.NotFound, "Exercise not found")
                }
            }
        }
    }
}

