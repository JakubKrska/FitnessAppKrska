package routes

import BadgeUnlockService
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import repository.ReminderRepository
import authUtils.getUserId
import io.ktor.http.*
import models.Reminder
import repository.WorkoutPlanRepository
import requests.ReminderRequest
import responses.toResponse
import java.time.LocalTime
import java.util.*

fun Route.reminderRoutes(
    reminderRepository: ReminderRepository,
    workoutPlanRepository: WorkoutPlanRepository,
    badgeUnlockService: BadgeUnlockService
) {
    authenticate("authUtils-jwt") {
        route("/reminders") {

            get {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                    ?: return@get call.respond(HttpStatusCode.Unauthorized)

                val reminders = reminderRepository.getRemindersByUser(userId)
                val allPlans = workoutPlanRepository.getAllVisiblePlansForUser(userId)

                val planNameMap = allPlans.associateBy({ it.id }, { it.name })

                val response = reminders.map {
                    it.toResponse(planName = it.workoutPlanId?.let { id -> planNameMap[id] })
                }

                call.respond(response)
            }

            post {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                    ?: return@post call.respond(HttpStatusCode.Unauthorized)

                try {
                    val request = call.receive<ReminderRequest>()
                    val reminder = Reminder(
                        id = UUID.randomUUID(),
                        userId = userId,
                        time = LocalTime.parse(request.time),
                        daysOfWeek = request.daysOfWeek,
                        workoutPlanId = request.workoutPlanId
                    )

                    reminderRepository.addReminder(reminder)

                    // ✅ použij instanci
                    val newlyUnlocked = badgeUnlockService.checkAndUnlockBadgesForUser(userId)

                    call.respond(
                        HttpStatusCode.Created,
                        mapOf(
                            "reminder" to reminder.toResponse(),
                            "newBadges" to newlyUnlocked.map { it.toResponse() }
                        )
                    )
                } catch (e: Exception) {
                    e.printStackTrace()
                    call.respond(HttpStatusCode.InternalServerError, "Chyba serveru při vytváření připomínky")
                }
            }

            put("/{id}") {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                    ?: return@put call.respond(HttpStatusCode.Unauthorized)

                val id = call.parameters["id"]?.let { UUID.fromString(it) }
                    ?: return@put call.respond(HttpStatusCode.BadRequest, "Neplatné ID")

                val request = call.receive<ReminderRequest>()

                val updated = Reminder(
                    id = id,
                    userId = userId,
                    time = LocalTime.parse(request.time),
                    daysOfWeek = request.daysOfWeek,
                    workoutPlanId = request.workoutPlanId
                )

                val success = reminderRepository.updateReminder(updated)

                if (success) {
                    call.respond(HttpStatusCode.OK, "Připomínka upravena")
                } else {
                    call.respond(HttpStatusCode.NotFound, "Připomínka nenalezena")
                }
            }

            delete("/{id}") {
                val id = call.parameters["id"]?.let { UUID.fromString(it) }
                    ?: return@delete call.respond(HttpStatusCode.BadRequest, "Neplatné ID")

                val success = reminderRepository.deleteReminder(id)
                if (success) {
                    call.respond(HttpStatusCode.OK, "Připomínka smazána")
                } else {
                    call.respond(HttpStatusCode.NotFound, "Připomínka nenalezena")
                }
            }
        }
    }
}
