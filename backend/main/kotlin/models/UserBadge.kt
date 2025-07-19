package models

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant
import java.util.*

@Serializable
data class UserBadge(
    @Contextual val id: UUID,
    @Contextual val userId: UUID,
    @Contextual val badgeId: UUID,
    @Contextual val unlockedAt: Instant
)
