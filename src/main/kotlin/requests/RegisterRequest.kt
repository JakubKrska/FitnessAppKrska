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
        if (name.isBlank()) errors.add("Jméno je vyžadováno!")
        if (!email.contains("@")) errors.add("Neplatný formát email adresy!")
        if (password.length < 6) errors.add("Heslo musí být dlouhé alespoň 6 znaků!")
        return errors
    }

}