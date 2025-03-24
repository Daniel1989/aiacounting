'use client';

import { styled } from 'styled-components';
import { LineChart } from './line-chart';

interface OverviewProps {
  userId: string;
  locale: string;
  date: Date;
}

// Styled components to match the legacy styling
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export function Overview({ userId, locale, date }: OverviewProps) {
  // Pass the date to LineChart for month filtering
  return (
    <Container>
      <LineChart userId={userId} locale={locale} date={date} />
    </Container>
  );
} 