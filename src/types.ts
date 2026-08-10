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
  descriptionExcerpt?: string;
  eligibleApplicants: string[];
  fundingActivityCategories: string[];
  fundingInstrumentTypes: string[];
  assistanceListingNumbers: string[];
  programFundingUsd?: number;
  lastVerifiedAt?: string;
};

export type GrantFacetItem = { value: string; count: number };
export type GrantContactPhone = {
  raw: string;
  display: string;
  telUrl: string;
  whatsappUrl?: string;
};
export type GrantSearchFacets = {
  statuses: GrantFacetItem[];
  agencies: GrantFacetItem[];
  fundingCategories: GrantFacetItem[];
  fundingInstruments: GrantFacetItem[];
  eligibleApplicants: GrantFacetItem[];
};

export type GrantOpportunityDetails = {
  description?: string;
  descriptionMarkdown?: string;
  eligibleApplicants: string[];
  eligibilityHighlights?: string[];
  eligibilityAdditionalInformation?: string;
  grantorContactDescription?: string;
  grantorContactEmail?: string;
  grantorContactPhones?: GrantContactPhone[];
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
  meta: { generated_at: string; last_refresh_at?: string; facets: GrantSearchFacets };
};

export type GrantDetailResponse = { data: GrantDetail; meta: { generated_at: string } };
