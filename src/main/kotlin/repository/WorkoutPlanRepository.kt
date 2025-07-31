package repository

import models.WorkoutPlan
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq


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
        println("📦 Ukládám plán do DB: $plan")

        if (!plan.isDefault && plan.userId == null) {
            error("❌ Nezadaný userId pro nevýchozí plán")
        }

        WorkoutPlans.insert {
            it[id] = plan.id
            it[userId] = plan.userId
            it[name] = plan.name
            it[description] = plan.description
            it[experienceLevel] = plan.experienceLevel ?: ""
            it[goal] = plan.goal ?: ""
            it[isDefault] = plan.isDefault
        }
    }

    fun updateWorkoutPlan(id: UUID, updatedPlan: WorkoutPlan): Boolean = transaction {
        WorkoutPlans.update({ WorkoutPlans.id eq id }) {
            it[name] = updatedPlan.name
            it[description] = updatedPlan.description
            it[experienceLevel] = updatedPlan.experienceLevel ?: ""
            it[goal] = updatedPlan.goal ?: ""
            it[userId] = updatedPlan.userId
            it[isDefault] = updatedPlan.isDefault
        } > 0
    }

    fun deleteWorkoutPlan(id: UUID): Boolean = transaction {
        println("Mazání plánu s ID: $id")
        val result = WorkoutPlans.deleteWhere { WorkoutPlans.id eq id }
        println("Smazáno řádků: $result")
        result > 0
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
