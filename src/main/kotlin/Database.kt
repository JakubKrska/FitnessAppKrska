import com.example.models.WorkoutExercises
import com.example.models.WorkoutHistory
import com.example.models.WorkoutPerformances
import com.typesafe.config.ConfigFactory
import io.ktor.server.config.*
import io.ktor.server.config.ApplicationConfig
import io.ktor.server.application.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

object DatabaseFactory {
    fun init(config: ApplicationConfig) {
        val url = config.property("database.url").getString()
        val driver = config.property("database.driver").getString()
        val user = config.property("database.user").getString()
        val password = config.property("database.password").getString()

        Database.connect(
            url = url,
            driver = driver,
            user = user,
            password = password
        )

        transaction {
            SchemaUtils.create(
                Users,
                Exercises,
                WorkoutPlans,
                WorkoutExercises,
                WorkoutHistory,
                WorkoutPerformances,
                FavoriteExercises,
                ExerciseComments,
                WeightLog,
                Badges,
                UserBadges,
                Reminders
            )
        }
    }
}
