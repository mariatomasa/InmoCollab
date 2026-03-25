import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const properties = [
  { name:"Residencial Mare Nostrum", zone:"Torrevieja", type:"Apartamento", bedrooms:2, bathrooms:2, area:75, price:189000, totalUnits:48, availUnits:12, pool:true, parking:true, garden:true, terrace:true, completion:"Q4 2026", descEs:"Obra nueva a 300m de playa del Cura. Piscina infinity y gimnasio.", descEn:"New-build 300m from beach. Infinity pool & gym.", address:"Av. Marineros 28, Torrevieja", developer:"Grupo Levante Homes", devPhone:"+34 966 123 456", featuresEs:["Cocina amueblada","A/C conductos","Climalit","Garaje","Trastero"], featuresEn:["Furnished kitchen","Ducted A/C","Climalit","Garage","Storage"], gradient:"linear-gradient(135deg,#0077B6,#00B4D8)", soldWeek:3, viewsToday:18, hot:true, isNew:false },
  { name:"Villas del Golf", zone:"Orihuela Costa", type:"Villa", bedrooms:3, bathrooms:3, area:140, price:345000, totalUnits:24, availUnits:8, pool:true, parking:true, garden:true, terrace:true, completion:"Q2 2027", descEs:"Villas con piscina privada junto a golf Villamartín.", descEn:"Villas with pool next to Villamartín golf.", address:"Urb. Villamartín", developer:"Costa Blanca Villas S.L.", devPhone:"+34 965 321 654", featuresEs:["Piscina privada","Solarium","Domótica","Silestone","Jardín"], featuresEn:["Private pool","Solarium","Automation","Silestone","Garden"], gradient:"linear-gradient(135deg,#2D6A4F,#52B788)", soldWeek:1, viewsToday:9, hot:false, isNew:true },
  { name:"Torre Poniente", zone:"Benidorm", type:"Apartamento", bedrooms:2, bathrooms:1, area:65, price:220000, totalUnits:96, availUnits:31, pool:true, parking:true, garden:false, terrace:true, completion:"Q1 2027", descEs:"Torre 20 plantas, vistas playa Poniente. Piscina azotea.", descEn:"20-floor tower, Poniente beach views. Rooftop pool.", address:"Av. Mediterráneo 45, Benidorm", developer:"Skyline Costa S.A.", devPhone:"+34 966 789 012", featuresEs:["Ascensor rápido","Piscina azotea","Conserjería 24h","Terraza","Parking"], featuresEn:["Fast elevator","Rooftop pool","24h concierge","Terrace","Parking"], gradient:"linear-gradient(135deg,#E76F51,#F4A261)", soldWeek:5, viewsToday:27, hot:true, isNew:false },
  { name:"Jardines del Puerto", zone:"Santa Pola", type:"Dúplex", bedrooms:3, bathrooms:2, area:110, price:275000, totalUnits:32, availUnits:15, pool:true, parking:true, garden:true, terrace:true, completion:"Q3 2026", descEs:"Dúplex con jardín a 500m del puerto deportivo.", descEn:"Duplexes with garden near marina.", address:"C/ Puerto 12, Santa Pola", developer:"Mediterráneo Living", devPhone:"+34 965 456 789", featuresEs:["Jardín 40m²","Aerotermia","Suelo radiante","Energía A","Domótica"], featuresEn:["40m² garden","Aerothermal","Underfloor heating","A-rated","Automation"], gradient:"linear-gradient(135deg,#264653,#2A9D8F)", soldWeek:2, viewsToday:11, hot:false, isNew:false },
  { name:"Altea Hills Residence", zone:"Altea", type:"Villa", bedrooms:4, bathrooms:3, area:220, price:520000, totalUnits:12, availUnits:4, pool:true, parking:true, garden:true, terrace:true, completion:"Q4 2026", descEs:"Villas lujo con vistas mar y Sierra Bernia.", descEn:"Luxury villas, sea & mountain views.", address:"Urb. Altea Hills", developer:"Premium Villas Med.", devPhone:"+34 966 234 567", featuresEs:["Infinity pool","Garaje doble","Vestidor","Bodega","Ascensor"], featuresEn:["Infinity pool","Double garage","Walk-in closet","Wine cellar","Elevator"], gradient:"linear-gradient(135deg,#6D597A,#B56576)", soldWeek:1, viewsToday:14, hot:true, isNew:false },
  { name:"Residencial Palmerales", zone:"Elche", type:"Apartamento", bedrooms:2, bathrooms:2, area:80, price:165000, totalUnits:60, availUnits:28, pool:true, parking:true, garden:true, terrace:true, completion:"Q1 2027", descEs:"Junto al Palmeral UNESCO. Terrazas amplias.", descEn:"Next to UNESCO Palm Grove.", address:"C/ Palmeral 8, Elche", developer:"Elche Desarrollos S.L.", devPhone:"+34 966 543 210", featuresEs:["Terraza 15m²","Piscina","Zona infantil","Armarios","Videoportero"], featuresEn:["15m² terrace","Pool","Kids area","Wardrobes","Intercom"], gradient:"linear-gradient(135deg,#606C38,#283618)", soldWeek:4, viewsToday:22, hot:true, isNew:true },
  { name:"Dunas de Guardamar", zone:"Guardamar", type:"Bungalow", bedrooms:2, bathrooms:2, area:85, price:210000, totalUnits:40, availUnits:18, pool:true, parking:true, garden:true, terrace:true, completion:"Q2 2027", descEs:"Bungalows junto a dunas, 200m de playa.", descEn:"Bungalows near dunes, 200m from beach.", address:"Av. Dunas 15, Guardamar", developer:"Segura Homes", devPhone:"+34 965 678 901", featuresEs:["Solárium","BBQ","Parking","Playa","Deporte"], featuresEn:["Solarium","BBQ","Parking","Beach","Sports"], gradient:"linear-gradient(135deg,#DDA15E,#BC6C25)", soldWeek:2, viewsToday:8, hot:false, isNew:true },
  { name:"Marina Cape", zone:"Cabo Roig", type:"Apartamento", bedrooms:2, bathrooms:2, area:72, price:235000, totalUnits:36, availUnits:10, pool:true, parking:true, garden:false, terrace:true, completion:"Q3 2026", descEs:"Premium frente al paseo marítimo. Vistas al mar.", descEn:"Premium seafront apartments.", address:"Paseo Marítimo, Cabo Roig", developer:"Cape Developments", devPhone:"+34 966 345 678", featuresEs:["1ª línea","Cocina alemana","Grohe","Oscilobatientes","Trastero"], featuresEn:["Frontline","German kitchen","Grohe","Tilt-turn","Storage"], gradient:"linear-gradient(135deg,#023E8A,#0096C7)", soldWeek:3, viewsToday:19, hot:true, isNew:false },
  { name:"Mirador San Juan", zone:"San Juan", type:"Ático", bedrooms:3, bathrooms:2, area:120, price:385000, totalUnits:16, availUnits:5, pool:true, parking:true, garden:false, terrace:true, completion:"Q4 2026", descEs:"Áticos con terraza 60m². Solo 16 viviendas.", descEn:"Penthouses, 60m² terrace. Only 16 homes.", address:"Av. Playa 33, San Juan", developer:"Alicante Premium", devPhone:"+34 965 890 123", featuresEs:["Terraza 60m²","Jacuzzi","Domótica","Lujo","16 viv."], featuresEn:["60m² terrace","Jacuzzi","Automation","Luxury","16 homes"], gradient:"linear-gradient(135deg,#7B2CBF,#C77DFF)", soldWeek:1, viewsToday:12, hot:false, isNew:false },
  { name:"Costa Luz Residences", zone:"El Campello", type:"Apartamento", bedrooms:2, bathrooms:1, area:68, price:195000, totalUnits:54, availUnits:22, pool:true, parking:true, garden:true, terrace:true, completion:"Q1 2027", descEs:"El Campello, 5 min tranvía. Piscina y coworking.", descEn:"El Campello, 5 min tram. Pool & coworking.", address:"C/ Luz 7, El Campello", developer:"Campello Living", devPhone:"+34 965 012 345", featuresEs:["Piscina","Coworking","Bicis","Huerto","Cargador EV"], featuresEn:["Pool","Coworking","Bikes","Garden","EV charger"], gradient:"linear-gradient(135deg,#FF6B6B,#FFA07A)", soldWeek:6, viewsToday:31, hot:true, isNew:true },
];

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPass = await bcrypt.hash('admin2026', 10);
  await prisma.user.upsert({
    where: { email: 'janire@mariatomasa.com' },
    update: {},
    create: {
      email: 'janire@mariatomasa.com',
      password: adminPass,
      name: 'Janire Hortelano',
      agency: 'mariatomasa.com',
      role: 'ADMIN',
      level: 'PREFERRED',
      legalSigned: true,
      legalDate: new Date(),
    },
  });

  // Create demo agency user
  const agencyPass = await bcrypt.hash('demo2026', 10);
  await prisma.user.upsert({
    where: { email: 'demo@costablancahomes.com' },
    update: {},
    create: {
      email: 'demo@costablancahomes.com',
      password: agencyPass,
      name: 'Roberto García',
      agency: 'Costa Blanca Homes',
      phone: '+34 965 000 111',
      role: 'AGENCY',
      level: 'VERIFIED',
      legalSigned: true,
      legalDate: new Date(),
    },
  });

  // Seed properties
  for (const p of properties) {
    const existing = await prisma.property.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.property.create({ data: p });
    }
  }

  console.log('Seed complete: 2 users + 10 properties');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
