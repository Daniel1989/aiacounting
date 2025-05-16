'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Home, PiggyBank, BarChart, Settings, Heart } from 'lucide-react';
import { styled } from 'styled-components';

interface NavProps {
  locale: string;
}

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #f0f0f0;
  padding: 8px 0;
  z-index: 100;
`;

const NavList = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: ${props => props.active ? '#53a867' : '#999'};
  
  > span {
    margin-top: 4px;
  }
`;

export function Nav({ locale }: NavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('nav');
  
  // Convert search params to object for Link component
  const queryParams = Object.fromEntries(searchParams);
  
  const navItems = [
    { href: `/${locale}`, icon: Home, label: t('today') },
    { href: `/${locale}/records/new`, icon: PiggyBank, label: t('addRecord') },
    { href: `/${locale}/statistics`, icon: BarChart, label: t('statistics') },
    // { href: `/${locale}/wishlist`, icon: Heart, label: t('wishlist') },
    { href: `/${locale}/settings`, icon: Settings, label: t('settings') }
  ];

  if(pathname.includes('privacy') || pathname.includes("terms")) {
    return null
  }
  
  return (
    <NavContainer>
      <NavList>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (pathname.startsWith(href + '/') && href !== '/zh' && href !== '/en');
          return (
            <Link 
              key={href} 
              href={{
                pathname: href,
                query: queryParams
              }} 
              style={{ textDecoration: 'none' }}
            >
              <NavItem active={isActive}>
                <Icon size={24} />
                <span>{label}</span>
              </NavItem>
            </Link>
          );
        })}
      </NavList>
    </NavContainer>
  );
} 