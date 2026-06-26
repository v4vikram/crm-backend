export interface DashboardInsight {
  summary: string;
  generatedAt: string;
}

export interface EmployeePerformance {
  userId: string;
  name: string;
  totalLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  totalDealValue: number;
}

export interface SalesPerformanceAnalysis {
  employees: EmployeePerformance[];
  analysis: string;
  generatedAt: string;
}
