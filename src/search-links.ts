import type { SearchCriteria } from "./types";
import { appPath } from "./routes";

export function searchCriteriaUrl(criteria: SearchCriteria) {
  const params = new URLSearchParams();
  if (criteria.q) params.set("q", criteria.q);
  if (criteria.status) params.set("status", criteria.status);
  if (criteria.agency) params.set("agency", criteria.agency);
  if (criteria.fundingCategory) params.set("funding_category", criteria.fundingCategory);
  if (criteria.fundingInstrument) params.set("funding_instrument", criteria.fundingInstrument);
  if (criteria.eligibleApplicant) params.set("eligible_applicant", criteria.eligibleApplicant);
  if (criteria.minAward) params.set("min_award", criteria.minAward);
  if (criteria.deadlineDays) params.set("deadline_days", criteria.deadlineDays);
  if (criteria.hasFundingAmount) params.set("has_funding_amount", "true");
  const defaultSort = criteria.q ? "relevance-desc" : "posted-date-desc";
  if (criteria.sort && criteria.sort !== defaultSort) params.set("sort", criteria.sort);
  return appPath(`/search${params.size ? `?${params}` : ""}#results`);
}

export function criteriaSummary(criteria: SearchCriteria) {
  const values = [criteria.q, criteria.status, criteria.fundingCategory, criteria.eligibleApplicant, criteria.agency].filter(Boolean);
  return values.length ? values.slice(0, 3).join(" · ") : "All current opportunities";
}
