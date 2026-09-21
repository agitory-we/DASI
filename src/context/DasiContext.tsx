'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  PickupShop,
  AnalogSpot,
  RepairMaster,
  PhotoGig,
  Experience,
  UserCoupon,
  ProConsultationItem
} from '@/types';
import {
  mockUserCoupons,
  mockCameras,
  mockPickupShops,
  mockAnalogSpots,
  mockMasters,
  mockPhotoGigs,
  mockExperiences
} from '@/data/mockData';
import {
  getCameras,
  getPickupShops,
  getAnalogSpots,
  getRepairMasters,
  getPhotoGigs,
  getExperiences,
  saveRentalBooking,
  updateRentToOwnStatus,
  saveRepairEstimateInquiry
} from '@/services/dasiService';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export interface RentingCameraItem {
  id: string;
  name: string;
  brand: string;
  rentalPaid: number;
  purchaseTotal: number;
  rentalDays: number;
  shopName: string;
  imageUrl: string;
  bookedAt: string;
  isConvertedToOwn: boolean;
}

export interface OwnedCameraItem {
  id: string;
  name: string;
  serial: string;
  acquiredDate: string;
  condition: string;
  masterInspection: string;
  imageUrl: string;
}

export interface BookedGigItem {
  id: string;
  gigId: string;
  title: string;
  creatorName: string;
  location: string;
  price: number;
  scheduledAt: string;
  bookedAt: string;
  status: 'escrow_held' | 'completed';
}

export interface BookedExperienceItem {
  id: string;
  experienceId: string;
  title: string;
  hostName: string;
  location: string;
  dateTime: string;
  price: number;
  hasRentalPackage: boolean;
  ticketCode: string;
  bookedAt: string;
  status: 'confirmed' | 'attended';
}

export interface RepairEstimateItem {
  id: string;
  cameraModel: string;
  symptoms: string[];
  details: string;
  masterName: string;
  estimateCode: string;
  requestedAt: string;
  status: 'diagnosing' | 'repairing' | 'completed';
}

interface DasiContextType {
  // Master Data from Supabase
  cameras: Camera[];
  pickupShops: PickupShop[];
  analogSpots: AnalogSpot[];
  repairMasters: RepairMaster[];
  photoGigs: PhotoGig[];
  experiences: Experience[];
  isLoadingData: boolean;
  refreshData: () => Promise<void>;

