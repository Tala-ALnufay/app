
# driver-service/Dockerfile
FROM node:20

# إنشاء مجلد التطبيق داخل الحاوية
WORKDIR /app

# نسخ ملفات المشروع
COPY package*.json ./

# تثبيت الحزم
RUN npm install

# نسخ باقي الملفات
COPY . .

# تحديد المنفذ الذي تستخدمه الخدمة
EXPOSE 3002

# أمر التشغيل
CMD ["node", "index.js"]
