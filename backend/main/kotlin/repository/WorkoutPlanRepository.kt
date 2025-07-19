package repository

import models.WorkoutPlan
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq


class WorkoutPlanRepository {

    fun getAllWorkoutPlans(): List<WorkoutPlan> = transaction {
        WorkoutPlans.selectAll().map { toWorkoutPlan(it) }
    }

    fun getWorkoutPlanById(planId: UUID): WorkoutPlan? = transaction {
        WorkoutPlans.select { WorkoutPlans.id eq planId }
            .mapNotNull { toWorkoutPlan(it) }
            .singleOrNull()
    }

    fun addWorkoutPlan(plan: WorkoutPlan) = transaction {
        WorkoutPlans.insert {
            it[id] = plan.id
            if (plan.userId != null) {
                it[userId] = plan.userId
            } else {
                it[isDefault] = true
            }
            it[name] = plan.name
            it[description] = plan.description
            it[experienceLevel] = plan.experienceLevel ?: ""
            it[goal] = plan.goal ?: ""
            it[isDefault] = plan.isDefault ?: false
        }
    }
    fun getAllVisiblePlansForUser(userId: UUID): List<WorkoutPlan> = transaction {
        WorkoutPlans
            .select { (WorkoutPlans.isDefault eq true) or (WorkoutPlans.userId eq userId) }
            .map { toWorkoutPlan(it) }
    }

    fun updateWorkoutPlan(id: UUID, updatedPlan: WorkoutPlan): Boolean = transaction {
        WorkoutPlans.update({ WorkoutPlans.id eq id }) {
            it[userId] = updatedPlan.userId ?: UUID.randomUUID()
            it[name] = updatedPlan.name
            it[description] = updatedPlan.description
            it[experienceLevel] = updatedPlan.experienceLevel ?: ""
            it[goal] = updatedPlan.goal ?: ""
            it[isDefault] = updatedPlan.isDefault ?: false
        } > 0
    }

    fun deleteWorkoutPlan(id: UUID): Boolean = transaction {
        WorkoutPlans.deleteWhere { WorkoutPlans.id eq id } > 0
    }

    private fun toWorkoutPlan(row: ResultRow): WorkoutPlan = WorkoutPlan(
        id = row[WorkoutPlans.id],
        userId = row[WorkoutPlans.userId],
        name = row[WorkoutPlans.name],
        description = row[WorkoutPlans.description],
        experienceLevel = row[WorkoutPlans.experienceLevel],
        goal = row[WorkoutPlans.goal],
        isDefault = row[WorkoutPlans.isDefault]
    )
    fun getWorkoutPlansForUser(userId: UUID): List<WorkoutPlan> = transaction {
        WorkoutPlans.select { WorkoutPlans.userId eq userId }
            .map {
                WorkoutPlan(
                    id = it[WorkoutPlans.id],
                    userId = it[WorkoutPlans.userId],
                    name = it[WorkoutPlans.name],
                    description = it[WorkoutPlans.description],
                    experienceLevel = it[WorkoutPlans.experienceLevel],
                    goal = it[WorkoutPlans.goal],
                    isDefault = it[WorkoutPlans.isDefault]
                )
            }
    }
    fun getDefaultPlanByGoal(goal: String): WorkoutPlan? = transaction {
        WorkoutPlans
            .select { (WorkoutPlans.goal eq goal) and (WorkoutPlans.isDefault eq true) }
            .limit(1)
            .map {
                WorkoutPlan(
                    id = it[WorkoutPlans.id],
                    userId = it[WorkoutPlans.userId],
                    name = it[WorkoutPlans.name],
                    description = it[WorkoutPlans.description],
                    experienceLevel = it[WorkoutPlans.experienceLevel],
                    goal = it[WorkoutPlans.goal],
                    isDefault = it[WorkoutPlans.isDefault]
                )
            }
            .singleOrNull()
    }
}
