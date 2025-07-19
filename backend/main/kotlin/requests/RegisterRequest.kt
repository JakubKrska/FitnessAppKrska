package requests

import kotlinx.serialization.Serializable

@Serializable
data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String
) {
    fun validate(): List<String> {
        val errors = mutableListOf<String>()
        if (name.isBlank()) errors.add("Name is required")
        if (!email.contains("@")) errors.add("Invalid email format")
        if (password.length < 6) errors.add("Password must be at least 6 characters")
        return errors
    }

}