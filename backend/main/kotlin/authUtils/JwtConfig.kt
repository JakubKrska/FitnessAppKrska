package authUtils

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.interfaces.JWTVerifier

import java.util.*

object JwtConfig {
    private const val secret = "supersecretkey"
    private const val issuer = "ktor-server"
    private const val audience = "ktor-audience"
    private const val validityInMs = 36_000_00 * 10 // 10 hodin
    private val algorithm = Algorithm.HMAC256(secret)


    fun generateToken(userId: String, role: String): String {
        return JWT.create()
            .withIssuer(issuer)
            .withAudience(audience)
            .withClaim("userId", userId)
            .withClaim("role", role)
            .withExpiresAt(Date(System.currentTimeMillis() + validityInMs))
            .sign(algorithm)
    }

    fun verifier(): JWTVerifier = JWT.require(algorithm)
        .withIssuer(issuer)
        .withAudience(audience)
        .build()
}


