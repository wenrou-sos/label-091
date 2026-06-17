import type { FactorKey, FactorScore, SubFactor } from "@/types";

export interface FactorDefinition {
  key: FactorKey;
  name: string;
  weight: number;
  icon: string;
  description: string;
  subFactors: Omit<SubFactor, "score" | "selectedDescriptor">[];
}

export const FACTOR_DEFINITIONS: FactorDefinition[] = [
  {
    key: "appearance",
    name: "外形",
    weight: 0.25,
    icon: "Sparkles",
    description: "干茶的外观形态、色泽、整碎度与净度",
    subFactors: [
      {
        key: "strip",
        label: "条索",
        descriptors: ["细紧", "肥壮", "重实", "卷曲", "挺直", "尚紧结", "松扁"],
      },
      {
        key: "color",
        label: "色泽",
        descriptors: ["翠绿", "乌润", "金黄", "灰绿", "嫩黄", "枯暗", "花杂"],
      },
      {
        key: "uniformity",
        label: "整碎",
        descriptors: ["匀整", "尚匀整", "欠匀整", "较碎", "破碎"],
      },
      {
        key: "purity",
        label: "净度",
        descriptors: ["纯净", "尚净", "微含梗", "含梗片", "多杂"],
      },
    ],
  },
  {
    key: "liquor",
    name: "汤色",
    weight: 0.1,
    icon: "Droplets",
    description: "茶汤的颜色深浅、明亮度与清澈度",
    subFactors: [
      {
        key: "hue",
        label: "色度",
        descriptors: [
          "嫩绿",
          "浅黄绿",
          "杏黄",
          "橙黄",
          "橙红",
          "深红",
          "暗褐",
          "浑浊",
        ],
      },
      {
        key: "brightness",
        label: "亮度",
        descriptors: ["明亮", "尚明", "较亮", "较暗", "晦暗"],
      },
      {
        key: "clarity",
        label: "清澈度",
        descriptors: ["清澈", "尚清", "微浑", "浑浊", "沉淀"],
      },
    ],
  },
  {
    key: "aroma",
    name: "香气",
    weight: 0.25,
    icon: "Wind",
    description: "茶叶冲泡后散发出的香型、纯度与持久度",
    subFactors: [
      {
        key: "type",
        label: "类型",
        descriptors: [
          "毫香",
          "嫩香",
          "栗香",
          "豆香",
          "花香",
          "果香",
          "蜜糖香",
          "陈香",
          "火香",
          "清香",
        ],
      },
      {
        key: "purity",
        label: "纯度",
        descriptors: ["纯正", "尚纯", "清香", "微杂", "有异气"],
      },
      {
        key: "lastingness",
        label: "持久度",
        descriptors: ["高长持久", "尚持久", "较长", "较短", "淡薄"],
      },
    ],
  },
  {
    key: "taste",
    name: "滋味",
    weight: 0.3,
    icon: "Soup",
    description: "茶汤入口的醇厚度、回甘与苦涩味",
    subFactors: [
      {
        key: "mellowness",
        label: "醇厚度",
        descriptors: ["醇厚", "醇和", "鲜爽", "平和", "平淡", "粗淡"],
      },
      {
        key: "aftertaste",
        label: "回甘",
        descriptors: ["明显", "尚显", "有回甘", "微有", "无"],
      },
      {
        key: "bitterness",
        label: "苦涩度",
        descriptors: ["无", "微苦", "微涩", "苦涩", "重苦", "青涩"],
      },
    ],
  },
  {
    key: "leaf",
    name: "叶底",
    weight: 0.1,
    icon: "Leaf",
    description: "冲泡后茶叶的嫩度、匀度与色泽",
    subFactors: [
      {
        key: "tenderness",
        label: "嫩度",
        descriptors: ["细嫩", "柔嫩", "尚嫩", "较粗", "粗老"],
      },
      {
        key: "evenness",
        label: "匀度",
        descriptors: ["匀齐", "尚匀", "欠匀", "较杂", "花杂"],
      },
      {
        key: "color",
        label: "色泽",
        descriptors: [
          "嫩绿匀亮",
          "嫩黄明亮",
          "黄绿",
          "黄亮",
          "红匀",
          "暗褐",
          "焦黑",
        ],
      },
    ],
  },
];

export const FACTOR_ORDER: FactorKey[] = [
  "appearance",
  "liquor",
  "aroma",
  "taste",
  "leaf",
];

export const STD_DEV_THRESHOLD = 1.5;

export function createBlankFactorScores(): FactorScore[] {
  return FACTOR_DEFINITIONS.map((def) => ({
    factorKey: def.key,
    factorName: def.name,
    weight: def.weight,
    subFactors: def.subFactors.map((sf) => ({
      key: sf.key,
      label: sf.label,
      descriptors: sf.descriptors,
      score: 5,
      selectedDescriptor: sf.descriptors[0],
    })),
  }));
}

export function calculateFactorAverage(factor: FactorScore): number {
  if (!factor.subFactors.length) return 0;
  return (
    factor.subFactors.reduce((s, sf) => s + sf.score, 0) /
    factor.subFactors.length
  );
}

export function calculateTotalScore(factors: FactorScore[]): number {
  return factors.reduce((total, f) => {
    const avg = calculateFactorAverage(f);
    return total + avg * f.weight * 10;
  }, 0);
}
