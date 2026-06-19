import type { UserRepository } from "@application/interfaces/repositories";
import type { Dependencies } from "@infrastructure/dependencies";

type UserNotificationRow = {
  last_notifications_checked_at: Date | string | null;
};

export function makeUserRepository({
  logger,
  rdsClient,
}: Pick<Dependencies, "logger" | "rdsClient">): UserRepository {
  return {
    async getLastNotificationsCheckedAt(userId: string): Promise<Date | null> {
      try {
        logger.debug("Fetching user notification checkpoint", { userId });

        const result =
          await rdsClient.querySingleRowOptional<UserNotificationRow>({
            query: `
              SELECT last_notifications_checked_at
              FROM users
              WHERE id = $1
            `,
            bindVariables: [userId],
          });

        if (!result?.last_notifications_checked_at) {
          return null;
        }

        return new Date(result.last_notifications_checked_at);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error("Error fetching user notification checkpoint", {
          userId,
          error: errorMessage,
        });
        throw new Error(
          `Failed to fetch user notification checkpoint: ${errorMessage}`,
        );
      }
    },

    async updateLastNotificationsCheckedAt(
      userId: string,
      timestamp: Date,
    ): Promise<void> {
      try {
        logger.debug("Updating user notification checkpoint", {
          userId,
          timestamp: timestamp.toISOString(),
        });

        await rdsClient.update({
          query: `
            INSERT INTO users (id, last_notifications_checked_at)
            VALUES ($1, $2)
            ON CONFLICT (id)
            DO UPDATE SET last_notifications_checked_at = EXCLUDED.last_notifications_checked_at
          `,
          bindVariables: [userId, timestamp],
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error("Error updating user notification checkpoint", {
          userId,
          error: errorMessage,
        });
        throw new Error(
          `Failed to update user notification checkpoint: ${errorMessage}`,
        );
      }
    },
  };
}
