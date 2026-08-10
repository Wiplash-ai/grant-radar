export type Grant = {
  key: string;
  title: string;
  opportunityNumber?: string;
  agency: string;
  status: "open" | "forecasted";
  officialUrl: string;
  closeDateLabel: string;
  closeAt?: string;
  postedDateLabel?: string;
  awardFloorUsd?: number;
  awardCeilingUsd?: number;
  awardCeilingLabel?: string;
  themes: string[];
  fitScore: number;
  fitReasons: string[];
  summary: string;
  lastVerifiedAt?: string;
};

export type GrantOpportunityDetails = {
  description?: string;
  eligibleApplicants: string[];
  eligibilityAdditionalInformation?: string;
  grantorContactDescription?: string;
  grantorContactEmail?: string;
  assistanceListings: Array<{ number: string; title: string }>;
  lastUpdatedLabel?: string;
  programFundingUsd?: number;
  programFundingLabel?: string;
  costSharingOrMatchingRequirement?: string;
  fundingInstrumentTypes: string[];
  opportunityCategory?: string;
  opportunityCategoryExplanation?: string;
  fundingActivityCategories: string[];
  fundingActivityCategoryExplanation?: string;
  version?: string;
  archiveDateLabel?: string;
  archiveAt?: string;
  grantsGovUrl?: string;
  applicationInstructions?: string;
  documents: Array<{ name: string; url: string }>;
  additionalInformation: Array<{ name: string; url: string }>;
  fetchedAt: string;
};

export type GrantDetail = Grant & {
  statusLabel?: string;
  postedAt?: string;
  postedDateLabel?: string;
  awardFloorUsd?: number;
  awardFloorLabel?: string;
  expectedAwards?: number;
  expectedAwardsLabel?: string;
  officialUrlLabel?: string;
  detailUrl?: string;
  matchedQueries?: string[];
  fitBand?: "high" | "medium" | "low";
  fitReasons?: string[];
  details?: GrantOpportunityDetails;
};
export type GrantResponse = {
  data: Grant[];
  pagination: { total: number; page: number; limit: number; pages: number };
  meta: { generated_at: string; last_refresh_at?: string };
};

export type GrantDetailResponse = { data: GrantDetail; meta: { generated_at: string } };
