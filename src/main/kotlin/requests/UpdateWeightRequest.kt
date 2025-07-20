package requests

import kotlinx.serialization.Serializable

@Serializable
data class UpdateWeightRequest(
    val weight: Double
) {
    fun validate(): List<String> {
        val errors = mutableListOf<String>()
        if (weight <= 0) {
            errors.add("Váha musí být větší než 0")
        }
        return errors
    }
}
