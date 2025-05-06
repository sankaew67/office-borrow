// pages/api/devices/return.ts
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
    if (typeof body !== 'object' || body === null || typeof body.deviceId !== 'string') {
        return res.status(400).json({ error: "Invalid request body: deviceId (string) is required" });
    }
    const { deviceId } = body;

    try {
      // Find the device by ID
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
      });

      // Check if the device exists
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }

      // Check if the device is already available using the Enum
      if (device.status === DeviceStatus.AVAILABLE) { // <--- ใช้ Enum ที่ import มา
          return res.status(409).json({ error: "Device is already available" });
      }

      // Update the device status to AVAILABLE and clear the borrowerId using the Enum
      const updatedDevice = await prisma.device.update({
        where: { id: deviceId },
        data: {
          status: DeviceStatus.AVAILABLE, // <--- ใช้ Enum ที่ import มา
          borrowerId: null, // Clear borrowerId
        },
      });

      // Return the updated device data
      return res.status(200).json(updatedDevice);

    } catch (error) {
      console.error("Error returning device:", error);
      // Consider checking for specific Prisma errors
      return res.status(500).json({ error: "Error updating device status" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
