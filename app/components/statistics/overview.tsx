'use client';

import { styled } from 'styled-components';
import { LineChart } from './line-chart';

interface OverviewProps {
  userId: string;
  date: Date;
  locale: string;
}

// Styled components to match the legacy styling
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export function Overview({ userId, date, locale }: OverviewProps) {
  return (
    <Container>
      <LineChart userId={userId} date={date} locale={locale} />
    </Container>
  );
} 