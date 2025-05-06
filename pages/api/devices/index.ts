// pages/api/devices/index.ts
import { prisma } from "../../../lib/prisma"; // Adjust path if needed
import type { NextApiRequest, NextApiResponse } from "next";
import type { Device } from '@prisma/client';

// Define the expected response type (array of devices or an error)
type ResponseData = Device[] | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Handle only GET requests for this endpoint
  if (req.method === 'GET') {
    try {
      // Fetch all devices from the database
      // Include borrower information if needed by the frontend
      const devices = await prisma.device.findMany({
        include: {
          borrower: { // Include the related User record (if borrowerId is set)
            select: { // Only select the fields you need from the User
              id: true,
              name: true,
              // email: true, // Uncomment if you need the email
            }
          }
        }
      });

      // Return the list of devices
      return res.status(200).json(devices);

    } catch (error: unknown) {
      console.error("Error fetching devices:", error);
      // Determine the error message safely
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return res.status(500).json({ error: `Internal Server Error: ${message}` });
    }
  } else {
    // If the method is not GET, return Method Not Allowed
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
