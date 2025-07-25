package repository

import models.WorkoutPlan
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import java.util.*

class WorkoutPlanRepository {

    fun getAllWorkoutPlans(): List<WorkoutPlan> = transaction {
        WorkoutPlans.selectAll().map(::toWorkoutPlan)
    }

    fun getWorkoutPlanById(planId: UUID): WorkoutPlan? = transaction {
        WorkoutPlans.select { WorkoutPlans.id eq planId }
            .map(::toWorkoutPlan)
            .singleOrNull()
    }

    fun getAllVisiblePlansForUser(userId: UUID): List<WorkoutPlan> = transaction {
        WorkoutPlans
            .select { (WorkoutPlans.isDefault eq true) or (WorkoutPlans.userId eq userId) }
            .map(::toWorkoutPlan)
    }

    fun getWorkoutPlansForUser(userId: UUID): List<WorkoutPlan> = transaction {
        WorkoutPlans.select { WorkoutPlans.userId eq userId }.map(::toWorkoutPlan)
    }

    fun getDefaultPlanByGoal(goal: String): WorkoutPlan? = transaction {
        WorkoutPlans
            .select { (WorkoutPlans.goal eq goal) and (WorkoutPlans.isDefault eq true) }
            .limit(1)
            .map(::toWorkoutPlan)
            .singleOrNull()
    }

    fun addWorkoutPlan(plan: WorkoutPlan) = transaction {
        WorkoutPlans.insert {
            it[id] = plan.id
            it[name] = plan.name
            it[description] = plan.description
            it[experienceLevel] = plan.experienceLevel ?: ""
            it[goal] = plan.goal ?: ""
            it[userId] = plan.userId
            it[isDefault] = plan.isDefault ?: (plan.userId == null)
        }
    }

    fun updateWorkoutPlan(id: UUID, updatedPlan: WorkoutPlan): Boolean = transaction {
        WorkoutPlans.update({ WorkoutPlans.id eq id }) {
            it[name] = updatedPlan.name
            it[description] = updatedPlan.description
            it[experienceLevel] = updatedPlan.experienceLevel ?: ""
            it[goal] = updatedPlan.goal ?: ""
            it[userId] = updatedPlan.userId
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
}
