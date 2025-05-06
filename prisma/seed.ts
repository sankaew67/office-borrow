// prisma/seed.ts
import { PrismaClient, DeviceType, DeviceStatus } from '@prisma/client'; // <-- Import Enums

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- เพิ่มข้อมูลอุปกรณ์ตรงนี้ ---
  const device1 = await prisma.device.create({
    data: {
      name: 'Laptop Dell Latitude 7400',
      type: DeviceType.LAPTOP, // <--- ใช้ Enum
      serialNumber: 'DELL-LAT7400-001',
      status: DeviceStatus.AVAILABLE, // <--- ใช้ Enum
    },
  });

  const device2 = await prisma.device.create({
    data: {
      name: 'Monitor LG 27 inch',
      type: DeviceType.MONITOR, // <--- ใช้ Enum
      serialNumber: 'LG-MON27-005',
      status: DeviceStatus.AVAILABLE, // <--- ใช้ Enum
    },
  });

  const device3 = await prisma.device.create({
    data: {
      name: 'Keyboard Logitech K120',
      type: DeviceType.KEYBOARD, // <--- ใช้ Enum
      serialNumber: 'LOGI-K120-101',
      status: DeviceStatus.AVAILABLE, // <--- ใช้ Enum
    },
  });

   const device4 = await prisma.device.create({
    data: {
      name: 'Mouse Logitech M90',
      type: DeviceType.MOUSE, // <--- ใช้ Enum
      serialNumber: 'LOGI-M90-215',
      status: DeviceStatus.AVAILABLE, // <--- ใช้ Enum
    },
  });

  console.log(`Created devices:`);
  console.log(device1);
  console.log(device2);
  console.log(device3);
  console.log(device4);
  // --- จบส่วนเพิ่มข้อมูล ---

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
