'use client';

import { useTranslations } from 'next-intl';
import { styled } from 'styled-components';
import { Plane, ShoppingBag, PiggyBank } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WishlistContentProps {
  userId: string;
  locale: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  padding: 16px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
  
  > .title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  > .subtitle {
    font-size: 14px;
    color: #666;
  }
`;

const GoalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GoalCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  > .icon-container {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.travel {
      background: #4a90e2;
      color: white;
    }
    
    &.shopping {
      background: #9b59b6;
      color: white;
    }
    
    &.savings {
      background: #2ecc71;
      color: white;
    }
  }
  
  > .content {
    flex: 1;
    
    > .title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    > .description {
      font-size: 14px;
      color: #666;
    }
  }
`;

export default function WishlistContent({ userId, locale }: WishlistContentProps) {
  const t = useTranslations('wishlist');
  const router = useRouter();
  
  const goals = [
    {
      id: 'travel',
      icon: <Plane size={24} />,
      title: t('travel.title'),
      description: t('travel.description'),
    },
    {
      id: 'shopping',
      icon: <ShoppingBag size={24} />,
      title: t('shopping.title'),
      description: t('shopping.description'),
    },
    {
      id: 'savings',
      icon: <PiggyBank size={24} />,
      title: t('savings.title'),
      description: t('savings.description'),
    },
  ];
  
  return (
    <Container>
      <Header>
        <div className="title">{t('title')}</div>
        <div className="subtitle">{t('subtitle')}</div>
      </Header>
      
      <GoalList>
        {goals.map((goal) => (
          <GoalCard 
            key={goal.id}
            onClick={() => router.push(`/${locale}/wishlist/${goal.id}`)}
          >
            <div className={`icon-container ${goal.id}`}>
              {goal.icon}
            </div>
            <div className="content">
              <div className="title">{goal.title}</div>
              <div className="description">{goal.description}</div>
            </div>
          </GoalCard>
        ))}
      </GoalList>
    </Container>
  );
} 