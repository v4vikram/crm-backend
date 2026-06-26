import { askGroq } from "../../lib/groq.js";
import { getLeadsOverview } from "../analytics/analytics.service.js";
import type { LeadScope } from "../leads/lead.types.js";
import { getEmployeePerformance } from "./ai.repository.js";
import type { DashboardInsight, SalesPerformanceAnalysis } from "./ai.types.js";

export const getDashboardInsight = async (scope: LeadScope): Promise<DashboardInsight> => {
  const overview = await getLeadsOverview(scope);

  const summary = await askGroq(
    "You are a sales analytics assistant for a CRM dashboard. Be concise and factual, " +
      "and only use the numbers given to you. Write plain text, no markdown, 2-4 sentences.",
    `Here is the current CRM snapshot as JSON:\n${JSON.stringify(overview)}\n\n` +
      "Write a short daily summary highlighting the most useful numbers " +
      "(totals, conversion rate, any notable status or source) for whoever is viewing this dashboard.",
  );

  return { summary, generatedAt: new Date().toISOString() };
};

export const getSalesPerformanceAnalysis = async (): Promise<SalesPerformanceAnalysis> => {
  const employees = await getEmployeePerformance();

  const analysis = await askGroq(
    "You are a sales performance coach reviewing a team's CRM numbers. Be specific, " +
      "honest, and base every suggestion only on the data given. Plain text, no markdown.",
    `Here is per-salesperson performance data as JSON:\n${JSON.stringify(employees)}\n\n` +
      'For each employee, write exactly one short coaching sentence formatted as "Name: suggestion" ' +
      "on its own line. If an employee has zero leads, say there's not enough data yet for them.",
  );

  return { employees, analysis, generatedAt: new Date().toISOString() };
};
