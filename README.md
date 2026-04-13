# 🖼️ Image Size Reducer

เว็บแอปสำหรับลดขนาดรูปภาพ ใช้งานง่าย รองรับ Drag & Drop พร้อม UI สวยงามสไตล์ Vercel

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.1.0-purple)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8)

## ✨ ฟีเจอร์

- 📤 **อัปโหลดหลายรูป** - ลากวางหรือเลือกไฟล์ได้ทีละหลายๆ รูป
- ⚡ **ประมวลผลเร็ว** - ลดขนาดรูปอัตโนมัติด้วย Sharp
- 📊 **แสดงสถิติ** - ดูขนาดก่อน/หลัง และเปอร์เซ็นต์ที่ลดลง
- ⬇️ **ดาวน์โหลดง่าย** - ดาวน์โหลดแยกแต่ละรูป หรือ ZIP ทั้งหมด
- 🎨 **UI สวยงาม** - Dark theme พร้อม animations ลื่นไหล
- 📱 **Responsive** - ใช้งานได้ทุกอุปกรณ์

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Express.js + Sharp (Image Processing)
- **Deployment**: Vercel

## 📸 ภาพหน้าจอ

- Drag & drop upload
- แสดง preview ก่อนประมวลผล
- แสดงผลลัพธ์แบบ card grid
- สถิติแต่ละรูป (Original → Reduced → Saved %)

## 🚀 วิธีใช้งาน

### สำหรับ Local Development

#### ข้อกำหนดเบื้องต้น
- Node.js 18 ขึ้นไป
- npm หรือ yarn

#### ติดตั้งและใช้งาน

1. **Clone โปรเจคนี้:**
```bash
git clone <your-repo-url>
cd react-app
```

2. **ติดตั้ง dependencies:**
```bash
npm install
```

3. **ติดตั้ง API dependencies:**
```bash
cd api
npm install
cd ..
```

4. **เริ่มใช้งาน:**
```bash
npm run dev
```

คำสั่งนี้จะเปิด:
- Frontend: http://localhost:3000
- API Server: http://localhost:3001

5. **เปิดเบราว์เซอร์:** http://localhost:3000

### สำหรับ Production (Vercel)

#### วิธีที่ 1: ใช้ Vercel CLI (แนะนำ)

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd react-app
vercel
```

#### วิธีที่ 2: ผ่าน GitHub

1. **Push code ขึ้น GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/image-size-reducer.git
git push -u origin main
```

2. **ไป Vercel:**
   - เปิด [vercel.com](https://vercel.com)
   - คลิก "New Project"
   - Import repository ของคุณ
   - คลิก "Deploy"

3. **ตั้งค่า:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

## 📁 โครงสร้างไฟล์

```
react-app/
├── api/                      # API server สำหรับประมวลผลรูปภาพ
│   ├── upload.js            # Endpoint อัปโหลดและลดขนาด
│   ├── package.json         # API dependencies
│   └── .gitignore
├── src/
│   ├── App.jsx              # Component หลัก
│   ├── main.jsx             # Entry point
│   └── index.css            # TailwindCSS + animations
├── public/
├── index.html
├── api-server.js            # Express API server (สำหรับ dev)
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── vercel.json              # Vercel deployment config
├── package.json
└── README.md
```

## 🎯 วิธีใช้

1. **อัปโหลดรูป:**
   - ลากวางรูปในช่อง upload หรือ
   - คลิกเพื่อเลือกไฟล์
   - รองรับ: JPG, PNG, WEBP

2. **ประมวลผล:**
   - กดปุ่ม "Reduce Images →"
   - รอสักครู่ (มี progress bar แสดง)

3. **ดาวน์โหลด:**
   - ดาวน์โหลดแยกแต่ละรูป หรือ
   - กด "Download All (ZIP)" เพื่อโหลดทั้งหมด

## ⚙️ การตั้งค่า

### ปรับคุณภาพรูป

แก้ไขใน `api/upload.js`:

```javascript
.jpeg({
  quality: 85,        // คุณภาพ 0-100 (ยิ่งมากคุณภาพยิ่งดี แต่ไฟล์ใหญ่)
  mozjpeg: true,      // ใช้ mozjpeg เพื่อขนาดไฟล์ที่เล็กลง
  progressive: true   // Progressive JPEG
})
```

### ปรับขนาดสูงสุด

แก้ไขใน `api/upload.js`:

```javascript
.resize(1920, 1080, {  // เปลี่ยนขนาดสูงสุด
  fit: 'inside',
  withoutEnlargement: true
})
```

## 🔧 Scripts

```bash
# Development
npm run dev              # เปิดทั้ง frontend และ API

# แยกกัน
npm run dev:api          # เฉพาะ API server
npm run dev:frontend     # เฉพาะ Vite

# Production
npm run build            # Build สำหรับ production
npm run preview          # Preview production build
```

## 🌐 Deployment Platforms

### Vercel (แนะนำ)
- ✅ Deploy ง่าย
- ✅ Serverless functions ฟรี
- ✅ SSL certificate อัตโนมัติ
- ✅ Custom domain ฟรี

### อื่นๆ
สามารถ deploy บน platform อื่นๆ ที่รองรับ Node.js ได้ เช่น:
- Railway
- Render
- Heroku
- DigitalOcean

## 🤝 Contributing

ยินดีรับ contributions ทุกแบบ!

1. Fork โปรเจค
2. สร้าง Branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📝 License

MIT License - ดูรายละเอียดใน [LICENSE](LICENSE) ไฟล์

## 💖 Support

ถ้าชอบโปรเจคนี้ ช่วยกันได้นะ:
- ⭐ ให้ดาว GitHub
- 🔄 แชร์ให้เพื่อน
- ☕ [Donate](https://tipme.in.th/athitfkm)

## 📞 ติดต่อ

- **GitHub**: [@ohm41321](https://github.com/ohm41321)
- **Donate**: [tipme.in.th/athitfkm](https://tipme.in.th/athitfkm)

## 🐛 Troubleshooting

### API Error 500
- ตรวจสอบว่าติดตั้ง dependencies ครบ: `npm install`
- ตรวจสอบว่า API server ทำงานอยู่: `npm run dev:api`

### รูปไม่ลดขนาด
- ตรวจสอบว่าไฟล์เป็นรุปภาพจริง (JPG, PNG, WEBP)
- ตรวจสอบว่า server มีพื้นที่ว่างเพียงพอ

### Build Failed
- ลองลบ `node_modules` แล้วลงใหม่:
  ```bash
  rm -rf node_modules
  npm install
  ```
- ตรวจสอบ Node.js version (ต้องใช้ 18+)

## 🎉 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Sharp](https://sharp.pixelplumbing.com/)
- [Vercel](https://vercel.com/)

---

Made with ❤️ by [ohm41321](https://github.com/ohm41321)
