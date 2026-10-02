const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'src', 'layouts', 'MainLayout.astro');
let content = fs.readFileSync(layoutPath, 'utf8');

// Replace all instances of hardcoded 01070046464 with ${phoneNumber} in HTML attributes
content = content.replace(/tel:01070046464/g, 'tel:${phoneNumber}');
content = content.replace(/wa\.me\/201070046464/g, 'wa.me/2${phoneNumber}');
// In the footer text
content = content.replace(/>\+20 107 004 6464</g, '>{phoneNumber}</');

fs.writeFileSync(layoutPath, content, 'utf8');
console.log('✅ MainLayout updated to use dynamic phoneNumber.');

const shafatPath = path.join(__dirname, 'src', 'pages', 'فني-شفاطات.astro');
let shafatContent = fs.readFileSync(shafatPath, 'utf8');

shafatContent = shafatContent.replace(
  '<MainLayout \n  title="تأسيس و تركيب شفاط المطبخ والمداخن| 01024596959 | فني شفاطات" \n  description="هل تبحث عن فني شفاطات لتركيب شفاط ؟ نقدم عمل شفاط المطبخ والحمام، و المداخن، وعمل فتحات الكور في الخرسانة بدقة . خدمة 24 ساعة في القاهرة والمحافظات. 01024596959."\n>',
  '<MainLayout \n  title="تأسيس و تركيب شفاط المطبخ والمداخن| 01024596959 | فني شفاطات" \n  description="هل تبحث عن فني شفاطات لتركيب شفاط ؟ نقدم عمل شفاط المطبخ والحمام، و المداخن، وعمل فتحات الكور في الخرسانة بدقة . خدمة 24 ساعة في القاهرة والمحافظات. 01024596959."\n  phoneNumber="01024596959"\n>'
);

fs.writeFileSync(shafatPath, shafatContent, 'utf8');
console.log('✅ Shaffat page updated to pass phoneNumber.');
