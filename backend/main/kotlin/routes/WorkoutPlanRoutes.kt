package com.example.routes

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
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.getUserId()

                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, "Unauthorized")
                    return@get
                }

                val plans = workoutPlanRepository.getAllVisiblePlansForUser(userId)
                call.respond(plans)
            }

            get("/{id}") {
                val id = call.parameters["id"]?.let { UUID.fromString(it) }
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                    return@get
                }

                val plan = workoutPlanRepository.getWorkoutPlanById(id)
                if (plan != null) {
                    call.respond(plan)
                } else {
                    call.respond(HttpStatusCode.NotFound, "Workout plan not found")
                }
            }

            post {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.getUserId()
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, "Unauthorized")
                    return@post
                }

                val request = call.receive<WorkoutPlanRequest>()
                val errors = request.validate()
                if (errors.isNotEmpty()) {
                    call.respond(HttpStatusCode.BadRequest, errors)
                    return@post
                }

                val plan = request.toModel(userId)
                workoutPlanRepository.addWorkoutPlan(plan)
                call.respond(HttpStatusCode.Created, "Workout plan created")
            }

            put("/{id}") {
                val id = call.parameters["id"]?.let(UUID::fromString)
                val principal = call.principal<JWTPrincipal>()

                if (id == null || principal == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid request or token")
                    return@put
                }

                val existing = workoutPlanRepository.getWorkoutPlanById(id)
                if (existing == null) {
                    call.respond(HttpStatusCode.NotFound, "Workout plan not found")
                    return@put
                }

                if (existing.userId == null || !isOwnerOrAdmin(principal, existing.userId)) {
                    call.respond(HttpStatusCode.Forbidden, "You are not allowed to edit this workout plan")
                    return@put
                }

                val request = call.receive<WorkoutPlanRequest>()
                val errors = request.validate()
                if (errors.isNotEmpty()) {
                    call.respond(HttpStatusCode.BadRequest, errors)
                    return@put
                }

                val updated = request.toModel(existing.userId).copy(id = existing.id)
                val success = workoutPlanRepository.updateWorkoutPlan(id, updated)

                call.respond(
                    if (success) HttpStatusCode.OK
                    else HttpStatusCode.InternalServerError
                )
            }

            delete("/{id}") {
                val id = call.parameters["id"]?.let(UUID::fromString)
                val principal = call.principal<JWTPrincipal>()

                if (id == null || principal == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid request or token")
                    return@delete
                }

                val existing = workoutPlanRepository.getWorkoutPlanById(id)
                if (existing == null) {
                    call.respond(HttpStatusCode.NotFound, "Workout plan not found")
                    return@delete
                }

                if (existing.userId == null || !isOwnerOrAdmin(principal, existing.userId)) {
                    call.respond(HttpStatusCode.Forbidden, "You are not allowed to delete this workout plan")
                    return@delete
                }

                val success = workoutPlanRepository.deleteWorkoutPlan(id)
                call.respond(
                    if (success) HttpStatusCode.OK
                    else HttpStatusCode.InternalServerError
                )
            }
        }
    }
}