  // User Interactive State
  rentingItems: RentingCameraItem[];
  ownedItems: OwnedCameraItem[];
  coupons: UserCoupon[];
  bookedGigs: BookedGigItem[];
  bookedExperiences: BookedExperienceItem[];
  repairEstimates: RepairEstimateItem[];
  proConsultations: ProConsultationItem[];
  savedSpotIds: string[];
  bookCameraRental: (item: Omit<RentingCameraItem, 'bookedAt' | 'isConvertedToOwn'>) => void;
  convertToOwn: (rentingId: string) => void;
  addOwnedCamera: (item: Omit<OwnedCameraItem, 'id'>) => string;
  useCoupon: (couponId: string) => void;
  claimWelcomeCoupons: () => void;
  isWelcomeClaimed: boolean;
  bookGig: (item: Omit<BookedGigItem, 'id' | 'bookedAt' | 'status'>) => void;
  bookExperience: (item: Omit<BookedExperienceItem, 'id' | 'ticketCode' | 'bookedAt' | 'status'>) => string;
  submitRepairEstimate: (item: Omit<RepairEstimateItem, 'id' | 'estimateCode' | 'requestedAt' | 'status'>) => string;
  bookProConsultation: (item: Omit<ProConsultationItem, 'id' | 'vipCode' | 'requestedAt' | 'status'>) => string;
  toggleSaveSpot: (spotId: string) => void;
  toast: { message: string; type: 'info' | 'success' | 'warning' } | null;
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

const DasiContext = createContext<DasiContextType | undefined>(undefined);

export const DasiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Master entities
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [pickupShops, setPickupShops] = useState<PickupShop[]>(mockPickupShops);
  const [analogSpots, setAnalogSpots] = useState<AnalogSpot[]>(mockAnalogSpots);
  const [repairMasters, setRepairMasters] = useState<RepairMaster[]>(mockMasters);
  const [photoGigs, setPhotoGigs] = useState<PhotoGig[]>(mockPhotoGigs);
  const [experiences, setExperiences] = useState<Experience[]>(mockExperiences);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // User state
  const [rentingItems, setRentingItems] = useState<RentingCameraItem[]>([]);
  const [ownedItems, setOwnedItems] = useState<OwnedCameraItem[]>([]);
  const [coupons, setCoupons] = useState<UserCoupon[]>(mockUserCoupons);
  const [bookedGigs, setBookedGigs] = useState<BookedGigItem[]>([]);
  const [bookedExperiences, setBookedExperiences] = useState<BookedExperienceItem[]>([]);
  const [repairEstimates, setRepairEstimates] = useState<RepairEstimateItem[]>([]);
  const [proConsultations, setProConsultations] = useState<ProConsultationItem[]>([]);
  const [savedSpotIds, setSavedSpotIds] = useState<string[]>(['spot-1', 'spot-3']);
  const [isWelcomeClaimed, setIsWelcomeClaimed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch all master data from Supabase
  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [cams, shops, spots, masters, gigs, exps] = await Promise.all([
        getCameras(),
        getPickupShops(),
        getAnalogSpots(),
        getRepairMasters(),
        getPhotoGigs(),
        getExperiences()
      ]);
      setCameras(cams);
      setPickupShops(shops);
      setAnalogSpots(spots);
      setRepairMasters(masters);
      setPhotoGigs(gigs);
      setExperiences(exps);
    } catch (err) {
      console.error('Failed to refresh data from Supabase:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedRenting = localStorage.getItem('dasi_renting_items');
      const savedOwned = localStorage.getItem('dasi_owned_items');
      const savedCoupons = localStorage.getItem('dasi_coupons');
      const savedGigs = localStorage.getItem('dasi_booked_gigs');
      const savedExps = localStorage.getItem('dasi_booked_exps');
      const savedRepairs = localStorage.getItem('dasi_repair_estimates');
      const savedWelcome = localStorage.getItem('dasi_welcome_claimed');

      if (savedRenting) {
        setRentingItems(JSON.parse(savedRenting));
      } else {
        setRentingItems([
          {
            id: 'rent-initial-1',
            name: 'Olympus PEN EE-3',
            brand: 'Olympus',
            rentalPaid: 36000,
            purchaseTotal: 190000,
            rentalDays: 2,
            shopName: '을지로 신성카메라 (대림상가 3층)',
            imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
            bookedAt: '2026.09.21',
            isConvertedToOwn: false,
          },
        ]);
      }

      if (savedOwned) {
        setOwnedItems(JSON.parse(savedOwned));
      } else {
        setOwnedItems([
          {
            id: 'own-initial-1',
            name: 'Nikon FM2 (실버)',
            serial: 'N7482910',
            acquiredDate: '2026.08.15 (Rent-to-Own 전환 소장)',
            condition: 'Excellent',
            masterInspection: '충무로 보성광학 김상철 장인 오버홀 완료',
            imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
          },
        ]);
      }

      if (savedCoupons) {
        setCoupons(JSON.parse(savedCoupons));
      }

      if (savedGigs) {
        setBookedGigs(JSON.parse(savedGigs));
      } else {
        setBookedGigs([
          {
            id: 'gig-booked-init-1',
            gigId: 'gig-1',
            title: '성수동 붉은 벽돌 & 카페 골목 필름/디카 스냅',
            creatorName: '이하은 작가',
            location: '성수동 카페거리 일대',
            price: 45000,
            scheduledAt: '2026.09.28 15:00',
            bookedAt: '2026.09.21',
            status: 'escrow_held',
          },
        ]);
      }

      if (savedExps) {
        setBookedExperiences(JSON.parse(savedExps));
      } else {
        setBookedExperiences([
          {
            id: 'exp-booked-init-1',
            experienceId: 'exp-1',
            title: '을지로 골목길 매직아워 출사 & 흑백 필름 감성 워크',
            hostName: '김민우 사진작가',
            location: '을지로3가역 세운상가 3층 집결',
            dateTime: '2026.09.26 (토) 16:30',
            price: 35000,
            hasRentalPackage: true,
            ticketCode: 'TKT-EXP-9921',
            bookedAt: '2026.09.21',
            status: 'confirmed',
          },
        ]);
      }

      if (savedRepairs) {
        setRepairEstimates(JSON.parse(savedRepairs));
      }

      const savedPros = localStorage.getItem('dasi_pro_consultations');
      if (savedPros) {
        setProConsultations(JSON.parse(savedPros));
      } else {
        setProConsultations([
          {
            id: 'pro-init-1',
            vipCode: 'PRO-VIP-881920',
            studioName: 'ATELIER DE NOIR (아틀리에 드 누아)',
            artistName: '최서우 수석 실장',
            category: '본식 하이엔드 웨딩 & 리허설 스냅',
            pricing: '본식 2인 촬영 1,800,000원부터',
            targetDate: '2026.10.17',
            location: '신라호텔 영빈관',
            contact: '010-8291-7721',
            requestedAt: '2026.09.21',
            status: 'manager_contacting',
          },
        ]);
      }

      const savedSpots = localStorage.getItem('dasi_saved_spot_ids');
      if (savedSpots) {
        setSavedSpotIds(JSON.parse(savedSpots));
      }

      if (savedWelcome) {
        setIsWelcomeClaimed(JSON.parse(savedWelcome));
      }
    } catch (e) {
      console.error('Failed to load dasi storage', e);
    }
    setIsHydrated(true);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('dasi_renting_items', JSON.stringify(rentingItems));
      localStorage.setItem('dasi_owned_items', JSON.stringify(ownedItems));
      localStorage.setItem('dasi_coupons', JSON.stringify(coupons));
      localStorage.setItem('dasi_booked_gigs', JSON.stringify(bookedGigs));
      localStorage.setItem('dasi_booked_exps', JSON.stringify(bookedExperiences));
      localStorage.setItem('dasi_repair_estimates', JSON.stringify(repairEstimates));
      localStorage.setItem('dasi_pro_consultations', JSON.stringify(proConsultations));
      localStorage.setItem('dasi_saved_spot_ids', JSON.stringify(savedSpotIds));
      localStorage.setItem('dasi_welcome_claimed', JSON.stringify(isWelcomeClaimed));
    } catch (e) {
      console.error('Failed to save dasi storage', e);
    }
  }, [rentingItems, ownedItems, coupons, bookedGigs, bookedExperiences, repairEstimates, proConsultations, savedSpotIds, isWelcomeClaimed, isHydrated]);

  const bookCameraRental = (item: Omit<RentingCameraItem, 'bookedAt' | 'isConvertedToOwn'>) => {
    const newItem: RentingCameraItem = {
      ...item,
      bookedAt: new Date().toISOString().slice(0, 10),
      isConvertedToOwn: false,
    };
    setRentingItems((prev) => [newItem, ...prev]);

    // Async sync to Supabase
    saveRentalBooking({
      id: newItem.id,
      cameraName: newItem.name,
      brand: newItem.brand,
      shopName: newItem.shopName,
      imageUrl: newItem.imageUrl,
      rentalDays: newItem.rentalDays,
      rentalPaid: newItem.rentalPaid,
      purchaseTotal: newItem.purchaseTotal,
      isConvertedToOwn: false
    });
  };

  const convertToOwn = (rentingId: string) => {
    const target = rentingItems.find((r) => r.id === rentingId);
    if (!target) return;

    setRentingItems((prev) =>
      prev.map((r) => (r.id === rentingId ? { ...r, isConvertedToOwn: true } : r))
    );

    const newOwned: OwnedCameraItem = {
      id: `own-${Date.now()}`,
      name: target.name,
      serial: `DASI-SN-${Math.floor(100000 + Math.random() * 900000)}`,
      acquiredDate: `${new Date().toISOString().slice(0, 10)} (Rent-to-Own 즉시 소장)`,
      condition: 'Mint',
      masterInspection: `${target.shopName} 정밀 점검 완료`,
      imageUrl: target.imageUrl,
    };

    setOwnedItems((prev) => [newOwned, ...prev]);

    // Async sync to Supabase
    updateRentToOwnStatus(rentingId);
  };

  const addOwnedCamera = (item: Omit<OwnedCameraItem, 'id'>) => {
    const id = `own-${Date.now()}`;
    const newOwned: OwnedCameraItem = {
      ...item,
      id,
    };
    setOwnedItems((prev) => [newOwned, ...prev]);
    return id;
  };

  const useCoupon = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isUsed: true } : c))
    );
  };

  const claimWelcomeCoupons = () => {
    setIsWelcomeClaimed(true);
  };

  const bookGig = (item: Omit<BookedGigItem, 'id' | 'bookedAt' | 'status'>) => {
    const newGig: BookedGigItem = {
      ...item,
      id: `gig-booked-${Date.now()}`,
      bookedAt: new Date().toISOString().slice(0, 10),
      status: 'escrow_held',
    };
    setBookedGigs((prev) => [newGig, ...prev]);
  };

  const bookExperience = (item: Omit<BookedExperienceItem, 'id' | 'ticketCode' | 'bookedAt' | 'status'>) => {
    const ticketCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const newExp: BookedExperienceItem = {
      ...item,
      id: `exp-booked-${Date.now()}`,
      ticketCode,
      bookedAt: new Date().toISOString().slice(0, 10),
      status: 'confirmed',
    };
    setBookedExperiences((prev) => [newExp, ...prev]);
    return ticketCode;
  };

  const submitRepairEstimate = (item: Omit<RepairEstimateItem, 'id' | 'estimateCode' | 'requestedAt' | 'status'>) => {
    const estimateCode = `EST-${Math.floor(100000 + Math.random() * 900000)}`;
    const newEstimate: RepairEstimateItem = {
      ...item,
      id: `rep-est-${Date.now()}`,
      estimateCode,
      requestedAt: new Date().toISOString().slice(0, 10),
      status: 'diagnosing',
    };
    setRepairEstimates((prev) => [newEstimate, ...prev]);

    // Async sync to Supabase
    saveRepairEstimateInquiry({
      id: newEstimate.id,
      cameraModel: newEstimate.cameraModel,
      symptoms: newEstimate.symptoms,
      details: newEstimate.details,
      masterName: newEstimate.masterName,
      estimateCode: newEstimate.estimateCode
    });

    return estimateCode;
  };

  const bookProConsultation = (item: Omit<ProConsultationItem, 'id' | 'vipCode' | 'requestedAt' | 'status'>) => {
    const vipCode = `PRO-VIP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newConsult: ProConsultationItem = {
      ...item,
      id: `pro-cons-${Date.now()}`,
      vipCode,
      requestedAt: new Date().toISOString().slice(0, 10),
      status: 'manager_contacting',
    };
    setProConsultations((prev) => [newConsult, ...prev]);
    return vipCode;
  };

  const toggleSaveSpot = (spotId: string) => {
    setSavedSpotIds((prev) => {
      const exists = prev.includes(spotId);
      if (exists) {
        showToast('출사 위시리스트에서 제외되었습니다.', 'info');
        return prev.filter((id) => id !== spotId);
      } else {
        showToast('출사 위시리스트에 저장되었습니다.', 'success');
        return [...prev, spotId];
      }
    });
  };

  return (
    <DasiContext.Provider
      value={{
        cameras,
        pickupShops,
        analogSpots,
        repairMasters,
        photoGigs,
        experiences,
        isLoadingData,
        refreshData,
        rentingItems,
        ownedItems,
        coupons,
        bookedGigs,
        bookedExperiences,
        repairEstimates,
        proConsultations,
        savedSpotIds,
        bookCameraRental,
        convertToOwn,
        addOwnedCamera,
        useCoupon,
        claimWelcomeCoupons,
        isWelcomeClaimed,
        bookGig,
        bookExperience,
        submitRepairEstimate,
        bookProConsultation,
        toggleSaveSpot,
        toast,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-20 md:bottom-8 right-1/2 translate-x-1/2 md:translate-x-0 md:right-8 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-vintage-950/95 text-white shadow-2xl border border-vintage-700/60 backdrop-blur-md animate-fadeIn text-xs sm:text-sm font-medium">
          {toast.type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : toast.type === 'warning' ? (
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-terracotta/20 text-terracotta flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
          <span className="leading-snug">{toast.message}</span>
        </div>
      )}
    </DasiContext.Provider>
  );
};

export const useDasi = () => {
  const context = useContext(DasiContext);
  if (!context) {
    throw new Error('useDasi must be used within a DasiProvider');
  }
  return context;
};