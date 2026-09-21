import { supabase } from '@/lib/supabaseClient';
import { Camera, PickupShop, AnalogSpot, RepairMaster, PhotoGig, Experience, CameraCategory, ConditionGrade, SpotCategory, GigCategory } from '@/types';
import {
  mockCameras,
  mockPickupShops,
  mockAnalogSpots,
  mockMasters,
  mockPhotoGigs,
  mockExperiences
} from '@/data/mockData';

// 1. Fetch Cameras
export async function getCameras(): Promise<Camera[]> {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .select('*')
      .order('rating', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Supabase cameras fallback to mockData:', error?.message);
      return mockCameras;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      era: item.era || '',
      category: item.category as CameraCategory,
      conditionGrade: item.condition_grade as ConditionGrade,
      rentalPricePerDay: item.rental_price_per_day,
      purchasePrice: item.purchase_price,
      shopId: item.shop_id || '',
      shopName: item.shop_name,
      pickupLocation: item.pickup_location,
      imageUrl: item.image_url,
      sampleImages: (item.sample_images as string[]) || [],
      description: item.description,
      story: item.story,
      specs: (item.specs as any) || {
        lens: '',
        shutterSpeed: '',
        weight: '',
        battery: '',
        difficulty: '입문자 추천'
      },
      isAvailable: item.is_available,
      rating: Number(item.rating),
      reviewsCount: item.reviews_count
    }));
  } catch (err) {
    console.error('Error in getCameras:', err);
    return mockCameras;
  }
}

// 2. Fetch Pickup Shops
export async function getPickupShops(): Promise<PickupShop[]> {
  try {
    const { data, error } = await supabase
      .from('pickup_shops')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      console.warn('Supabase pickup_shops fallback to mockData:', error?.message);
      return mockPickupShops;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      area: item.area,
      address: item.address,
      masterName: item.master_name,
      masterExperienceYears: item.master_experience_years,
      masterQuote: item.master_quote,
      contact: item.contact,
      openHours: item.open_hours,
      lat: item.lat,
      lng: item.lng,
      imageUrl: item.image_url
    }));
  } catch (err) {
    console.error('Error in getPickupShops:', err);
    return mockPickupShops;
  }
}

// 3. Fetch Analog Spots
export async function getAnalogSpots(): Promise<AnalogSpot[]> {
  try {
    const { data, error } = await supabase
      .from('analog_spots')
      .select('*')
      .order('rating', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Supabase analog_spots fallback to mockData:', error?.message);
      return mockAnalogSpots;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category as SpotCategory,
      isMicroAdPartner: item.is_micro_ad_partner,
      partnerBadgeText: item.partner_badge_text || undefined,
      address: item.address,
      area: item.area,
      lat: item.lat,
      lng: item.lng,
      contact: item.contact,
      openHours: item.open_hours,
      todayScanCutoff: item.today_scan_cutoff || undefined,
      filmStockStatus: item.film_stock_status || undefined,
      scannerTypes: (item.scanner_types as string[]) || [],
      sampleColorToneImages: (item.sample_color_tone_images as any[]) || [],
      promoNotice: item.promo_notice || undefined,
      rating: Number(item.rating),
      reviewsCount: item.reviews_count
    }));
  } catch (err) {
    console.error('Error in getAnalogSpots:', err);
    return mockAnalogSpots;
  }
}

// 4. Fetch Repair Masters
export async function getRepairMasters(): Promise<RepairMaster[]> {
  try {
    const { data, error } = await supabase
      .from('repair_masters')
      .select('*');

    if (error || !data || data.length === 0) {
      console.warn('Supabase repair_masters fallback to mockData:', error?.message);
      return mockMasters;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      shopName: item.shop_name,
      specialty: item.specialty,
      experienceYears: item.experience_years,
      location: item.location,
      address: item.address,
      profileImage: item.profile_image,
      quote: item.quote,
      availableServices: (item.available_services as any[]) || []
    }));
  } catch (err) {
    console.error('Error in getRepairMasters:', err);
    return mockMasters;
  }
}

