import { create } from "zustand";
import type {
  FactorKey,
  FactorScore,
  JudgeScoreRecord,
  ReviewReport,
  SampleSummary,
  TeaJudge,
  TeaSample,
} from "@/types";
import {
  BATCH_NAME,
  MOCK_JUDGES,
  MOCK_RECORDS,
  MOCK_SAMPLES,
} from "@/utils/mockData";
import {
  assignRankings,
  generateOverallComments,
  round,
  summarizeSample,
} from "@/utils/statistics";
import {
  calculateFactorAverage,
  createBlankFactorScores,
} from "@/constants/factors";

interface DraftScore {
  sampleId: string;
  judgeId: string;
  factors: FactorScore[];
}

interface ReviewState {
  samples: TeaSample[];
  judges: TeaJudge[];
  records: JudgeScoreRecord[];
  currentJudgeId: string;
  drafts: DraftScore[];
  batchName: string;
  getDraft: (sampleId: string, judgeId: string) => DraftScore | undefined;
  updateSubFactor: (
    sampleId: string,
    judgeId: string,
    factorKey: FactorKey,
    subKey: string,
    updates: Partial<{ score: number; selectedDescriptor: string }>
  ) => void;
  ensureDraft: (sampleId: string, judgeId: string) => DraftScore;
  submitDraft: (sampleId: string, judgeId: string) => void;
  setCurrentJudge: (id: string) => void;
  getSampleStatus: (
    sampleId: string,
    judgeId: string
  ) => "pending" | "reviewing" | "submitted";
  getSampleSummaries: () => SampleSummary[];
  generateReport: () => ReviewReport;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  samples: MOCK_SAMPLES,
  judges: MOCK_JUDGES,
  records: MOCK_RECORDS,
  currentJudgeId: MOCK_JUDGES[0].id,
  drafts: [],
  batchName: BATCH_NAME,

  getDraft: (sampleId, judgeId) => {
    return get().drafts.find(
      (d) => d.sampleId === sampleId && d.judgeId === judgeId
    );
  },

  ensureDraft: (sampleId, judgeId) => {
    const existing = get().drafts.find(
      (d) => d.sampleId === sampleId && d.judgeId === judgeId
    );
    if (existing) return existing;
    const fresh: DraftScore = {
      sampleId,
      judgeId,
      factors: createBlankFactorScores(),
    };
    set((s) => ({ drafts: [...s.drafts, fresh] }));
    return fresh;
  },

  updateSubFactor: (sampleId, judgeId, factorKey, subKey, updates) => {
    const state = get();
    let drafts = state.drafts;
    let target = drafts.find(
      (d) => d.sampleId === sampleId && d.judgeId === judgeId
    );
    if (!target) {
      target = {
        sampleId,
        judgeId,
        factors: createBlankFactorScores(),
      };
      drafts = [...drafts, target];
    }
    const newDrafts = drafts.map((d) => {
      if (d !== target) return d;
      return {
        ...d,
        factors: d.factors.map((f) => {
          if (f.factorKey !== factorKey) return f;
          return {
            ...f,
            subFactors: f.subFactors.map((sf) => {
              if (sf.key !== subKey) return sf;
              return { ...sf, ...updates };
            }),
          };
        }),
      };
    });
    set({ drafts: newDrafts });
  },

  submitDraft: (sampleId, judgeId) => {
    const state = get();
    const draft = state.drafts.find(
      (d) => d.sampleId === sampleId && d.judgeId === judgeId
    );
    if (!draft) return;
    const total = draft.factors.reduce((sum, f) => {
      const avg = calculateFactorAverage(f);
      return sum + avg * f.weight * 10;
    }, 0);
    const record: JudgeScoreRecord = {
      id: `rec-${sampleId}-${judgeId}-${Date.now()}`,
      sampleId,
      judgeId,
      factors: draft.factors,
      totalScore: round(total, 2),
      submittedAt: new Date().toISOString(),
    };
    const filteredRecords = state.records.filter(
      (r) => !(r.sampleId === sampleId && r.judgeId === judgeId)
    );
    set({
      records: [...filteredRecords, record],
      drafts: state.drafts.filter((d) => d !== draft),
    });
  },

  setCurrentJudge: (id) => set({ currentJudgeId: id }),

  getSampleStatus: (sampleId, judgeId) => {
    const state = get();
    if (
      state.records.some(
        (r) => r.sampleId === sampleId && r.judgeId === judgeId
      )
    ) {
      return "submitted";
    }
    if (
      state.drafts.some(
        (d) => d.sampleId === sampleId && d.judgeId === judgeId
      )
    ) {
      return "reviewing";
    }
    return "pending";
  },

  getSampleSummaries: () => {
    const { samples, records } = get();
    const summaries = samples.map((s) => {
      const sampleRecords = records.filter((r) => r.sampleId === s.id);
      return summarizeSample(s, sampleRecords);
    });
    return assignRankings(summaries);
  },

  generateReport: () => {
    const state = get();
    const summaries = state.getSampleSummaries();
    const comments = generateOverallComments(summaries);
    return {
      id: `rpt-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      batchName: state.batchName,
      judges: state.judges,
      sampleSummaries: summaries.sort((a, b) => a.ranking - b.ranking),
      overallComments: comments,
    };
  },
}));
