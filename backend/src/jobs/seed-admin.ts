import {
  IUserModuleService,
  MedusaContainer
} from "@medusajs/types";
import { Modules } from "@medusajs/utils";

export default async function seedAdminJob(container: MedusaContainer) {
  const logger = container.resolve("logger");
  const userModuleService: IUserModuleService = container.resolve(
    Modules.USER
  );

  const adminEmail = process.env.MEDUSA_ADMIN_EMAIL;
  const adminPassword = process.env.MEDUSA_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    logger.info(
      "[seed-admin] MEDUSA_ADMIN_EMAIL or MEDUSA_ADMIN_PASSWORD not set, skipping admin seed"
    );
    return;
  }

  try {
    // Check if admin already exists
    const [users, count] = await userModuleService.listAndCountUsers({
      email: adminEmail.toLowerCase(),
    });

    if (count > 0) {
      logger.info(`[seed-admin] Admin user ${adminEmail} already exists`);
      return;
    }

    // Create admin user
    const [user] = await userModuleService.createUsers([
      {
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        first_name: "Admin",
        last_name: "User",
      },
    ]);

    logger.info(`[seed-admin] Admin user created: ${user.email} (ID: ${user.id})`);
  } catch (error) {
    logger.error(`[seed-admin] Failed to seed admin user: ${error.message}`);
  }
}

export const config = {
  name: "seed-admin-on-startup",
  schedule: "*/1 * * * *", // Every minute - but runs once via logic
  numberOfExecutions: 1, // Only run once
};