// 5. Fetch Photo Gigs
export async function getPhotoGigs(): Promise<PhotoGig[]> {
  try {
    const { data, error } = await supabase
      .from('photo_gigs')
      .select('*')
      .order('rating', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Supabase photo_gigs fallback to mockData:', error?.message);
      return mockPhotoGigs;
    }

    return data.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category as GigCategory,
      creatorName: item.creator_name,
      creatorAvatar: item.creator_avatar,
      location: item.location,
      gearUsed: (item.gear_used as string[]) || [],
      pricePerHour: item.price_per_hour,
      durationMinutes: item.duration_minutes,
      rating: Number(item.rating),
      reviewsCount: item.reviews_count,
      portfolioImages: (item.portfolio_images as string[]) || [],
      tags: (item.tags as string[]) || [],
      description: item.description,
      isVerified: item.is_verified,
      languages: (item.languages as string[]) || ['한국어']
    }));
  } catch (err) {
    console.error('Error in getPhotoGigs:', err);
    return mockPhotoGigs;
  }
}

// 6. Fetch Experiences
export async function getExperiences(): Promise<Experience[]> {
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('price', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Supabase experiences fallback to mockData:', error?.message);
      return mockExperiences;
    }

    return data.map(item => ({
      id: item.id,
      type: item.type as 'photo_walk' | 'master_class',
      title: item.title,
      hostName: item.host_name,
      hostRole: item.host_role,
      hostAvatar: item.host_avatar,
      location: item.location,
      dateTime: item.date_time,
      duration: item.duration,
      price: item.price,
      rentalPackageDiscount: item.rental_package_discount,
      capacity: item.capacity,
      description: item.description,
      imageUrl: item.image_url,
      included: (item.included as string[]) || []
    }));
  } catch (err) {
    console.error('Error in getExperiences:', err);
    return mockExperiences;
  }
}

// 7. Save Rental Booking
export async function saveRentalBooking(rental: {
  id: string;
  cameraId?: string;
  cameraName: string;
  brand: string;
  shopName: string;
  imageUrl: string;
  rentalDays: number;
  rentalPaid: number;
  purchaseTotal: number;
  isConvertedToOwn?: boolean;
}) {
  try {
    const { error } = await supabase.from('rentals').insert({
      id: rental.id,
      camera_id: rental.cameraId || null,
      camera_name: rental.cameraName,
      brand: rental.brand,
      shop_name: rental.shopName,
      image_url: rental.imageUrl,
      rental_days: rental.rentalDays,
      rental_paid: rental.rentalPaid,
      purchase_total: rental.purchaseTotal,
      is_converted_to_own: rental.isConvertedToOwn ?? false
    });
    if (error) console.error('Error saving rental to Supabase:', error);
  } catch (err) {
    console.error('saveRentalBooking exception:', err);
  }
}

// 8. Update Rent-to-Own Status
export async function updateRentToOwnStatus(rentalId: string) {
  try {
    const { error } = await supabase
      .from('rentals')
      .update({ is_converted_to_own: true })
      .eq('id', rentalId);
    if (error) console.error('Error updating rent-to-own status:', error);
  } catch (err) {
    console.error('updateRentToOwnStatus exception:', err);
  }
}

// 9. Save Repair Estimate Inquiry
export async function saveRepairEstimateInquiry(inquiry: {
  id: string;
  cameraModel: string;
  symptoms: string[];
  details: string;
  masterName: string;
  estimateCode: string;
}) {
  try {
    const { error } = await supabase.from('repair_estimates').insert({
      id: inquiry.id,
      camera_model: inquiry.cameraModel,
      symptoms: inquiry.symptoms,
      details: inquiry.details,
      master_name: inquiry.masterName,
      estimate_code: inquiry.estimateCode,
      status: 'diagnosing'
    });
    if (error) console.error('Error saving repair estimate:', error);
  } catch (err) {
    console.error('saveRepairEstimateInquiry exception:', err);
  }
}