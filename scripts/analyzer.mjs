/**
 * SEO Keyword Analyzer Tool (Generic Version)
 * أداة تحليل الكلمات المفتاحية لأي مشروع
 */

import { GoogleAdsApi, enums } from 'google-ads-api';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 📝 ضع الكلمات التي تريد فحصها هنا
const MY_KEYWORDS = [
  'اكتب هنا كلمتك الأولى',
  'اكتب هنا كلمتك الثانية',
  'وهكذا...'
];

// إعدادات الحساب (مربوطة بملف .env)
const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

async function main() {
  if (MY_KEYWORDS[0].includes('اكتب هنا')) {
    console.log('⚠️ يرجى إضافة كلماتك الحقيقية في مصفوفة MY_KEYWORDS داخل ملف analyzer.mjs أولاً.');
    return;
  }

  console.log(`\n🧠 جاري فحص ${MY_KEYWORDS.length} كلمة مفتاحية في محرك بحث جوجل...`);

  try {
    const response = await customer.keywordPlanIdeas.generateKeywordHistoricalMetrics({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      keywords: MY_KEYWORDS,
      // كود اللغة العربية (1019)
      language: 'languageConstants/1019',
      // كود مصر (2818) - يمكنك تغييره لأي دولة أخرى
      geo_target_constants: ['geoTargetConstants/2818'],
      keyword_plan_network: enums.KeywordPlanNetwork.GOOGLE_SEARCH,
    });
    
    const results = (response?.results || []).map((res, i) => {
      const kw = res.text || MY_KEYWORDS[i] || 'غير معروف';
      const m = res.keyword_metrics || {};
      return {
        'الكلمة المفتاحية': kw,
        'متوسط البحث الشهري': Number(m.avg_monthly_searches) || 0,
        'المنافسة': m.competition || 'غير محدد'
      };
    }).sort((a, b) => b['متوسط البحث الشهري'] - a['متوسط البحث الشهري']);

    console.log('\n✅ اكتمل الفحص! إليك النتائج:');
    console.table(results);

    // استخراج النتائج إلى ملف إكسيل
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Keywords");
    
    const outPath = path.join(__dirname, 'SEO_Results.xlsx');
    XLSX.writeFile(wb, outPath);
    console.log(`\n📁 تم حفظ التفاصيل بنجاح في ملف إكسيل: ${outPath}`);

  } catch (err) {
    console.error('\n❌ حدث خطأ أثناء الاتصال بجوجل:', err.message);
    if (err.message.includes('All promises were rejected')) {
      console.log('💡 تلميح: قد تكون بعض الكلمات التي أدخلتها عامة جداً ولم تظهر أرقام لها، جرب كلمات محددة أكثر.');
    }
  }
}

main();
