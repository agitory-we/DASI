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

interface DasiContextType {
  rentingItems: RentingCameraItem[];
  ownedItems: OwnedCameraItem[];
  coupons: UserCoupon[];
  bookCameraRental: (item: Omit<RentingCameraItem, 'bookedAt' | 'isConvertedToOwn'>) => void;
  convertToOwn: (rentingId: string) => void;
  useCoupon: (couponId: string) => void;
  claimWelcomeCoupons: () => void;
  isWelcomeClaimed: boolean;
}

const DasiContext = createContext<DasiContextType | undefined>(undefined);

export const DasiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rentingItems, setRentingItems] = useState<RentingCameraItem[]>([]);
  const [ownedItems, setOwnedItems] = useState<OwnedCameraItem[]>([]);
  const [coupons, setCoupons] = useState<UserCoupon[]>(mockUserCoupons);
  const [isWelcomeClaimed, setIsWelcomeClaimed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedRenting = localStorage.getItem('dasi_renting_items');
      const savedOwned = localStorage.getItem('dasi_owned_items');
      const savedCoupons = localStorage.getItem('dasi_coupons');
      const savedWelcome = localStorage.getItem('dasi_welcome_claimed');

      if (savedRenting) {
        setRentingItems(JSON.parse(savedRenting));
      } else {
        // Default initial renting item
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
        // Default owned
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
      localStorage.setItem('dasi_welcome_claimed', JSON.stringify(isWelcomeClaimed));
    } catch (e) {
      console.error('Failed to save dasi storage', e);
    }
  }, [rentingItems, ownedItems, coupons, isWelcomeClaimed, isHydrated]);

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

  return (
    <DasiContext.Provider
      value={{
        rentingItems,
        ownedItems,
        coupons,
        bookCameraRental,
        convertToOwn,
        useCoupon,
        claimWelcomeCoupons,
        isWelcomeClaimed,
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
