import { createClient } from '@supabase/supabase-js';
import {
  mockPickupShops,
  mockCameras,
  mockAnalogSpots,
  mockMasters,
  mockPhotoGigs,
  mockExperiences
} from '../src/data/mockData';

const supabaseUrl = 'https://mqqkbudvnrlpexkonlyp.supabase.co';
const supabaseAnonKey = 'sb_publishable_QaJbxq7lKASow7lpdZUzfw_D2QFuPxS';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Seeding Supabase database...');

  // 1. Pickup Shops
  console.log('1. Inserting Pickup Shops...');
  const shopRows = mockPickupShops.map(shop => ({
    id: shop.id,
    name: shop.name,
    area: shop.area,
    address: shop.address,
    master_name: shop.masterName,
    master_experience_years: shop.masterExperienceYears,
    master_quote: shop.masterQuote,
    contact: shop.contact,
    open_hours: shop.openHours,
    lat: shop.lat,
    lng: shop.lng,
    image_url: shop.imageUrl
  }));
  const { error: shopErr } = await supabase.from('pickup_shops').upsert(shopRows);
  if (shopErr) console.error('Error seeding pickup_shops:', shopErr);
  else console.log('Successfully inserted ' + shopRows.length + ' pickup shops');

  // 2. Cameras
  console.log('2. Inserting Cameras...');
  const cameraRows = mockCameras.map(cam => ({
    id: cam.id,
    name: cam.name,
    brand: cam.brand,
    era: cam.era,
    category: cam.category,
    condition_grade: cam.conditionGrade,
    rental_price_per_day: cam.rentalPricePerDay,
    purchase_price: cam.purchasePrice,
    shop_id: cam.shopId,
    shop_name: cam.shopName,
    pickup_location: cam.pickupLocation,
    image_url: cam.imageUrl,
    sample_images: cam.sampleImages,
    description: cam.description,
    story: cam.story,
    specs: cam.specs,
    is_available: cam.isAvailable,
    rating: cam.rating,
    reviews_count: cam.reviewsCount
  }));
  const { error: camErr } = await supabase.from('cameras').upsert(cameraRows);
  if (camErr) console.error('Error seeding cameras:', camErr);
  else console.log('Successfully inserted ' + cameraRows.length + ' cameras');

  // 3. Analog Spots
  console.log('3. Inserting Analog Spots...');
  const spotRows = mockAnalogSpots.map(spot => ({
    id: spot.id,
    name: spot.name,
    category: spot.category,
    is_micro_ad_partner: spot.isMicroAdPartner,
    partner_badge_text: spot.partnerBadgeText || null,
    address: spot.address,
    area: spot.area,
    lat: spot.lat,
    lng: spot.lng,
    contact: spot.contact,
    open_hours: spot.openHours,
    today_scan_cutoff: spot.todayScanCutoff || null,
    film_stock_status: spot.filmStockStatus || null,
    scanner_types: spot.scannerTypes || [],
    sample_color_tone_images: spot.sampleColorToneImages || [],
    promo_notice: spot.promoNotice || null,
    rating: spot.rating,
    reviews_count: spot.reviewsCount
  }));
  const { error: spotErr } = await supabase.from('analog_spots').upsert(spotRows);
  if (spotErr) console.error('Error seeding analog_spots:', spotErr);
  else console.log('Successfully inserted ' + spotRows.length + ' analog spots');

  // 4. Repair Masters
  console.log('4. Inserting Repair Masters...');
  const masterRows = mockMasters.map(m => ({
    id: m.id,
    name: m.name,
    shop_name: m.shopName,
    specialty: m.specialty,
    experience_years: m.experienceYears,
    location: m.location,
    address: m.address,
    profile_image: m.profileImage,
    quote: m.quote,
    available_services: m.availableServices
  }));
  const { error: masterErr } = await supabase.from('repair_masters').upsert(masterRows);
  if (masterErr) console.error('Error seeding repair_masters:', masterErr);
  else console.log('Successfully inserted ' + masterRows.length + ' repair masters');

  // 5. Photo Gigs
  console.log('5. Inserting Photo Gigs...');
  const gigRows = mockPhotoGigs.map(g => ({
    id: g.id,
    title: g.title,
    category: g.category,
    creator_name: g.creatorName,
    creator_avatar: g.creatorAvatar,
    location: g.location,
    gear_used: g.gearUsed,
    price_per_hour: g.pricePerHour,
    duration_minutes: g.durationMinutes,
    rating: g.rating,
    reviews_count: g.reviewsCount,
    portfolio_images: g.portfolioImages,
    tags: g.tags,
    description: g.description,
    is_verified: g.isVerified,
    languages: g.languages || ['한국어']
  }));
  const { error: gigErr } = await supabase.from('photo_gigs').upsert(gigRows);
  if (gigErr) console.error('Error seeding photo_gigs:', gigErr);
  else console.log('Successfully inserted ' + gigRows.length + ' photo gigs');

  // 6. Experiences
  console.log('6. Inserting Experiences...');
  const expRows = mockExperiences.map(e => ({
    id: e.id,
    type: e.type,
    title: e.title,
    host_name: e.hostName,
    host_role: e.hostRole,
    host_avatar: e.hostAvatar,
    location: e.location,
    date_time: e.dateTime,
    duration: e.duration,
    price: e.price,
    rental_package_discount: e.rentalPackageDiscount,
    capacity: e.capacity,
    description: e.description,
    image_url: e.imageUrl,
    included: e.included
  }));
  const { error: expErr } = await supabase.from('experiences').upsert(expRows);
  if (expErr) console.error('Error seeding experiences:', expErr);
  else console.log('Successfully inserted ' + expRows.length + ' experiences');

  console.log('🎉 Seeding completed successfully!');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});