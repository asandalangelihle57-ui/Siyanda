export interface DeadlineRiskInfo {
  daysRemaining: number;
  hoursRemaining: number;
  isPastDue: boolean;
  riskLevel: 'High' | 'Medium' | 'Low';
  riskLabel: string;
  badgeClass: string;
  textClass: string;
  bgClass: string;
}

/**
 * Evaluates deadline risk based on user rule:
 * - Deadline has passed or a few days left / hourly due (<= 3 days): High Risk
 * - <= 15 days left (4 to 15 days): Medium Risk
 * - <= 30 days left (or > 15 days): Low Risk
 */
export function calculateDeadlineRisk(deadlineDateStr: string): DeadlineRiskInfo {
  const now = new Date();
  const deadline = new Date(deadlineDateStr);
  
  // Set times to midnight if only date was provided
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const pastDays = Math.abs(diffDays);
    return {
      daysRemaining: diffDays,
      hoursRemaining: diffHours,
      isPastDue: true,
      riskLevel: 'High',
      riskLabel: pastDays === 0 ? 'Due Today (Overdue) - High Risk' : `Past Due by ${pastDays} day${pastDays > 1 ? 's' : ''} - High Risk`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
      textClass: 'text-rose-700 font-bold',
      bgClass: 'bg-rose-50 border-rose-200'
    };
  }

  // A few days left or hourly due (<= 3 days / <= 72 hours)
  if (diffDays <= 3) {
    const isHourly = diffHours <= 48;
    return {
      daysRemaining: diffDays,
      hoursRemaining: diffHours,
      isPastDue: false,
      riskLevel: 'High',
      riskLabel: isHourly ? `Hourly Due (${diffHours}h left) - High Risk` : `${diffDays} days left - High Risk`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold animate-pulse',
      textClass: 'text-rose-700 font-bold',
      bgClass: 'bg-rose-50 border-rose-200'
    };
  }

  // 15 days left is medium risk (4 to 15 days)
  if (diffDays <= 15) {
    return {
      daysRemaining: diffDays,
      hoursRemaining: diffHours,
      isPastDue: false,
      riskLevel: 'Medium',
      riskLabel: `${diffDays} days left - Medium Risk`,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
      textClass: 'text-amber-700 font-semibold',
      bgClass: 'bg-amber-50 border-amber-200'
    };
  }

  // 30 days left is low risk
  return {
    daysRemaining: diffDays,
    hoursRemaining: diffHours,
    isPastDue: false,
    riskLevel: 'Low',
    riskLabel: `${diffDays} days left - Low Risk`,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
    textClass: 'text-emerald-700 font-semibold',
    bgClass: 'bg-emerald-50 border-emerald-200'
  };
}

export function formatZAR(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0
  }).format(amount);
}
