package com.example


import BadgeUnlockService
import authUtils.getUserId
import authUtils.getUserIdFromToken
import routes.*
import com.example.routes.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import models.*
import org.mindrot.jbcrypt.BCrypt
import repository.*
import requests.ChangePasswordRequest
import requests.GoalUpdateRequest
import requests.UpdateWeightRequest
import responses.toResponse
import services.WorkoutPlanService
import java.util.UUID


fun Application.configureRouting() {
    val userRepository = UserRepository()
    val exerciseRepository = ExerciseRepository()
    val workoutPlanRepository = WorkoutPlanRepository()
    val workoutHistoryRepository = WorkoutHistoryRepository()
    val exerciseCommentsRepository = ExerciseCommentsRepository()
    val favoriteExercisesRepository = FavoriteExercisesRepository()
    val workoutExercisesRepository = WorkoutExercisesRepository()
    val workoutPerformanceRepository = WorkoutPerformanceRepository()
    val reminderRepository = ReminderRepository()
    val badgeRepository = BadgeRepository()
    val userBadgeRepository = UserBadgeRepository()
    val badgeUnlockService = BadgeUnlockService(
        badgeRepository = badgeRepository,
        userBadgeRepository = userBadgeRepository,
        workoutHistoryRepository = workoutHistoryRepository,
        userRepository = userRepository,
        workoutPlanRepository = workoutPlanRepository,
        reminderRepository = reminderRepository
    )
    val planService = WorkoutPlanService(workoutPlanRepository)


    routing {
        userRoutes(userRepository)
        exerciseRoutes(exerciseRepository)
        workoutPlanRoutes(workoutPlanRepository)
        workoutHistoryRoutes(workoutHistoryRepository, workoutPlanRepository)
        workoutExercisesRoutes(workoutExercisesRepository, workoutPlanRepository)
        workoutPerformanceRoutes(workoutPerformanceRepository, workoutHistoryRepository)
        exerciseCommentsRoutes(exerciseCommentsRepository)
        favoriteExercisesRoutes(favoriteExercisesRepository)
        weightRoutes(WeightLogRepository())
        reminderRoutes(reminderRepository, workoutPlanRepository)
        badgeRoutes(badgeRepository, userBadgeRepository)



        get("/users") {
            call.respond(userRepository.getAllUsers())
        }
        get("/users/me") {
            val principal = call.principal<JWTPrincipal>()
            val userId = principal?.getUserId()

            if (userId != null) {
                val user = userRepository.getUserById(userId)

                if (user != null) {
                    call.respond(user.toResponse())
                } else {
                    call.respond(HttpStatusCode.NotFound, "Uživatel nenalezen")
                }
            } else {
                call.respond(HttpStatusCode.Unauthorized, "Chybí nebo neplatný token")
            }
        }
        put("/users/me") {
            val principal = call.principal<JWTPrincipal>() ?: return@put call.respond(HttpStatusCode.Unauthorized)
            val userId = principal.getUserId() ?: return@put call.respond(HttpStatusCode.BadRequest)

            val updatedData = call.receive<User>()
            val success = userRepository.updateUser(userId, updatedData, updatedData.passwordHash) // Pokud je potřeba

            if (success) {
                val user = userRepository.getUserById(userId)
                if (user != null) call.respond(user.toResponse())
                else call.respond(HttpStatusCode.NotFound)
            } else {
                call.respond(HttpStatusCode.InternalServerError, "Nepodařilo se upravit profil")
            }
        }

        post("/users/change-password") {
            val principal = call.principal<JWTPrincipal>() ?: return@post call.respond(HttpStatusCode.Unauthorized)
            val userId = principal.getUserId() ?: return@post call.respond(HttpStatusCode.BadRequest)

            val request = call.receive<ChangePasswordRequest>()

            val user = userRepository.getUserById(userId)
            if (user == null) return@post call.respond(HttpStatusCode.NotFound)

            if (!BCrypt.checkpw(request.oldPassword, user.passwordHash)) {
                return@post call.respond(HttpStatusCode.BadRequest, "Původní heslo je neplatné.")
            }

            val hashed = BCrypt.hashpw(request.newPassword, BCrypt.gensalt())
            val success = userRepository.updateUser(userId, user.copy(passwordHash = hashed), null)

            if (success) {
                call.respond(HttpStatusCode.OK, "Heslo úspěšně změněno.")
            } else {
                call.respond(HttpStatusCode.InternalServerError, "Nepodařilo se změnit heslo.")
            }
        }
        authenticate("authUtils-jwt") {
            post("/users/me/goal") {
                val userId = call.getUserIdFromToken()
                val goalRequest = call.receive<GoalUpdateRequest>()

                val updated = userRepository.updateUserGoal(userId, goalRequest.goal)
                if (!updated) return@post call.respond(HttpStatusCode.NotFound, "Uživatel nenalezen")

                val assignedPlan = planService.assignDefaultPlanToUser(userId, goalRequest.goal)

                call.respond(
                    HttpStatusCode.OK, mapOf(
                        "message" to "Cíl nastaven",
                        "assignedPlan" to assignedPlan.toResponse()
                    )
                )
            }
            get("/users/me/history") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.getUserId()

                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, "Neplatný token")
                    return@get
                }

                val historyEntries = workoutHistoryRepository.getAllHistoryEntries()
                    .filter { it.userId == userId }

                val plansMap = workoutPlanRepository.getAllWorkoutPlans()
                    .associateBy { it.id }

                val response = historyEntries.map { entry ->
                    val planName = entry.workoutPlanId?.let { plansMap[it]?.name }
                    entry.toResponse(planName)
                }

                call.respond(response)
            }
        }
        route("/users/me") {
            get("/badges") {
                val principal = call.principal<JWTPrincipal>() ?: return@get call.respond(HttpStatusCode.Unauthorized)
                val userId = principal.getUserId() ?: return@get call.respond(HttpStatusCode.BadRequest)

                val userBadges = userBadgeRepository.getBadgesForUser(userId)
                val allBadges = badgeRepository.getAllBadges().associateBy { it.id }

                val response = userBadges.mapNotNull { ub ->
                    allBadges[ub.badgeId]?.let { badge ->
                        mapOf(
                            "id" to badge.id,
                            "name" to badge.name,
                            "description" to badge.description,
                            "icon" to badge.icon,
                            "unlockedAt" to ub.unlockedAt
                        )
                    }
                }

                call.respond(response)
            }
            post("/badges/unlock") {
                val principal = call.principal<JWTPrincipal>() ?: return@post call.respond(HttpStatusCode.Unauthorized)
                val userId = principal.getUserId() ?: return@post call.respond(HttpStatusCode.BadRequest)

                val badgeIdParam = call.request.queryParameters["badgeId"]
                val badgeId = try {
                    UUID.fromString(badgeIdParam)
                } catch (e: Exception) {
                    return@post call.respond(HttpStatusCode.BadRequest, "Neplatné ID odznaku")
                }

                val badge = badgeRepository.getBadgeById(badgeId)
                    ?: return@post call.respond(HttpStatusCode.NotFound, "Odznak nenalezen")

                val userBadge = UserBadge(
                    id = UUID.randomUUID(),
                    userId = userId,
                    badgeId = badgeId,
                    unlockedAt = java.time.Instant.now()
                )

                val success = userBadgeRepository.addUserBadge(userBadge)

                if (success) {
                    call.respond(HttpStatusCode.Created, "Odznak odemčen!")
                } else {
                    call.respond(HttpStatusCode.OK, "Odznak již byl odemčen.")
                }
            }
        }


        get("/users/{id}") {
            val id = call.parameters["id"]?.let { UUID.fromString(it) }
            if (id != null) {
                val user = userRepository.getUserById(id)
                if (user != null) {
                    call.respond(user)
                } else {
                    call.respond(HttpStatusCode.NotFound, "models.User not found")
                }
            } else {
                call.respond(HttpStatusCode.BadRequest, "Invalid ID format")
            }
        }

        post("/users") {
            val user = call.receive<User>()
            userRepository.addUser(user)
            call.respond(HttpStatusCode.Created, "models.User added")
        }

        authenticate("authUtils-jwt") {
            get("/protected") {
                call.respondText("You are authenticated!")
            }
            put("/users/me/weight") {
                val principal = call.principal<JWTPrincipal>() ?: return@put call.respond(HttpStatusCode.Unauthorized)
                val userId = principal.getUserId() ?: return@put call.respond(HttpStatusCode.BadRequest)

                val request = call.receive<UpdateWeightRequest>()
                if (request.validate().isNotEmpty()) {
                    return@put call.respond(HttpStatusCode.BadRequest, "Neplatná váha")
                }

                val user = userRepository.getUserById(userId)
                    ?: return@put call.respond(HttpStatusCode.NotFound, "Uživatel nenalezen")

                val updated = userRepository.updateUser(userId, user.copy(weight = request.weight), null)
                if (updated) call.respond(HttpStatusCode.OK)
                else call.respond(HttpStatusCode.InternalServerError)
            }

            get("/exercises/{id}") {
                val id = call.parameters["id"]?.let { UUID.fromString(it) }
                id?.let {
                    exerciseRepository.getExerciseById(it)?.let { exercise ->
                        call.respond(exercise)
                    } ?: call.respond(HttpStatusCode.NotFound, "models.Exercise not found")
                } ?: call.respond(HttpStatusCode.BadRequest, "Invalid ID format")
            }

            post("/exercises") {
                val exercise = call.receive<Exercise>()
                exerciseRepository.addExercise(exercise)
                call.respond(HttpStatusCode.Created, "models.Exercise added")
            }

//            get("/workout-plans") {
//                call.respond(workoutPlanRepository.getAllWorkoutPlans())
//            }
//
//            post("/workout-plans") {
//                val plan = call.receive<WorkoutPlan>()
//                workoutPlanRepository.addWorkoutPlan(plan)
//                call.respond(HttpStatusCode.Created, "Workout plan added")
//            }
            post("/workout-plans/{sourcePlanId}/copy") {
                val principal = call.principal<JWTPrincipal>() ?: return@post call.respond(HttpStatusCode.Unauthorized)
                val userId = principal.getUserId() ?: return@post call.respond(HttpStatusCode.BadRequest)
                val sourcePlanId = call.parameters["sourcePlanId"]?.let { UUID.fromString(it) }
                    ?: return@post call.respond(HttpStatusCode.BadRequest, "Chybějící nebo neplatné ID plánu")

                val newPlanName = call.request.queryParameters["name"] ?: "Můj plán"
                val newPlanDescription = call.request.queryParameters["description"] ?: "Zkopírovaný plán"

                // Získání původního plánu
                val sourcePlan = workoutPlanRepository.getWorkoutPlanById(sourcePlanId)
                    ?: return@post call.respond(HttpStatusCode.NotFound, "Plán nenalezen")

                //  Vytvoření nového plánu pro uživatele
                val newPlan = WorkoutPlan(
                    id = UUID.randomUUID(),
                    userId = userId,
                    name = newPlanName,
                    description = newPlanDescription,
                    experienceLevel = sourcePlan.experienceLevel,
                    goal = sourcePlan.goal,
                    isDefault = false
                )
                workoutPlanRepository.addWorkoutPlan(newPlan)

                //  Kopírování cviků
                workoutExercisesRepository.copyExercisesFromPlanToPlan(sourcePlanId, newPlan.id)

                call.respond(HttpStatusCode.Created, mapOf("planId" to newPlan.id))
            }

            get("/workout-history") {
                call.respond(workoutHistoryRepository.getAllHistoryEntries())
            }

            post("/workout-history") {
                val principal = call.principal<JWTPrincipal>() ?: return@post call.respond(HttpStatusCode.Unauthorized)
                val userId = principal.getUserId() ?: return@post call.respond(HttpStatusCode.BadRequest)

                val entry = call.receive<WorkoutHistoryEntry>()

                // Uložení tréninku
                workoutHistoryRepository.addWorkoutHistoryEntry(entry)

                // Získání odznaků, které se tímto tréninkem mohly odemknout
                val newlyUnlocked = badgeUnlockService.checkAndUnlockBadgesForUser(entry.userId)

                call.respond(
                    HttpStatusCode.Created,
                    mapOf(
                        "message" to "Workout entry added",
                        "newBadges" to newlyUnlocked.map { it.toResponse() }
                    )
                )
            }

            authenticate("authUtils-jwt") {
                route("/admin") {
                    get {
                        val principal = call.principal<JWTPrincipal>()
                        val role = principal?.getClaim("role", String::class) ?: "USER"

                        if (role == "ADMIN") {
                            call.respond(HttpStatusCode.OK, "Welcome, admin!")
                        } else {
                            call.respond(HttpStatusCode.Forbidden, "Access denied")
                        }
                    }
                }
            }
        }
    }
}