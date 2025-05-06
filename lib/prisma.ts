// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// ประกาศ type ของ global variable (ถ้ายังไม่มี)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// ตรวจสอบว่ามี instance ใน global หรือยัง ถ้าไม่มีให้สร้างใหม่
// ถ้ามีอยู่แล้ว (ใน development) ให้ใช้ instance เดิม
export const prisma = global.prisma || new PrismaClient();

// ใน development mode ให้เก็บ instance ไว้ใน global variable
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// ไม่จำเป็นต้องมี export { prisma }; อีก ถ้าใช้ export const prisma = ... ด้านบนแล้ว
