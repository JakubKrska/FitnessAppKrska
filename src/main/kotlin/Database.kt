import com.example.models.WorkoutExercises
import com.example.models.WorkoutHistory
import com.example.models.WorkoutPerformances
import com.typesafe.config.ConfigFactory
import io.ktor.server.config.*
import io.ktor.server.application.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

object DatabaseFactory {
    fun init() {
        val config = HoconApplicationConfig(ConfigFactory.load())

        val dbUrl = config.property("database.url").getString()
        val dbDriver = config.property("database.driver").getString()
        val dbUser = config.property("database.user").getString()
        val dbPassword = config.property("database.password").getString()

        Database.connect(
            url = dbUrl,
            driver = dbDriver,
            user = dbUser,
            password = dbPassword
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
                Reminders,
            )
        }
    }
}
