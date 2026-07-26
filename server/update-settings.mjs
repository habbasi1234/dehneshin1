import mongoose from 'mongoose'
import Setting from './models/Setting.js'

await mongoose.connect('mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin')

const themes = {
  active: 'emerald',
  available: [
    { id:'royal-gold', name:'سلطنتی طلایی', name_en:'Royal Gold', name_ar:'ذهبي ملكي',
      colors:{ primary:'#D4AF37', primaryDark:'#8B6914', primaryLight:'#F0D060', background:'#0A0A0F', surface:'#1a1a1a', surfaceLight:'#222', text:'#F5E6C8', textSecondary:'#A89880', border:'rgba(212,175,55,0.2)', cardBg:'rgba(255,255,255,0.03)', success:'#66BB6A', error:'#EF5350' } },
    { id:'light', name:'سفید سبز آجری', name_en:'White Green Terracotta', name_ar:'أبيض أخضر طيني',
      colors:{ primary:'#4CAF50', primaryDark:'#388E3C', primaryLight:'#C85A17', background:'#FFFFFF', surface:'#F8F8F5', surfaceLight:'#F0F0EA', text:'#2D2D2D', textSecondary:'#6B6B6B', border:'rgba(76,175,80,0.2)', cardBg:'rgba(0,0,0,0.02)', success:'#66BB6A', error:'#F44336' } },
    { id:'purple-gold', name:'بنفش طلايي', name_en:'Purple Gold', name_ar:'بنفسجي ذهبي',
      colors:{ primary:'#C9A84C', primaryDark:'#9B59B6', primaryLight:'#D4AF37', background:'#1A1A2E', surface:'#16213E', surfaceLight:'#0F3460', text:'#F5E6C8', textSecondary:'#B8A9C4', border:'rgba(201,168,76,0.25)', cardBg:'rgba(255,255,255,0.03)', success:'#66BB6A', error:'#EF5350' } },
    { id:'emerald', name:'سبز و آجری', name_en:'Green Terracotta', name_ar:'أخضر طيني',
      colors:{ primary:'#4CAF50', primaryDark:'#388E3C', primaryLight:'#C85A17', background:'#F5F0E8', surface:'#FFFFFF', surfaceLight:'#FCFAF5', text:'#2D2D2D', textSecondary:'#6B6B6B', border:'rgba(0,0,0,0.08)', cardBg:'rgba(0,0,0,0.02)', success:'#66BB6A', error:'#EF5350' } },
    { id:'sapphire', name:'ياقوتي آبي', name_en:'Sapphire Blue', name_ar:'ياقوت أزرق',
      colors:{ primary:'#D4AF37', primaryDark:'#1565C0', primaryLight:'#42A5F5', background:'#0D141E', surface:'#1A2332', surfaceLight:'#2C3E50', text:'#E3F2FD', textSecondary:'#90CAF9', border:'rgba(212,175,55,0.2)', cardBg:'rgba(255,255,255,0.03)', success:'#66BB6A', error:'#EF5350' } },
  ]
}

await Setting.findByIdAndUpdate('global', { $set: { otpEnabled: false, themes } }, { upsert: true })
console.log('Settings updated with themes and OTP disabled')
await mongoose.disconnect()
