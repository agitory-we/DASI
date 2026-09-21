'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserCoupon } from '@/types';
import { mockUserCoupons } from '@/data/mockData';

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
  rentingItems: RentingCameraItem[];
  ownedItems: OwnedCameraItem[];
  coupons: UserCoupon[];
  bookedGigs: BookedGigItem[];
  bookedExperiences: BookedExperienceItem[];
  repairEstimates: RepairEstimateItem[];
  bookCameraRental: (item: Omit<RentingCameraItem, 'bookedAt' | 'isConvertedToOwn'>) => void;
  convertToOwn: (rentingId: string) => void;
  useCoupon: (couponId: string) => void;
  claimWelcomeCoupons: () => void;
  isWelcomeClaimed: boolean;
  bookGig: (item: Omit<BookedGigItem, 'id' | 'bookedAt' | 'status'>) => void;
  bookExperience: (item: Omit<BookedExperienceItem, 'id' | 'ticketCode' | 'bookedAt' | 'status'>) => string;
  submitRepairEstimate: (item: Omit<RepairEstimateItem, 'id' | 'estimateCode' | 'requestedAt' | 'status'>) => string;
}

const DasiContext = createContext<DasiContextType | undefined>(undefined);

export const DasiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rentingItems, setRentingItems] = useState<RentingCameraItem[]>([]);
  const [ownedItems, setOwnedItems] = useState<OwnedCameraItem[]>([]);
  const [coupons, setCoupons] = useState<UserCoupon[]>(mockUserCoupons);
  const [bookedGigs, setBookedGigs] = useState<BookedGigItem[]>([]);
  const [bookedExperiences, setBookedExperiences] = useState<BookedExperienceItem[]>([]);
  const [repairEstimates, setRepairEstimates] = useState<RepairEstimateItem[]>([]);
  const [isWelcomeClaimed, setIsWelcomeClaimed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

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
      localStorage.setItem('dasi_welcome_claimed', JSON.stringify(isWelcomeClaimed));
    } catch (e) {
      console.error('Failed to save dasi storage', e);
    }
  }, [rentingItems, ownedItems, coupons, bookedGigs, bookedExperiences, repairEstimates, isWelcomeClaimed, isHydrated]);

  const bookCameraRental = (item: Omit<RentingCameraItem, 'bookedAt' | 'isConvertedToOwn'>) => {
    const newItem: RentingCameraItem = {
      ...item,
      bookedAt: new Date().toISOString().slice(0, 10),
      isConvertedToOwn: false,
    };
    setRentingItems((prev) => [newItem, ...prev]);
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
    return estimateCode;
  };

  return (
    <DasiContext.Provider
      value={{
        rentingItems,
        ownedItems,
        coupons,
        bookedGigs,
        bookedExperiences,
        repairEstimates,
        bookCameraRental,
        convertToOwn,
        useCoupon,
        claimWelcomeCoupons,
        isWelcomeClaimed,
        bookGig,
        bookExperience,
        submitRepairEstimate,
      }}
    >
      {children}
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
