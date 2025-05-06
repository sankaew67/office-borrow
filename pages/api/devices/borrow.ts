// pages/api/devices/borrow.ts
import { prisma } from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
// Import Device model type AND the DeviceStatus enum
import { Device, DeviceStatus } from '@prisma/client'; // <--- Import DeviceStatus enum

// Use Prisma's Device type for the success case
type ResponseData = Device | { error: string };

// ไม่จำเป็นต้องใช้ DEVICE_STATUS constant แล้ว ถ้าจะใช้ Enum โดยตรง
// const DEVICE_STATUS = {
//     AVAILABLE: 'available',
//     BORROWED: 'borrowed',
// } as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    // More robust validation for request body
    const body = req.body;
    if (typeof body !== 'object' || body === null || typeof body.deviceId !== 'string' || typeof body.userId !== 'string') {
        return res.status(400).json({ error: "Invalid request body: deviceId (string) and userId (string) are required" });
    }
    const { deviceId, userId } = body;

    try {
      // Find the device by ID
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
      });

      // Check if the device exists
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }

      // Check if the device is already borrowed using the Enum
      if (device.status === DeviceStatus.BORROWED) { // <--- ใช้ Enum ที่ import มา
        return res.status(409).json({ error: "Device is already borrowed" });
      }

      // Check if user exists (Optional but recommended)
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      // Update device status and borrower using the Enum
      const updatedDevice = await prisma.device.update({
        where: { id: deviceId },
        data: {
          status: DeviceStatus.BORROWED, // <--- ใช้ Enum ที่ import มา
          borrowerId: userId,
        },
      });

      // Return the updated device data
      return res.status(200).json(updatedDevice);

    } catch (error) {
      console.error("Error borrowing device:", error);
      // Consider checking for specific Prisma errors (e.g., P2025 Record not found if user/device deleted between checks)
      return res.status(500).json({ error: "Error updating device status" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
