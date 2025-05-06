# 🗃️ ระบบการยืมอุปกรณ์สำนักงาน
ระบบเว็บไซต์สำหรับบริหารการยืม-คืนอุปกรณ์ภายในสำนักงาน

![Banner](https://media.discordapp.net/attachments/1366351684577656924/1369262692208218213/image.png?ex=681b38c1&is=6819e741&hm=76c1e139c4a1e1930e7e78bf16b5c1b9a2642266f5432ae9994018a800fee8f2&=&format=webp&quality=lossless&width=1076&height=603)

สำหรับ users:
```
ล็อกอินเพื่อ "จอง" อุปกรณ์ที่ต้องการ
ตรวจสอบได้ว่า "ใครยืมอยู่", "คืนวันไหน", "อุปกรณ์ว่าง" และ "รายการที่ตัวเองยืมไปแล้ว"
```
สำหรับ admin:
```
"เพิ่ม", "แก้ไข", และ "ลบ" ข้อมูลอุปกรณ์
แสดง "อุปกรณ์ทั้งหมด", "อุปกรณ์ที่ยังไม่ถูกยืม" และ "อุปกรณ์ที่ถูกยืมไป" 
"ตรวจสอบสถานะการยืม" และ "ยืนยันการคืนอุปกรณ์"
```

---

## 🖼️ ตัวอย่างหน้าจอระบบ

### 🗝️ หน้า Login
> ฟอร์มสำหรับกรอกชื่อผู้ใช้และรหัสผ่าน

![Login Screenshot](https://media.discordapp.net/attachments/1366351684577656924/1369261998272942202/image.png?ex=681b381c&is=6819e69c&hm=71778bff7d94239f0c32af5cea41cefb8aafceb731d4e503405b68df0d949b7e&=&format=webp&quality=lossless&width=1087&height=748)

---

### 🗃 หน้ารายการและสถานะอุปกรณ์
> จะแสดงข้อมูลรายการอุปกรณ์ทั้งหมด, อุปกรณ์ที่ยังไม่ได้ถูกยืมและที่ถูกยืม, สถานะการยืมและการคืน ฯลฯ

![ListItem Screenshot](https://media.discordapp.net/attachments/1366351684577656924/1369261998629715969/image.png?ex=681b381c&is=6819e69c&hm=57d9ced8afca1c2fabc09d94f7202aa6bc107175ea9e6c7449e83c4f1d530671&=&format=webp&quality=lossless&width=1081&height=739)

---

### ➕ เพิ่มข้อมูลอุปกรณ์
> ฟอร์มสำหรับกรอกข้อมูลอุปกรณ์ใหม่, การเลือกประเภทอุปกรณ์, การบันทึกข้อมูลเข้าในระบบ

![AddItem Screenshot](https://media.discordapp.net/attachments/1366351684577656924/1369261998939963413/image.png?ex=681b381c&is=6819e69c&hm=440fb005e2b8e8dc4892b353b8e8c7fc372121721c9f490e5bcc11bf425044bc&=&format=webp&quality=lossless&width=905&height=624)

---

### ❌ ป๊อปอัพลบข้อมูล
> ฟังก์ชันเตือนการลบข้อมูลอุปกรณ์ในระบบ

![DeleteItem Screenshot](https://media.discordapp.net/attachments/1366351684577656924/1369261999258861578/image.png?ex=681b381c&is=6819e69c&hm=1b2858de0eaa13119818bed2193b21ee5f49c701db7f7bcccb3b50e90e517f56&=&format=webp&quality=lossless&width=876&height=605)

---

### 🖊 แก้ไขข้อมูลอุปกรณ์
> เลือกอุปกรณ์ที่ต้องการแก้ไข, แก้ไขข้อมูลที่ต้องการปรับปรุง, บันทึกการเปลี่ยนแปลง

![EditItem Screenshot](https://media.discordapp.net/attachments/1366351684577656924/1369261999648800798/image.png?ex=681b381c&is=6819e69c&hm=1fae44bf01942ad7ec98e9e11fcfe66eaf2d8df391b4fa6f1b61a6f22bfd5218&=&format=webp&quality=lossless&width=870&height=605)

---

### 🧑‍💻️ Dashboard ประวัติการยืม
> สามารถดูประวัติการยืม กำหนดวันที่คืน และสถานะอุปกรณ์ของตนเองที่ยืมไป

![History Screenshot](https://media.discordapp.net/attachments/1366351684577656924/1369261999942275142/image.png?ex=681b381c&is=6819e69c&hm=a0d3f7c47258c29519c1c4a45fc9045ca9d06b048f1c1638327def50466c5bd0&=&format=webp&quality=lossless&width=790&height=448)

---

## เริ่มต้นใช้งาน

นี่คือโครงการ [Next.js](https://nextjs.org) ที่บูตสแตรปด้วย [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app)

ขั้นแรก ให้เรียกใช้เซิร์ฟเวอร์การพัฒนา:

```bash
npm run dev
# หรือ
yarn dev
# หรือ
pnpm dev
# หรือ
bun dev
```

เปิด [http://localhost:3000](http://localhost:3000) ด้วยเบราว์เซอร์ของคุณเพื่อดูผลลัพธ์

คุณสามารถเริ่มแก้ไขหน้าได้โดยแก้ไข `pages/index.tsx` หน้าจะอัปเดตอัตโนมัติเมื่อคุณแก้ไขไฟล์
สามารถเข้าถึง [เส้นทาง API](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) ได้ที่ [http://localhost:3000/api/hello](http://localhost:3000/api/hello) จุดสิ้นสุดนี้สามารถแก้ไขได้ใน `pages/api/hello.ts`

ไดเร็กทอรี `pages/api` จะถูกแมปไปที่ `/api/*` ไฟล์ในไดเร็กทอรีนี้จะถูกจัดการเป็น [เส้นทาง API](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) แทนที่จะเป็นหน้า React

โปรเจ็กต์นี้ใช้ [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) เพื่อเพิ่มประสิทธิภาพและโหลด [Geist](https://vercel.com/font) ซึ่งเป็นตระกูลฟอนต์ใหม่สำหรับ Vercel โดยอัตโนมัติ

## เรียนรู้เพิ่มเติม

หากต้องการเรียนรู้เพิ่มเติมเกี่ยวกับ Next.js โปรดดูแหล่งข้อมูลต่อไปนี้:

- [เอกสาร Next.js](https://nextjs.org/docs) - เรียนรู้เกี่ยวกับคุณลักษณะและ API ของ Next.js
- [เรียนรู้ Next.js](https://nextjs.org/learn-pages-router) - บทช่วยสอน Next.js แบบโต้ตอบ

คุณสามารถดู [คลังเก็บ GitHub ของ Next.js](https://github.com/vercel/next.js) - ยินดีรับคำติชมและการมีส่วนร่วมของคุณ!

## ปรับใช้บน Vercel

วิธีที่ง่ายที่สุดในการปรับใช้แอป Next.js คือการใช้ [แพลตฟอร์ม Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) จากผู้สร้าง Next.js

ดูเอกสารประกอบการใช้งาน Next.js ของเรา (https://nextjs.org/docs/pages/building-your-application/deploying) เพื่อดูรายละเอียดเพิ่มเติม
