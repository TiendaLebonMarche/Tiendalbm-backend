import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { IUserModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

let adminSeeded = false;

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = (req as any).scope.resolve("logger");
  const userModuleService: IUserModuleService = (req as any).scope.resolve(
    Modules.USER
  );

  const adminEmail = process.env.MEDUSA_ADMIN_EMAIL;
  const adminPassword = process.env.MEDUSA_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    res.status(200).json({
      ok: true,
      adminSeeded,
      message: "MEDUSA_ADMIN_EMAIL or MEDUSA_ADMIN_PASSWORD not set",
    });
    return;
  }

  const normalizedEmail = adminEmail.toLowerCase().trim();

  try {
    // Check if admin user record exists
    const [users, count] = await userModuleService.listAndCountUsers({
      email: normalizedEmail,
    });

    if (count > 0) {
      adminSeeded = true;
      res.status(200).json({
        ok: true,
        adminSeeded: true,
        email: users[0].email,
        id: users[0].id,
        message: "Admin already exists",
      });
      return;
    }

    // In Medusa v2, user records hold profile info (password via auth module)
    const [user] = await userModuleService.createUsers([
      {
        email: normalizedEmail,
        first_name: "Admin",
        last_name: "Le Bon Marché",
      } as any,
    ]);

    adminSeeded = true;
    logger?.info(`[admin-seed] Admin user created: ${user.email} (ID: ${user.id})`);

    res.status(200).json({
      ok: true,
      adminSeeded: true,
      email: user.email,
      id: user.id,
      message: "Admin user record created successfully",
    });
  } catch (error: any) {
    logger?.error(`[admin-seed] Failed: ${error.message}`);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}
