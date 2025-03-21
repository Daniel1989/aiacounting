'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Decimal from 'decimal.js';
import { RecentRecords } from './recent-records';
import { ImageUpload } from './image-upload';

interface HomeContentProps {
  userId: string | null;
}

interface RecordItem {
  id: string;
  user_id: string;
  amount: number;
  category: 'income' | 'cost';
  tag_id: number;
  created_at: string;
}

export function HomeContent({ userId }: HomeContentProps) {
  const t = useTranslations('home');
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'en';
  const [visible, setVisible] = useState(false);
  const [recordList, setRecordList] = useState<RecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!userId);
  const supabase = createClient();
  
  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      setIsCheckingAuth(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        // If we have a userId from props but no session, refresh the page
        // This can happen when the server thinks we're logged in but the client session is missing
        if (userId && !session) {
          router.refresh();
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        router.refresh();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, userId, router]);
  
  // Get current date in ISO format
  const current = new Date();
  const timestamp = current.toISOString();
  const todayDate = timestamp.slice(0, 10);
  
  // Filter today's records
  const todayRecordList = recordList.filter(item => 
    item.created_at.includes(todayDate)
  );
  
  // Calculate today's income
  const todayTotalIncome = todayRecordList.reduce((total, item) =>
    item.category === 'income' ? 
    total.plus(item.amount) : 
    total, new Decimal(0)).toNumber();
  
  // Calculate today's expenses
  const todayTotalCost = todayRecordList.reduce((total, item) =>
    item.category === 'cost' ?
    total.plus(item.amount) : 
    total, new Decimal(0)).toNumber();
  
  // Fetch recent records from Supabase
  useEffect(() => {
    async function fetchRecords() {
      console.log('fetchRecords', userId, isAuthenticated);
      if (!userId || !isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      // Calculate date 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
      
      try {
        // Fetch records from the last 3 days
        const { data, error } = await supabase
          .from('records')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', threeDaysAgo.toISOString())
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching records:', error);
          setRecordList([]);
        } else {
          setRecordList(data || []);
        }
      } catch (err) {
        console.error('Exception fetching records:', err);
        setRecordList([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRecords();
  }, [userId, supabase, isAuthenticated]);
  
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse">{t('loading')}</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">{t('pleaseLogin')}</p>
        <Link 
          href={`/${locale}/login`}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
        >
          {t('login')}
        </Link>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse">{t('loading')}</div>
      </div>
    );
  }
  
  return (
    <>
      {/* Today's totals - styled like the legacy Total component */}
      <div className="text-emerald-500 flex flex-col items-center justify-center text-sm my-24">
        <span>{t('todayExpenses')}</span>
        <span className="text-3xl font-bold my-1">￥{todayTotalCost}</span>
        <span className="text-gray-400">{t('income')} ￥{todayTotalIncome}</span>
      </div>
      
      {/* Add record button - styled like the legacy RecordButton component */}
      <div className="flex justify-center items-center my-5">
        <Link 
          href={`/${locale}/records/new`}
          className="text-sm px-8 py-2 bg-emerald-200 border-2 border-emerald-300 rounded-lg text-gray-800"
        >
          {t('addRecord')}
        </Link>
      </div>
      
      {/* Image Upload Component */}
      {userId && <ImageUpload userId={userId} />}
      
      {/* Toggle recent records - styled like the legacy ShowRecordButton component */}
      <button 
        onClick={() => setVisible(!visible)}
        className="text-center text-gray-400 my-5 w-full"
      >
        {t('showRecentRecords')}
        {visible ? 
          <ChevronUp className="inline-block ml-1 w-5 h-5 transform transition-transform" /> : 
          <ChevronDown className="inline-block ml-1 w-5 h-5 transform transition-transform" />
        }
      </button>
      
      {/* Recent records */}
      {visible && <RecentRecords records={recordList} />}
    </>
  );
} 