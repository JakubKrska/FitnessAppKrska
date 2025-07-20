import ExerciseComments
import Exercises
import FavoriteExercises
import Users
import com.example.models.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

object DatabaseFactory {
    fun init() {
        Database.connect(
            url = "jdbc:postgresql://localhost:5432/FitnessApp",
            driver = "org.postgresql.Driver",
            user = "postgres",
            password = "251436"
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
                ExerciseComments
            )
        }
    }
}
