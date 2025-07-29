package com.example

import authUtils.JwtConfig
import configureSerialization
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.plugins.cors.routing.*
import DatabaseFactory
import configureRouting

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureCORS()
    configureSecurity()
    configureSerialization()
    DatabaseFactory.init(environment.config)
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
        allowMethod(HttpMethod.Options)
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
