export type FactorKey =
  | "appearance"
  | "liquor"
  | "aroma"
  | "taste"
  | "leaf";

export interface TeaSample {
  id: string;
  blindCode: string;
  realName?: string;
  origin?: string;
  category?: string;
}

export interface TeaJudge {
  id: string;
  name: string;
  title: string;
  avatarColor: string;
}

export interface SubFactor {
  key: string;
  label: string;
  descriptors: string[];
  score: number;
  selectedDescriptor?: string;
}

export interface FactorScore {
  factorKey: FactorKey;
  factorName: string;
  weight: number;
  subFactors: SubFactor[];
}

export interface JudgeScoreRecord {
  id: string;
  sampleId: string;
  judgeId: string;
  factors: FactorScore[];
  totalScore: number;
  submittedAt: string;
}

export interface SampleSummary {
  sampleId: string;
  blindCode: string;
  scoresCount: number;
  meanScore: number;
  stdDeviation: number;
  factorMeans: Record<FactorKey, number>;
  factorStdDevs: Record<FactorKey, number>;
  needsReReview: boolean;
  ranking: number;
  topDescriptor: Record<FactorKey, string>;
}

export interface ReviewReport {
  id: string;
  generatedAt: string;
  batchName: string;
  judges: TeaJudge[];
  sampleSummaries: SampleSummary[];
  overallComments: string;
}

export type ReviewStatus = "pending" | "reviewing" | "submitted";
