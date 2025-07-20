import models.Badge
import models.UserBadge
import repository.BadgeRepository
import repository.UserBadgeRepository
import repository.UserRepository
import repository.WorkoutHistoryRepository
import repository.WorkoutPlanRepository
import repository.ReminderRepository
import java.time.Instant
import java.util.*

class BadgeUnlockService(
    private val badgeRepository: BadgeRepository,
    private val userBadgeRepository: UserBadgeRepository,
    private val workoutHistoryRepository: WorkoutHistoryRepository,
    private val userRepository: UserRepository,
    private val workoutPlanRepository: WorkoutPlanRepository,
    private val reminderRepository: ReminderRepository
) {

    fun checkAndUnlockBadgesForUser(userId: UUID): List<Badge> {
        val allBadges = badgeRepository.getAllBadges()
        val userBadges = userBadgeRepository.getBadgesForUser(userId).map { it.badgeId }.toSet()

        val newlyUnlocked = mutableListOf<Badge>()

        for (badge in allBadges) {
            if (badge.id !in userBadges && meetsCondition(userId, badge)) {
                val unlocked = UserBadge(
                    id = UUID.randomUUID(),
                    userId = userId,
                    badgeId = badge.id,
                    unlockedAt = Instant.now()
                )
                val added = userBadgeRepository.addUserBadge(unlocked)
                if (added) {
                    newlyUnlocked.add(badge)
                }
            }
        }

        return newlyUnlocked
    }

    private fun meetsCondition(userId: UUID, badge: Badge): Boolean {
        return when (badge.conditionType) {
            "workouts_completed" -> {
                val required = badge.conditionValue?.toIntOrNull() ?: return false
                val userCount = workoutHistoryRepository.getHistoryCountForUser(userId)
                userCount >= required
            }

            "first_workout" -> {
                workoutHistoryRepository.getHistoryCountForUser(userId) >= 1
            }

            "goal_set" -> {
                val user = userRepository.getUserById(userId)
                user?.goal?.isNotBlank() == true
            }

            "custom_plan_created" -> {
                workoutPlanRepository.getWorkoutPlansForUser(userId).any { !it.isDefault }
            }

            "reminders_used" -> {
                val count = reminderRepository.getRemindersForUser(userId).size
                count >= (badge.conditionValue?.toIntOrNull() ?: 1)
            }

            "active_days_count" -> {
                val requiredDays = badge.conditionValue?.toIntOrNull() ?: return false
                val activeDays = workoutHistoryRepository.getActiveDaysForUser(userId)
                activeDays >= requiredDays
            }

            else -> false
        }
    }
}
