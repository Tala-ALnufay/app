


# استخدم صورة Node.js الرسمية
FROM node:18

# أنشئ مجلد التطبيق في داخل الحاوية
WORKDIR /app

# انسخ ملفات المشروع
COPY package*.json ./

# ثبّت التبعيات
RUN npm install

# انسخ باقي الملفات
COPY . .

# عرّف المنفذ المستخدم
EXPOSE 3001

# الأمر الافتراضي لتشغيل التطبيق
CMD ["node", "index.js"]
