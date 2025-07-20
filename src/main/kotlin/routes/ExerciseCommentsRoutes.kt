package com.example.routes

import repository.ExerciseCommentsRepository
import authUtils.getUserId
import authUtils.isAdmin
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import requests.ExerciseCommentRequest
import requests.toModel
import java.util.*

fun Route.exerciseCommentsRoutes(repo: ExerciseCommentsRepository) {

    authenticate("authUtils-jwt") {
        route("/comments") {

            // Získání všech komentářů ke cviku
            get("/{exerciseId}") {
                val exerciseId = call.parameters["exerciseId"]?.let(UUID::fromString)
                if (exerciseId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid exercise ID")
                    return@get
                }

                val comments = repo.getAllByExerciseId(exerciseId)
                call.respond(comments)
            }

            // Přidání komentáře
            post {
                val userId = call.principal<JWTPrincipal>()?.getUserId()
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized)
                    return@post
                }

                val request = call.receive<ExerciseCommentRequest>()
                val validationErrors = request.validate()
                if (validationErrors.isNotEmpty()) {
                    call.respond(HttpStatusCode.BadRequest, validationErrors)
                    return@post
                }

                val comment = request.toModel(userId)
                repo.addComment(comment)
                call.respond(HttpStatusCode.Created, "Comment added")
            }

            // Úprava komentáře (autor nebo admin)
            put("/{id}") {
                val id = call.parameters["id"]?.let(UUID::fromString)
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.getUserId()

                if (id == null || principal == null || userId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid request")
                    return@put
                }

                val existing = repo.getCommentById(id)
                if (existing == null) {
                    call.respond(HttpStatusCode.NotFound, "Comment not found")
                    return@put
                }

                if (existing.userId != userId && !isAdmin(principal)) {
                    call.respond(HttpStatusCode.Forbidden, "Not allowed to edit this comment")
                    return@put
                }

                val request = call.receive<ExerciseCommentRequest>()
                val validationErrors = request.validate()
                if (validationErrors.isNotEmpty()) {
                    call.respond(HttpStatusCode.BadRequest, validationErrors)
                    return@put
                }

                val success = repo.updateComment(id, request.commentText)

                call.respond(if (success) HttpStatusCode.OK else HttpStatusCode.InternalServerError)
            }

            // Smazání komentáře (autor nebo admin)
            delete("/{id}") {
                val id = call.parameters["id"]?.let(UUID::fromString)
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.getUserId()

                if (id == null || principal == null || userId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid request")
                    return@delete
                }

                val existing = repo.getCommentById(id)
                if (existing == null) {
                    call.respond(HttpStatusCode.NotFound, "Comment not found")
                    return@delete
                }

                if (existing.userId != userId && !isAdmin(principal)) {
                    call.respond(HttpStatusCode.Forbidden, "Not allowed to delete this comment")
                    return@delete
                }

                val success = repo.deleteComment(id)
                call.respond(if (success) HttpStatusCode.OK else HttpStatusCode.InternalServerError)
            }
        }
    }
}
