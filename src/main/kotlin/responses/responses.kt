package responses

import WorkoutExercise
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import models.*
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.*





fun Instant.toIsoString(): String = this.atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ISO_INSTANT)

@Serializable
data class UserResponse(
    @Contextual val id: UUID,
    val name: String,
    val age: Int?,
    val height: Int?,
    val weight: Double?,
    val gender: String?,
    val goal: String,
    val experienceLevel: String,
    val createdAt: String,
    val updatedAt: String,
    val role: String
)

fun User.toResponse() = UserResponse(
    id = id,
    name = name,
    age = age,
    height = height,
    weight = weight,
    gender = gender,
    goal = goal,
    experienceLevel = experienceLevel,
    createdAt = Instant.parse(createdAt).toIsoString(),
    updatedAt = Instant.parse(updatedAt).toIsoString(),
    role = role
)

@Serializable
data class ExerciseResponse(
    @Contextual val id: UUID,
    val name: String,
    val description: String?,
    val imageUrl: String?,
    val muscleGroup: String?,
    val difficulty: String?,
    @Contextual val authorId: UUID?
)

fun Exercise.toResponse() = ExerciseResponse(
    id = id,
    name = name,
    description = description,
    imageUrl = imageUrl,
    muscleGroup = muscleGroup,
    difficulty = difficulty,
    authorId = authorId
)

@Serializable
data class WorkoutPlanResponse(
    @Contextual val id: UUID,
    @Contextual val userId: UUID?,
    val name: String,
    val description: String?,
    val experienceLevel: String?,
    val goal: String?
)

fun WorkoutPlan.toResponse() = WorkoutPlanResponse(
    id = id,
    userId = userId,
    name = name,
    description = description,
    experienceLevel = experienceLevel,
    goal = goal
)

@Serializable
data class WorkoutExerciseResponse(
    @Contextual val id: UUID,
    @Contextual val workoutPlanId: UUID,
    @Contextual val exerciseId: UUID,
    val sets: Int,
    val reps: Int,
    val orderIndex: Int,
)

fun WorkoutExercise.toResponse() = WorkoutExerciseResponse(
    id = id,
    workoutPlanId = workoutPlanId,
    exerciseId = exerciseId,
    sets = sets,
    reps = reps,
    orderIndex = orderIndex,
)

@Serializable
data class WorkoutHistoryResponse(
    @Contextual val id: UUID,
    val completedAt: String,
    val workoutPlanName: String? = null
)

fun WorkoutHistoryEntry.toResponse(planName: String?) = WorkoutHistoryResponse(
    id = id,
    completedAt = completedAt.toIsoString(),
    workoutPlanName = planName
)

@Serializable
data class FavoriteExerciseResponse(
    @Contextual val id: UUID,
    @Contextual val userId: UUID,
    @Contextual val exerciseId: UUID
)

fun FavoriteExercise.toResponse() = FavoriteExerciseResponse(
    id = id,
    userId = userId,
    exerciseId = exerciseId
)

@Serializable
data class ExerciseCommentResponse(
    @Contextual val id: UUID,
    @Contextual val userId: UUID,
    @Contextual val exerciseId: UUID,
    val commentText: String,
)

fun ExerciseComment.toResponse() = ExerciseCommentResponse(
    id = id,
    userId = userId,
    exerciseId = exerciseId,
    commentText = commentText
)

@Serializable
data class WeightEntryResponse(
    @Contextual val id: UUID,
    val weight: Double,
    val loggedAt: String
)

fun WeightEntry.toResponse() = WeightEntryResponse(
    id = id,
    weight = weight,
    loggedAt = loggedAt
)

@Serializable
data class WorkoutPerformanceResponse(
    @Contextual val id: UUID,
    @Contextual val workoutHistoryId: UUID,
    @Contextual val exerciseId: UUID,
    val setsCompleted: Int,
    val repsCompleted: Int,
    val weightUsed: Double?
)

fun WorkoutPerformance.toResponse() = WorkoutPerformanceResponse(
    id = id,
    workoutHistoryId = workoutHistoryId,
    exerciseId = exerciseId,
    setsCompleted = setsCompleted,
    repsCompleted = repsCompleted,
    weightUsed = weightUsed
)

@Serializable
data class BadgeResponse(
    @Contextual val id: UUID,
    val name: String,
    val description: String?,
    val icon: String?,
    val conditionType: String,
    val conditionValue: String?,
    val createdAt: String
)

fun Badge.toResponse() = BadgeResponse(
    id = id,
    name = name,
    description = description,
    icon = icon,
    conditionType = conditionType,
    conditionValue = conditionValue,
    createdAt = createdAt
)


