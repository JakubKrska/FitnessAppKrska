package com.example

import authUtils.JwtConfig
import com.example.routes.*
import configureSerialization
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import DatabaseFactory

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureCORS()
    configureSecurity()
    configureSerialization()
    DatabaseFactory.init()
    configureRouting()
}

// Povolení CORS pro vývoj (React frontend)
fun Application.configureCORS() {
    install(CORS) {
        anyHost()
        allowCredentials = true
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
    }
}

// JWT autentizace
fun Application.configureSecurity() {
    install(Authentication) {
        jwt("authUtils-jwt") {
            realm = "ktor-sample-app"
            verifier(JwtConfig.verifier())
            validate { credential ->
                credential.payload.getClaim("userId")?.asString()?.let {
                    JWTPrincipal(credential.payload)
                }
            }
        }
    }
}
