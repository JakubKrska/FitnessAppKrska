package com.example.routes

import repository.WorkoutPerformanceRepository
import repository.WorkoutHistoryRepository
import authUtils.getUserId
import authUtils.isOwnerOrAdmin
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import requests.WorkoutPerformanceRequest
import java.util.*

fun Route.workoutPerformanceRoutes(
    repo: WorkoutPerformanceRepository,
    historyRepo: WorkoutHistoryRepository
) {
    authenticate("authUtils-jwt") {
        route("/workout-performance") {

            // Získat výkony pro danou historii
            get("/{historyId}") {
                val principal = call.principal<JWTPrincipal>()
                val historyId = call.parameters["historyId"]?.let(UUID::fromString)

                val history = historyId?.let { historyRepo.getWorkoutHistoryById(it) }

                if (history == null || !isOwnerOrAdmin(principal, history.userId)) {
                    call.respond(HttpStatusCode.Forbidden, "Access denied")
                    return@get
                }

                val performances = repo.getAllByHistoryId(historyId)
                call.respond(performances)
            }

            // Přidání výkonu
            post {
                val principal = call.principal<JWTPrincipal>()
                val request = call.receive<WorkoutPerformanceRequest>()

                val validationErrors = request.validate()
                if (validationErrors.isNotEmpty()) {
                    call.respond(HttpStatusCode.BadRequest, validationErrors)
                    return@post
                }

                val history = historyRepo.getWorkoutHistoryById(request.workoutHistoryId)
                if (history == null) {
                    call.respond(HttpStatusCode.BadRequest, "Záznam historie neexistuje")
                    return@post
                }

                val model = request.toModel()
                repo.addPerformance(model)
                call.respond(HttpStatusCode.Created, "Workout performance added")
            }

            // Úprava výkonu
            put("/{id}") {
                val id = call.parameters["id"]?.let(UUID::fromString)
                val principal = call.principal<JWTPrincipal>()

                val existing = id?.let { repo.getById(it) }
                val history = existing?.let { historyRepo.getWorkoutHistoryById(it.workoutHistoryId) }

                if (id == null || existing == null || history == null || !isOwnerOrAdmin(principal, history.userId)) {
                    call.respond(HttpStatusCode.Forbidden, "Access denied")
                    return@put
                }

                val request = call.receive<WorkoutPerformanceRequest>()
                val validationErrors = request.validate()
                if (validationErrors.isNotEmpty()) {
                    call.respond(HttpStatusCode.BadRequest, validationErrors)
                    return@put
                }

                val model = request.toModel(id)
                val success = repo.updatePerformance(id, model)
                call.respond(if (success) HttpStatusCode.OK else HttpStatusCode.InternalServerError)
            }

            // Smazání výkonu
            delete("/{id}") {
                val id = call.parameters["id"]?.let(UUID::fromString)
                val principal = call.principal<JWTPrincipal>()

                val existing = id?.let { repo.getById(it) }
                val history = existing?.let { historyRepo.getWorkoutHistoryById(it.workoutHistoryId) }

                if (id == null || existing == null || history == null || !isOwnerOrAdmin(principal, history.userId)) {
                    call.respond(HttpStatusCode.Forbidden, "Access denied")
                    return@delete
                }

                val success = repo.deletePerformance(id)
                call.respond(if (success) HttpStatusCode.OK else HttpStatusCode.InternalServerError)
            }

            // Výkony uživatele pro daný cvik (např. pro grafy výkonu)
            get("/exercises/{exerciseId}/performance") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.getUserId()

                val exerciseId = call.parameters["exerciseId"]?.let(UUID::fromString)
                if (userId == null || exerciseId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Chybné ID nebo nepřihlášený uživatel")
                    return@get
                }

                val allPerformances = repo.getAllByExerciseId(exerciseId)
                val userPerformances = allPerformances.filter { perf ->
                    val history = historyRepo.getWorkoutHistoryById(perf.workoutHistoryId)
                    history?.userId == userId
                }

                call.respond(userPerformances)
            }
        }
    }
}
