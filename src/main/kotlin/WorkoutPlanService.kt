package services

import models.WorkoutPlan
import repository.WorkoutPlanRepository
import java.util.*

class WorkoutPlanService(
    private val workoutPlanRepository: WorkoutPlanRepository
) {
    fun assignDefaultPlanToUser(userId: UUID, goal: String): WorkoutPlan {
        val defaultPlan = workoutPlanRepository.getDefaultPlanByGoal(goal)
            ?: throw Exception("Výchozí plán pro cíl '$goal' nebyl nalezen")

        val personalized = defaultPlan.copy(
            id = UUID.randomUUID(),
            userId = userId,
            isDefault = false
        )

        workoutPlanRepository.addWorkoutPlan(personalized)
        return personalized
    }
}
