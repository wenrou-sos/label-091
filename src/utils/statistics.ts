import type {
  FactorKey,
  FactorScore,
  JudgeScoreRecord,
  SampleSummary,
  TeaJudge,
  TeaSample,
} from "@/types";
import {
  FACTOR_DEFINITIONS,
  FACTOR_ORDER,
  STD_DEV_THRESHOLD,
  calculateFactorAverage,
} from "@/constants/factors";

export function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function stdDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((s, v) => s + Math.pow(v - m, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function round(value: number, digits = 2): number {
  const p = Math.pow(10, digits);
  return Math.round(value * p) / p;
}

export function scoreLevelLabel(score: number): string {
  if (score >= 9) return "优秀";
  if (score >= 8) return "良好";
  if (score >= 7) return "尚好";
  if (score >= 6) return "一般";
  return "较差";
}

export function scoreLevelColor(score: number): string {
  if (score >= 9) return "text-leaf-700";
  if (score >= 8) return "text-leaf-600";
  if (score >= 7) return "text-gold-600";
  if (score >= 6) return "text-tea-600";
  return "text-amber2-400";
}

function pickFactorScores(
  base: Record<FactorKey, number>,
  spread = 1,
  rng: () => number
): FactorScore[] {
  return FACTOR_DEFINITIONS.map((def) => {
    const baseMean = base[def.key];
    const subCount = def.subFactors.length;
    const noise = (rng() - 0.5) * 2 * spread;
    const targetMean = Math.min(
      10,
      Math.max(0, baseMean + noise)
    );

    const subScores: number[] = [];
    for (let i = 0; i < subCount; i++) {
      const s = Math.min(
        10,
        Math.max(0, targetMean + (rng() - 0.5) * 1.4)
      );
      subScores.push(round(s, 1));
    }
    const actualMean = subScores.reduce((s, v) => s + v, 0) / subCount;
    const diff = targetMean - actualMean;
    const adjusted = subScores.map((s, i) =>
      i === 0
        ? Math.min(10, Math.max(0, round(s + diff, 1)))
        : s
    );

    return {
      factorKey: def.key,
      factorName: def.name,
      weight: def.weight,
      subFactors: def.subFactors.map((sf, i) => ({
        key: sf.key,
        label: sf.label,
        descriptors: sf.descriptors,
        score: adjusted[i],
        selectedDescriptor:
          sf.descriptors[
            Math.min(
              sf.descriptors.length - 1,
              Math.floor(rng() * sf.descriptors.length)
            )
          ],
      })),
    };
  });
}

export function summarizeSample(
  sample: TeaSample,
  records: JudgeScoreRecord[]
): SampleSummary {
  const totals = records.map((r) => r.totalScore);
  const m = round(mean(totals), 2);
  const sd = round(stdDeviation(totals), 2);

  const factorMeans: Record<FactorKey, number> = {
    appearance: 0,
    liquor: 0,
    aroma: 0,
    taste: 0,
    leaf: 0,
  };
  const factorStdDevs: Record<FactorKey, number> = {
    appearance: 0,
    liquor: 0,
    aroma: 0,
    taste: 0,
    leaf: 0,
  };
  const topDescriptor: Record<FactorKey, string> = {
    appearance: "-",
    liquor: "-",
    aroma: "-",
    taste: "-",
    leaf: "-",
  };

  FACTOR_ORDER.forEach((fk) => {
    const arr = records.map((r) => {
      const f = r.factors.find((x) => x.factorKey === fk);
      return f ? round(calculateFactorAverage(f), 2) : 0;
    });
    factorMeans[fk] = round(mean(arr), 2);
    factorStdDevs[fk] = round(stdDeviation(arr), 2);

    const descCounter = new Map<string, number>();
    records.forEach((r) => {
      const f = r.factors.find((x) => x.factorKey === fk);
      f?.subFactors.forEach((sf) => {
        if (sf.selectedDescriptor) {
          descCounter.set(
            sf.selectedDescriptor,
            (descCounter.get(sf.selectedDescriptor) || 0) + 1
          );
        }
      });
    });
    let best = "";
    let bestCount = -1;
    descCounter.forEach((c, d) => {
      if (c > bestCount) {
        bestCount = c;
        best = d;
      }
    });
    topDescriptor[fk] = best || "-";
  });

  const needsReReview =
    sd > STD_DEV_THRESHOLD ||
    Object.values(factorStdDevs).some((v) => v > STD_DEV_THRESHOLD);

  return {
    sampleId: sample.id,
    blindCode: sample.blindCode,
    scoresCount: records.length,
    meanScore: m,
    stdDeviation: sd,
    factorMeans,
    factorStdDevs,
    needsReReview,
    ranking: 0,
    topDescriptor,
  };
}

export function assignRankings(
  summaries: SampleSummary[]
): SampleSummary[] {
  const sorted = [...summaries].sort((a, b) => b.meanScore - a.meanScore);
  return summaries.map((s) => ({
    ...s,
    ranking: sorted.findIndex((x) => x.sampleId === s.sampleId) + 1,
  }));
}

export function generateOverallComments(
  summaries: SampleSummary[]
): string {
  if (!summaries.length) return "";
  const sorted = [...summaries].sort((a, b) => a.ranking - b.ranking);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const reReviewCount = summaries.filter((s) => s.needsReReview).length;
  const lines: string[] = [];
  lines.push(
    `本次审评共${summaries.length}个茶样参与盲评，综合评分最高者为【${top.blindCode}】（${top.meanScore}分），`
  );
  lines.push(
    `表现突出，在${formatFactorStrength(top)}方面尤为优异。`
  );
  lines.push(
    `评分排名末位为【${bottom.blindCode}】（${bottom.meanScore}分），建议针对${formatFactorWeakness(bottom)}改进工艺。`
  );
  if (reReviewCount > 0) {
    lines.push(
      `⚠ 共有${reReviewCount}个茶样因评茶师间分歧较大（标准差>${STD_DEV_THRESHOLD}），建议组织复评。`
    );
  } else {
    lines.push(
      `各茶样评分标准差均在合理范围内，评茶师间意见一致性良好，结果具备较高参考价值。`
    );
  }
  return lines.join("");
}

function formatFactorStrength(s: SampleSummary): string {
  const entries = (Object.entries(s.factorMeans) as [FactorKey, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  const factorNameMap: Record<FactorKey, string> = {
    appearance: "外形",
    liquor: "汤色",
    aroma: "香气",
    taste: "滋味",
    leaf: "叶底",
  };
  return entries.map(([k]) => factorNameMap[k]).join("、");
}

function formatFactorWeakness(s: SampleSummary): string {
  const entries = (Object.entries(s.factorMeans) as [FactorKey, number][])
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2);
  const factorNameMap: Record<FactorKey, string> = {
    appearance: "外形",
    liquor: "汤色",
    aroma: "香气",
    taste: "滋味",
    leaf: "叶底",
  };
  return entries.map(([k]) => factorNameMap[k]).join("、");
}

export { pickFactorScores };

export function buildJudgeRecords(
  judges: TeaJudge[],
  samples: TeaSample[],
  profilePerSample: Record<
    string,
    { base: Record<FactorKey, number>; spread: number }
  >
): JudgeScoreRecord[] {
  let seed = 42;
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const records: JudgeScoreRecord[] = [];
  samples.forEach((sample) => {
    const profile = profilePerSample[sample.id];
    judges.forEach((j, idx) => {
      const factors = pickFactorScores(profile.base, profile.spread, rng);
      const total = factors.reduce((sum, f) => {
        const avg = calculateFactorAverage(f);
        return sum + avg * f.weight * 10;
      }, 0);
      records.push({
        id: `rec-${sample.id}-${j.id}`,
        sampleId: sample.id,
        judgeId: j.id,
        factors,
        totalScore: round(total, 2),
        submittedAt: new Date(
          Date.now() - idx * 3600_000 - rng() * 86400_000
        ).toISOString(),
      });
    });
  });
  return records;
}
