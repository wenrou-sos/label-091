import type { FactorKey, JudgeScoreRecord, TeaJudge, TeaSample } from "@/types";
import { buildJudgeRecords } from "./statistics";

export const MOCK_JUDGES: TeaJudge[] = [
  {
    id: "j-zhang",
    name: "张敏远",
    title: "高级评茶师",
    avatarColor: "#579036",
  },
  {
    id: "j-li",
    name: "李书文",
    title: "评茶师",
    avatarColor: "#c9a227",
  },
  {
    id: "j-wang",
    name: "王浣之",
    title: "高级评茶师",
    avatarColor: "#8f673a",
  },
  {
    id: "j-zhao",
    name: "赵清如",
    title: "评茶师",
    avatarColor: "#74ad50",
  },
  {
    id: "j-chen",
    name: "陈墨轩",
    title: "国家一级评茶师",
    avatarColor: "#ab7f1c",
  },
];

export const MOCK_SAMPLES: TeaSample[] = [
  {
    id: "s-001",
    blindCode: "A-017",
    realName: "西湖龙井·明前特级",
    origin: "浙江杭州",
    category: "绿茶",
  },
  {
    id: "s-002",
    blindCode: "A-042",
    realName: "碧螺春·一级",
    origin: "江苏苏州",
    category: "绿茶",
  },
  {
    id: "s-003",
    blindCode: "A-076",
    realName: "正山小种·特级",
    origin: "福建武夷山",
    category: "红茶",
  },
  {
    id: "s-004",
    blindCode: "A-083",
    realName: "铁观音·浓香型",
    origin: "福建安溪",
    category: "乌龙茶",
  },
  {
    id: "s-005",
    blindCode: "A-105",
    realName: "白毫银针·特级",
    origin: "福建福鼎",
    category: "白茶",
  },
  {
    id: "s-006",
    blindCode: "A-128",
    realName: "普洱生茶·古树",
    origin: "云南西双版纳",
    category: "黑茶",
  },
];

export const BATCH_NAME = "2026年春茶盲评批次·第III轮";

type BaseProfile = Record<FactorKey, number>;

const PROFILES: Record<string, { base: BaseProfile; spread: number }> = {
  "s-001": {
    base: { appearance: 9.2, liquor: 8.8, aroma: 9.1, taste: 9.0, leaf: 9.0 },
    spread: 0.6,
  },
  "s-002": {
    base: { appearance: 8.3, liquor: 8.2, aroma: 8.0, taste: 8.1, leaf: 8.2 },
    spread: 0.7,
  },
  "s-003": {
    base: { appearance: 8.5, liquor: 9.0, aroma: 8.8, taste: 8.9, leaf: 8.3 },
    spread: 0.5,
  },
  "s-004": {
    base: { appearance: 8.0, liquor: 7.8, aroma: 8.4, taste: 7.6, leaf: 7.9 },
    spread: 2.2,
  },
  "s-005": {
    base: { appearance: 9.0, liquor: 8.7, aroma: 8.5, taste: 8.6, leaf: 8.9 },
    spread: 0.5,
  },
  "s-006": {
    base: { appearance: 7.2, liquor: 7.5, aroma: 7.8, taste: 8.0, leaf: 7.3 },
    spread: 1.9,
  },
};

export const MOCK_RECORDS: JudgeScoreRecord[] = buildJudgeRecords(
  MOCK_JUDGES,
  MOCK_SAMPLES,
  PROFILES
);
