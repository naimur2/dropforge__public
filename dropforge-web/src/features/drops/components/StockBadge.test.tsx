import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StockBadge } from './StockBadge';

describe('StockBadge', () => {
  it('should display "SOLD OUT" when available stock is 0', () => {
    render(<StockBadge availableStock={0} totalStock={100} />);
    
    expect(screen.getByText('SOLD OUT')).toBeInTheDocument();
  });

  it('should display available and total stock when available > 0', () => {
    render(<StockBadge availableStock={50} totalStock={100} />);
    
    expect(screen.getByText('50 / 100 LEFT')).toBeInTheDocument();
  });

  it('should apply the correct styles when low stock (<= 10% of total or <= 5 items)', () => {
    // 5 out of 100 is 5% -> Low stock
    const { container } = render(<StockBadge availableStock={5} totalStock={100} />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('text-amber-500');
    expect(badge).toHaveClass('bg-amber-500/10');
  });

  it('should apply the correct styles when normal stock (> 10%)', () => {
    const { container } = render(<StockBadge availableStock={20} totalStock={100} />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('text-green-500');
    expect(badge).toHaveClass('bg-green-500/10');
  });
});
