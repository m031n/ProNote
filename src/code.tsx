/// <reference types="@figma/widget-typings" />

import baharAvatar from "../img/Bahar.jpg";
import hasanAvatar from "../img/Hasan.jpg";
import lidaAvatar from "../img/Lida.jpg";
import mahdiAvatar from "../img/Mahdi.jpg";
import moeinAvatar from "../img/Moein.jpg";
import sajadAvatar from "../img/Sajad.jpg";
import zahraAvatar from "../img/Zahra.jpg";

const { widget } = figma;
const {
  AutoLayout,
  Frame,
  Text,
  SVG,
  Image,
  Input,
  useEffect,
  usePropertyMenu,
  useSyncedState,
  useWidgetId,
  waitForTask
} = widget;

type CategoryKey = "technical" | "design" | "business" | "design_changes" | "feedback";
type LegSide = "left" | "right" | "top" | "bottom" | "none";
type LegLength = "small" | "medium" | "long";
type LegPosition = "start" | "middle" | "end";
type CardWidth = "small" | "medium" | "large";

type NoteData = {
  title: string;
  category: CategoryKey;
  body: string;
  fontFamily: string;
  authorId: string;
  authorName: string;
  updatedAt: string;
};

type AuthorProfile = {
  id: string;
  name: string;
  initials: string;
  avatarFill: string;
  avatarText: string;
  avatarSrc?: string;
};

type LinkData = {
  id: string;
  title: string;
  url: string;
};

type ResizePayload = {
  width: number;
  height: number;
};

type FullEditPayload = {
  title: string;
  body: string;
  category: CategoryKey;
  authorId: string;
  links: LinkData[];
};

type NoteListItem = {
  id: string;
  title: string;
  authorName: string;
  pageName: string;
  category: CategoryKey;
  categoryLabel: string;
  categoryColor: string;
  categoryBg: string;
  categoryStatus: string;
  updatedLabel: string;
};

const SCALE_STEPS = [0.6, 0.72, 0.84, 1, 1.36, 1.52, 1.68];
const SCALE_INDEX_MIGRATION: Record<number, number> = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 3,
  5: 4,
  6: 4,
  7: 5,
  8: 6
};
const NOTE_FONT_FAMILY = "IRANSansXVF";
const TITLE_FONT_WEIGHT = 700;
const BODY_FONT_WEIGHT = 500;
const TITLE_FONT = { family: NOTE_FONT_FAMILY, style: "Bold" };
const BODY_FONT = { family: NOTE_FONT_FAMILY, style: "Medium" };
const META_BOLD_FONT = { family: NOTE_FONT_FAMILY, style: "Bold" };
const META_MEDIUM_FONT = { family: NOTE_FONT_FAMILY, style: "Medium" };
const FOOTER_META_FONT = { family: "Inter", style: "Medium" };
const CATEGORY_PALETTE = {
  yellow: "#DE9D00",
  orange: "#D77925",
  red: "#C73D43",
  pink: "#C74A7B",
  purple: "#815AAD",
  blue: "#3286B4",
  teal: "#008C7A",
  green: "#00915C"
} as const;

const CATEGORIES: Array<{
  key: CategoryKey;
  label: string;
  color: string;
}> = [
  { key: "business", label: "بیزینس", color: "#815AAD" },
  { key: "design", label: "دیزاین", color: "#3286B4" },
  { key: "design_changes", label: "تغییرات دیزاین", color: "#00915C" },
  { key: "technical", label: "فنی", color: "#D77925" },
  { key: "feedback", label: "فیدبک", color: "#C73D43" }
];

const LEG_SIDE_OPTIONS = [
  { option: "left", label: "Left" },
  { option: "right", label: "Right" },
  { option: "top", label: "Up" },
  { option: "bottom", label: "Down" },
  { option: "none", label: "None" }
];

const LEG_LENGTH_OPTIONS = [
  { option: "small", label: "Small" },
  { option: "medium", label: "Medium" },
  { option: "long", label: "Large" }
];

const LEG_VERTICAL_POSITION_OPTIONS = [
  { option: "start", label: "Top" },
  { option: "middle", label: "Middle" },
  { option: "end", label: "Bottom" }
];

const LEG_HORIZONTAL_POSITION_OPTIONS = [
  { option: "start", label: "Left" },
  { option: "middle", label: "Middle" },
  { option: "end", label: "Right" }
];

const LEG_LENGTHS: Record<LegLength, number> = {
  small: 112,
  medium: 208,
  long: 416
};

const CARD_WIDTH_OPTIONS = [
  { option: "large", label: "Large" },
  { option: "medium", label: "Medium" },
  { option: "small", label: "Small" }
];

const CARD_WIDTHS: Record<CardWidth, number> = {
  small: 310,
  medium: 500,
  large: 700
};

const CATEGORY_THEME: Record<
  CategoryKey,
  {
    bg: string;
    text: string;
    secondaryText: string;
    linkText: string;
  }
> = {
  technical: {
    bg: "#FFEACD",
    text: "#834301",
    secondaryText: "#A97547",
    linkText: "#FF6700"
  },
  design: {
    bg: "#D5ECF8",
    text: "#004D71",
    secondaryText: "#4A7D9A",
    linkText: "#0072E9"
  },
  business: {
    bg: "#EFE4FA",
    text: "#412069",
    secondaryText: "#755B96",
    linkText: "#8A29F1"
  },
  design_changes: {
    bg: "#D5F0E3",
    text: "#005333",
    secondaryText: "#498268",
    linkText: "#00AA2E"
  },
  feedback: {
    bg: "#FFDEDD",
    text: "#74181C",
    secondaryText: "#A25659",
    linkText: "#FC0022"
  }
};

const MENU_ICONS = {
  simpleAdvanced:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.25 20V18.75H3C2.58579 18.75 2.25 18.4142 2.25 18C2.25 17.5858 2.58579 17.25 3 17.25H4.25V16C4.25 15.5858 4.58579 15.25 5 15.25C5.41421 15.25 5.75 15.5858 5.75 16V17.25H7C7.41421 17.25 7.75 17.5858 7.75 18C7.75 18.4142 7.41421 18.75 7 18.75H5.75V20C5.75 20.4142 5.41421 20.75 5 20.75C4.58579 20.75 4.25 20.4142 4.25 20ZM13 3.25C13.3079 3.25 13.5842 3.43828 13.6973 3.72461L15.4502 8.16895C15.6516 8.6797 15.7109 8.81493 15.7881 8.92285C15.8678 9.03414 15.9659 9.13221 16.0771 9.21191C16.1851 9.28912 16.3203 9.34836 16.8311 9.5498L21.2754 11.3027C21.5617 11.4158 21.75 11.6921 21.75 12C21.75 12.3079 21.5617 12.5842 21.2754 12.6973L16.8311 14.4502C16.3203 14.6516 16.1851 14.7109 16.0771 14.7881C15.9659 14.8678 15.8678 14.9659 15.7881 15.0771C15.7109 15.1851 15.6516 15.3203 15.4502 15.8311L13.6973 20.2754C13.5842 20.5617 13.3079 20.75 13 20.75C12.6921 20.75 12.4158 20.5617 12.3027 20.2754L10.5498 15.8311C10.3484 15.3203 10.2891 15.1851 10.2119 15.0771C10.1322 14.9659 10.0341 14.8678 9.92285 14.7881C9.81492 14.7109 9.6797 14.6516 9.16895 14.4502L4.72461 12.6973C4.43828 12.5842 4.25 12.3079 4.25 12C4.25 11.6921 4.43828 11.4158 4.72461 11.3027L9.16895 9.5498C9.67971 9.34836 9.81493 9.28912 9.92285 9.21191C10.0341 9.13221 10.1322 9.03414 10.2119 8.92285C10.2891 8.81493 10.3484 8.67971 10.5498 8.16895L12.3027 3.72461L12.3525 3.62207C12.4854 3.39423 12.7306 3.25 13 3.25ZM11.9453 8.71973C11.7712 9.16126 11.642 9.50312 11.4316 9.79688C11.2563 10.0417 11.0417 10.2563 10.7969 10.4316C10.5031 10.642 10.1613 10.7712 9.71973 10.9453L7.04395 12L9.71973 13.0547C10.1613 13.2288 10.5031 13.358 10.7969 13.5684C11.0417 13.7437 11.2563 13.9583 11.4316 14.2031C11.642 14.4969 11.7712 14.8387 11.9453 15.2803L13 17.9551L14.0547 15.2803C14.2288 14.8387 14.358 14.4969 14.5684 14.2031C14.7437 13.9583 14.9583 13.7437 15.2031 13.5684C15.4969 13.358 15.8387 13.2288 16.2803 13.0547L18.9551 12L16.2803 10.9453C15.8387 10.7712 15.4969 10.642 15.2031 10.4316C14.9583 10.2563 14.7437 10.0417 14.5684 9.79688C14.358 9.50312 14.2288 9.16126 14.0547 8.71973L13 6.04395L11.9453 8.71973ZM5.25 8V6.75H4C3.58579 6.75 3.25 6.41421 3.25 6C3.25 5.58579 3.58579 5.25 4 5.25H5.25V4C5.25 3.58579 5.58579 3.25 6 3.25C6.41421 3.25 6.75 3.58579 6.75 4V5.25H8C8.41421 5.25 8.75 5.58579 8.75 6C8.75 6.41421 8.41421 6.75 8 6.75H6.75V8C6.75 8.41421 6.41421 8.75 6 8.75C5.58579 8.75 5.25 8.41421 5.25 8Z" fill="#FFFFFF"/></svg>',
  hideTitle:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 16L17.536 8.672C17.6053 8.47151 17.7354 8.29762 17.9082 8.17454C18.081 8.05147 18.2879 7.98532 18.5 7.98532C18.7121 7.98532 18.919 8.05147 19.0918 8.17454C19.2646 8.29762 19.3947 8.47151 19.464 8.672L22 16M15.697 14H21.303M2 16L6.039 6.31C6.07698 6.2189 6.14107 6.14109 6.22319 6.08635C6.30532 6.03161 6.4018 6.0024 6.5005 6.0024C6.5992 6.0024 6.69568 6.03161 6.77781 6.08635C6.85993 6.14109 6.92402 6.2189 6.962 6.31L11 16M3.304 13H9.696" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  scaleDown:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.25 10.5C17.25 6.77208 14.2279 3.75 10.5 3.75C6.77208 3.75 3.75 6.77208 3.75 10.5C3.75 14.2279 6.77208 17.25 10.5 17.25C12.3642 17.25 14.0511 16.4958 15.2734 15.2734C16.4958 14.0511 17.25 12.3642 17.25 10.5ZM13.5 9.75C13.9142 9.75 14.25 10.0858 14.25 10.5C14.25 10.9142 13.9142 11.25 13.5 11.25H7.5C7.08579 11.25 6.75 10.9142 6.75 10.5C6.75 10.0858 7.08579 9.75 7.5 9.75H13.5ZM18.75 10.5C18.75 12.5078 18.0309 14.3481 16.8389 15.7783L21.5303 20.4697C21.8232 20.7626 21.8232 21.2374 21.5303 21.5303C21.2374 21.8232 20.7626 21.8232 20.4697 21.5303L15.7783 16.8389C14.3481 18.0309 12.5078 18.75 10.5 18.75C5.94365 18.75 2.25 15.0563 2.25 10.5C2.25 5.94365 5.94365 2.25 10.5 2.25C15.0563 2.25 18.75 5.94365 18.75 10.5Z" fill="#FFFFFF"/></svg>',
  scaleUp:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.25 10.5C17.25 6.77208 14.2279 3.75 10.5 3.75C6.77208 3.75 3.75 6.77208 3.75 10.5C3.75 14.2279 6.77208 17.25 10.5 17.25C14.2279 17.25 17.25 14.2279 17.25 10.5ZM9.75 13.5V11.25H7.5C7.08579 11.25 6.75 10.9142 6.75 10.5C6.75 10.0858 7.08579 9.75 7.5 9.75H9.75V7.5C9.75 7.08579 10.0858 6.75 10.5 6.75C10.9142 6.75 11.25 7.08579 11.25 7.5V9.75H13.5C13.9142 9.75 14.25 10.0858 14.25 10.5C14.25 10.9142 13.9142 11.25 13.5 11.25H11.25V13.5C11.25 13.9142 10.9142 14.25 10.5 14.25C10.0858 14.25 9.75 13.9142 9.75 13.5ZM18.75 10.5C18.75 12.5071 18.0323 14.3461 16.8408 15.7764L21.5303 20.4697C21.823 20.7627 21.8231 21.2375 21.5303 21.5303C21.2373 21.823 20.7625 21.8231 20.4697 21.5303L15.7803 16.8369C14.3494 18.0305 12.5091 18.75 10.5 18.75C5.94365 18.75 2.25 15.0563 2.25 10.5C2.25 5.94365 5.94365 2.25 10.5 2.25C15.0563 2.25 18.75 5.94365 18.75 10.5Z" fill="#FFFFFF"/></svg>',
  cardSmall:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><text x="9" y="12.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF">S</text></svg>',
  cardMedium:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><text x="9" y="12.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF">M</text></svg>',
  cardLarge:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><text x="9" y="12.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF">L</text></svg>',
  allNotes:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.25 7.2002C19.25 6.62777 19.2498 6.24315 19.2256 5.94727C19.2021 5.66027 19.1594 5.52316 19.1133 5.43262C18.9935 5.19751 18.8025 5.00655 18.5674 4.88672C18.4768 4.84059 18.3397 4.79788 18.0527 4.77442C17.7569 4.75024 17.3722 4.75 16.7998 4.75H7.2002C6.62777 4.75 6.24315 4.75024 5.94727 4.77442C5.66027 4.79788 5.52316 4.84059 5.43262 4.88672C5.19751 5.00655 5.00655 5.19751 4.88672 5.43262C4.84059 5.52316 4.79788 5.66027 4.77442 5.94727C4.75024 6.24315 4.75 6.62777 4.75 7.2002V16.7998C4.75 17.3722 4.75024 17.7569 4.77442 18.0527C4.79788 18.3397 4.84059 18.4768 4.88672 18.5674C5.00655 18.8025 5.19751 18.9935 5.43262 19.1133C5.52316 19.1594 5.66027 19.2021 5.94727 19.2256C6.24315 19.2498 6.62777 19.25 7.2002 19.25H16.7998C17.3722 19.25 17.7569 19.2498 18.0527 19.2256C18.3397 19.2021 18.4768 19.1594 18.5674 19.1133C18.8025 18.9935 18.9935 18.8025 19.1133 18.5674C19.1594 18.4768 19.2021 18.3397 19.2256 18.0527C19.2498 17.7569 19.25 17.3722 19.25 16.7998V7.2002ZM16 15.251C16.4142 15.251 16.75 15.5868 16.75 16.001C16.7498 16.415 16.4141 16.751 16 16.751L11 16.75C10.5858 16.75 10.25 16.4142 10.25 16C10.25 15.5858 10.5858 15.25 11 15.25L16 15.251ZM8.00977 15.25C8.42398 15.25 8.75977 15.5858 8.75977 16C8.75977 16.4142 8.42398 16.75 8.00977 16.75H8C7.58579 16.75 7.25 16.4142 7.25 16C7.25 15.5858 7.58579 15.25 8 15.25H8.00977ZM16 11.251C16.4142 11.251 16.75 11.5868 16.75 12.001C16.7498 12.415 16.4141 12.751 16 12.751L11 12.75C10.5858 12.75 10.25 12.4142 10.25 12C10.25 11.5858 10.5858 11.25 11 11.25L16 11.251ZM8.00977 11.25C8.42398 11.25 8.75977 11.5858 8.75977 12C8.75977 12.4142 8.42398 12.75 8.00977 12.75H8C7.58579 12.75 7.25 12.4142 7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H8.00977ZM16 7.25098C16.4142 7.25103 16.75 7.58677 16.75 8.00098C16.7498 8.415 16.4141 8.75098 16 8.75098L11 8.75C10.5858 8.74996 10.25 8.41418 10.25 8C10.25 7.58582 10.5858 7.25 11 7.25L16 7.25098ZM8.00977 7.25C8.42398 7.25 8.75977 7.58579 8.75977 8C8.75977 8.41422 8.42398 8.75 8.00977 8.75H8C7.58579 8.75 7.25 8.41422 7.25 8C7.25 7.58579 7.58579 7.25 8 7.25H8.00977ZM20.75 16.7998C20.75 17.3475 20.751 17.8037 20.7207 18.1748C20.6897 18.5545 20.6219 18.9109 20.4502 19.2481C20.1865 19.7655 19.7655 20.1865 19.2481 20.4502C18.9109 20.6219 18.5545 20.6897 18.1748 20.7207C17.8037 20.751 17.3475 20.75 16.7998 20.75H7.2002C6.65252 20.75 6.19633 20.751 5.8252 20.7207C5.44547 20.6897 5.0891 20.6219 4.75196 20.4502C4.23451 20.1865 3.81346 19.7655 3.54981 19.2481C3.3781 18.9109 3.31033 18.5545 3.2793 18.1748C3.24898 17.8037 3.25 17.3475 3.25 16.7998V7.2002C3.25 6.65252 3.24898 6.19633 3.2793 5.8252C3.31033 5.44547 3.3781 5.0891 3.54981 4.75196C3.81346 4.23451 4.23451 3.81346 4.75196 3.54981C5.0891 3.3781 5.44547 3.31033 5.8252 3.2793C6.19633 3.24898 6.65252 3.25 7.2002 3.25H16.7998C17.3475 3.25 17.8037 3.24898 18.1748 3.2793C18.5545 3.31033 18.9109 3.3781 19.2481 3.54981C19.7655 3.81346 20.1865 4.23451 20.4502 4.75196C20.6219 5.0891 20.6897 5.44547 20.7207 5.8252C20.751 6.19633 20.75 6.65252 20.75 7.2002V16.7998Z" fill="#FFFFFF"/></svg>',
  newNote:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.6113 20.0928C14.0175 20.0127 14.4118 20.2774 14.4922 20.6836C14.5723 21.0897 14.3084 21.484 13.9023 21.5645C13.2866 21.6863 12.6502 21.75 12 21.75C11.3498 21.75 10.7134 21.6863 10.0977 21.5645C9.69164 21.484 9.42772 21.0897 9.50781 20.6836C9.58817 20.2774 9.98249 20.0127 10.3887 20.0928C10.9091 20.1957 11.4481 20.25 12 20.25C12.5519 20.25 13.0909 20.1957 13.6113 20.0928Z" fill="#FFFFFF"/><path d="M4.09863 16.377C4.44268 16.1467 4.90817 16.2392 5.13867 16.583C5.74121 17.483 6.51699 18.2588 7.41699 18.8613C7.7608 19.0918 7.85327 19.5573 7.62305 19.9014C7.39261 20.2456 6.92623 20.3379 6.58203 20.1074C5.51916 19.3958 4.60416 18.4808 3.89258 17.418C3.66214 17.0738 3.75443 16.6074 4.09863 16.377Z" fill="#FFFFFF"/><path d="M18.8613 16.583C19.0918 16.2392 19.5573 16.1467 19.9014 16.377C20.2456 16.6074 20.3379 17.0738 20.1074 17.418C19.3958 18.4808 18.4808 19.3958 17.418 20.1074C17.0738 20.3379 16.6074 20.2456 16.377 19.9014C16.1467 19.5573 16.2392 19.0918 16.583 18.8613C17.483 18.2588 18.2588 17.483 18.8613 16.583Z" fill="#FFFFFF"/><path d="M12 7.25C12.4142 7.25 12.75 7.58579 12.75 8V11.25H16C16.4142 11.25 16.75 11.5858 16.75 12C16.75 12.4142 16.4142 12.75 16 12.75H12.75V16C12.75 16.4142 12.4142 16.75 12 16.75C11.5858 16.75 11.25 16.4142 11.25 16V12.75H8C7.58579 12.75 7.25 12.4142 7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H11.25V8C11.25 7.58579 11.5858 7.25 12 7.25Z" fill="#FFFFFF"/><path d="M2.43555 10.0977C2.51605 9.69164 2.91033 9.42772 3.31641 9.50781C3.7226 9.58817 3.98734 9.98249 3.90723 10.3887C3.80427 10.9091 3.75 11.4481 3.75 12C3.75 12.5519 3.80427 13.0909 3.90723 13.6113C3.98734 14.0175 3.7226 14.4118 3.31641 14.4922C2.91033 14.5723 2.51605 14.3084 2.43555 13.9023C2.31373 13.2866 2.25 12.6502 2.25 12C2.25 11.3498 2.31373 10.7134 2.43555 10.0977Z" fill="#FFFFFF"/><path d="M20.6836 9.50781C21.0897 9.42772 21.484 9.69164 21.5645 10.0977C21.6863 10.7134 21.75 11.3498 21.75 12C21.75 12.6502 21.6863 13.2866 21.5645 13.9023C21.484 14.3084 21.0897 14.5723 20.6836 14.4922C20.2774 14.4118 20.0127 14.0175 20.0928 13.6113C20.1957 13.0909 20.25 12.5519 20.25 12C20.25 11.4481 20.1957 10.9091 20.0928 10.3887C20.0127 9.98249 20.2774 9.58817 20.6836 9.50781Z" fill="#FFFFFF"/><path d="M6.58203 3.89258C6.92623 3.66214 7.39261 3.75443 7.62305 4.09863C7.85327 4.44268 7.7608 4.90817 7.41699 5.13867C6.51699 5.74121 5.74121 6.51699 5.13867 7.41699C4.90817 7.7608 4.44268 7.85327 4.09863 7.62305C3.75443 7.39261 3.66214 6.92623 3.89258 6.58203C4.60416 5.51916 5.51916 4.60416 6.58203 3.89258Z" fill="#FFFFFF"/><path d="M16.377 4.09863C16.6074 3.75443 17.0738 3.66214 17.418 3.89258C18.4808 4.60416 19.3958 5.51916 20.1074 6.58203C20.3379 6.92623 20.2456 7.39261 19.9014 7.62305C19.5573 7.85327 19.0918 7.7608 18.8613 7.41699C18.2588 6.51699 17.483 5.74121 16.583 5.13867C16.2392 4.90817 16.1467 4.44268 16.377 4.09863Z" fill="#FFFFFF"/><path d="M12 2.25C12.6502 2.25 13.2866 2.31373 13.9023 2.43555C14.3084 2.51605 14.5723 2.91033 14.4922 3.31641C14.4118 3.7226 14.0175 3.98734 13.6113 3.90723C13.0909 3.80427 12.5519 3.75 12 3.75C11.4481 3.75 10.9091 3.80427 10.3887 3.90723C9.98249 3.98733 9.58817 3.7226 9.50781 3.31641C9.42772 2.91033 9.69164 2.51605 10.0977 2.43555C10.7134 2.31373 11.3498 2.25 12 2.25Z" fill="#FFFFFF"/></svg>'
};

const EMPTY_NOTE: NoteData = {
  title: "",
  category: "technical",
  body: "",
  fontFamily: NOTE_FONT_FAMILY,
  authorId: "",
  authorName: "",
  updatedAt: ""
};

const AUTHOR_PROFILES: AuthorProfile[] = [
  { id: "zahra", name: "زهرا", initials: "ZA", avatarFill: "#FCE7F3", avatarText: "#831843", avatarSrc: zahraAvatar },
  { id: "mahdi", name: "مهدی", initials: "MA", avatarFill: "#DBEAFE", avatarText: "#1E3A8A", avatarSrc: mahdiAvatar },
  { id: "bahar", name: "بهار", initials: "BA", avatarFill: "#DCFCE7", avatarText: "#14532D", avatarSrc: baharAvatar },
  { id: "lida", name: "لیدا", initials: "LI", avatarFill: "#FEF3C7", avatarText: "#78350F", avatarSrc: lidaAvatar },
  { id: "moein", name: "معین", initials: "MO", avatarFill: "#E0E7FF", avatarText: "#312E81", avatarSrc: moeinAvatar },
  { id: "sajad", name: "سجاد", initials: "SA", avatarFill: "#FEE2E2", avatarText: "#7F1D1D", avatarSrc: sajadAvatar },
  { id: "hasan", name: "حسن", initials: "HA", avatarFill: "#CCFBF1", avatarText: "#134E4A", avatarSrc: hasanAvatar }
];

function scaleValue(value: number, scale: number) {
  return Math.round(value * scale);
}

function hexToSolidPaint(hex: string, opacity = 1): WidgetJSX.SolidPaint {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized, 16);
  return {
    type: "solid",
    color: {
      r: ((value >> 16) & 255) / 255,
      g: ((value >> 8) & 255) / 255,
      b: (value & 255) / 255,
      a: opacity
    },
    opacity: 1
  };
}

function getCategory(key: CategoryKey) {
  return CATEGORIES.find((item) => item.key === key) || CATEGORIES[CATEGORIES.length - 1];
}

function getLegPositionOptions(side: LegSide) {
  return side === "top" || side === "bottom" ? LEG_HORIZONTAL_POSITION_OPTIONS : LEG_VERTICAL_POSITION_OPTIONS;
}

function legPositionToVerticalAlign(position: LegPosition) {
  if (position === "start") return "start";
  if (position === "end") return "end";
  return "center";
}

function legPositionToHorizontalAlign(position: LegPosition) {
  if (position === "start") return "start";
  if (position === "end") return "end";
  return "center";
}

function normalizeCategory(category: string): CategoryKey {
  if (CATEGORIES.some((item) => item.key === category)) return category as CategoryKey;
  return "technical";
}

function gregorianToJalali(gy: number, gm: number, gd: number) {
  const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  const gyBase = gy - 1600;
  const gmBase = gm - 1;
  const gdBase = gd - 1;

  let gDayNo =
    365 * gyBase +
    Math.floor((gyBase + 3) / 4) -
    Math.floor((gyBase + 99) / 100) +
    Math.floor((gyBase + 399) / 400);

  for (let i = 0; i < gmBase; i += 1) {
    gDayNo += gDaysInMonth[i];
  }

  if (gmBase > 1 && ((gyBase + 1600) % 4 === 0 && ((gyBase + 1600) % 100 !== 0 || (gyBase + 1600) % 400 === 0))) {
    gDayNo += 1;
  }

  gDayNo += gdBase;

  let jDayNo = gDayNo - 79;
  const jNp = Math.floor(jDayNo / 12053);
  jDayNo %= 12053;

  let jy = 979 + 33 * jNp + 4 * Math.floor(jDayNo / 1461);
  jDayNo %= 1461;

  if (jDayNo >= 366) {
    jy += Math.floor((jDayNo - 1) / 365);
    jDayNo = (jDayNo - 1) % 365;
  }

  let jm = 0;
  for (; jm < 11 && jDayNo >= jDaysInMonth[jm]; jm += 1) {
    jDayNo -= jDaysInMonth[jm];
  }

  return {
    year: jy,
    month: jm + 1,
    day: jDayNo + 1
  };
}

function toTwoDigit(value: number) {
  return value < 10 ? `0${value}` : `${value}`;
}

function formatUpdatedAt(value: string) {
  if (!value) return "Not updated yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not updated yet";
  const jalaliDate = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${jalaliDate.year}/${toTwoDigit(jalaliDate.month)}/${toTwoDigit(jalaliDate.day)}`;
}

function withDefaultAuthor(note: NoteData): NoteData {
  if (note.authorName) return normalizeAuthor(note);

  const profile = AUTHOR_PROFILES[0];
  return {
    ...note,
    authorId: profile.id,
    authorName: profile.name,
    updatedAt: note.updatedAt || new Date().toISOString()
  };
}

function displayAuthorName(note: NoteData) {
  return note.authorName || "";
}

function findAuthorProfileById(id: string) {
  return AUTHOR_PROFILES.find((author) => author.id === id);
}

function findAuthorProfileByName(name: string) {
  return AUTHOR_PROFILES.find((author) => author.name.toLowerCase() === name.trim().toLowerCase());
}

function getAuthorProfile(note: NoteData) {
  return findAuthorProfileById(note.authorId) || findAuthorProfileByName(displayAuthorName(note)) || AUTHOR_PROFILES[0];
}

function normalizeAuthor(note: NoteData): NoteData {
  const profile = findAuthorProfileById(note.authorId) || findAuthorProfileByName(note.authorName);
  if (!profile) return note;
  return {
    ...note,
    authorId: profile.id,
    authorName: profile.name
  };
}

function normalizeUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeLinks(links: LinkData[]) {
  return links
    .map((link) => ({
      id: link.id || `${Date.now()}-${link.title}`,
      title: link.title.trim(),
      url: normalizeUrl(link.url)
    }))
    .filter((link) => link.title && link.url);
}

function normalizeFullEditPayload(payload: FullEditPayload): FullEditPayload {
  return {
    title: payload.title,
    body: payload.body,
    category: normalizeCategory(payload.category),
    authorId: payload.authorId,
    links: normalizeLinks(payload.links)
  };
}

function getNodePage(node: BaseNode): PageNode | null {
  let parent = node.parent;
  while (parent) {
    if (parent.type === "PAGE") return parent;
    parent = parent.parent;
  }
  return null;
}

function widgetNodeToNoteListItem(node: WidgetNode): NoteListItem {
  const state = node.widgetSyncedState as {
    note?: Partial<NoteData>;
    title?: string;
    body?: string;
  };
  const noteState = state.note || {};
  const categoryKey = normalizeCategory(noteState.category || "technical");
  const category = getCategory(categoryKey);
  const theme = CATEGORY_THEME[categoryKey];
  const title = typeof state.title === "string" && state.title.trim()
    ? state.title.trim()
    : typeof noteState.title === "string" && noteState.title.trim()
      ? noteState.title.trim()
      : "Untitled";
  const authorName =
    typeof noteState.authorName === "string" && noteState.authorName.trim()
      ? noteState.authorName.trim()
      : findAuthorProfileById(noteState.authorId || "")?.name || AUTHOR_PROFILES[0].name;
  const page = getNodePage(node);

  return {
    id: node.id,
    title,
    authorName,
    pageName: page?.name || "Page",
    category: categoryKey,
    categoryLabel: category.label,
    categoryColor: category.color,
    categoryBg: theme.bg,
    categoryStatus: theme.linkText,
    updatedLabel: formatUpdatedAt(noteState.updatedAt || "")
  };
}

function openAllNotesModal(currentWidgetNodeId: string) {
  waitForTask(
    new Promise<void>((resolve) => {
      figma.showUI(__html__, { width: 450, height: 580, title: "All Notes" });
      figma.ui.postMessage({ mode: "allNotes", notes: [], loading: true });

      figma.ui.onmessage = async (message: { type: string; payload?: { nodeId?: string } | ResizePayload }) => {
        if (message.type === "resize" && message.payload) {
          figma.ui.resize((message.payload as ResizePayload).width, (message.payload as ResizePayload).height);
          return;
        }

        if (message.type === "cancel") {
          figma.closePlugin();
          resolve();
          return;
        }

        if (message.type !== "selectNote" || !message.payload || !("nodeId" in message.payload)) return;

        const node = await figma.getNodeByIdAsync(message.payload.nodeId || "");
        if (!node || node.type !== "WIDGET") return;

        const page = getNodePage(node);
        if (page) await figma.setCurrentPageAsync(page);
        figma.currentPage.selection = [node];
        figma.viewport.scrollAndZoomIntoView([node]);
        figma.closePlugin();
        resolve();
      };

      (async () => {
        try {
          await figma.loadAllPagesAsync();
          const currentWidgetNode = await figma.getNodeByIdAsync(currentWidgetNodeId);
          if (!currentWidgetNode || currentWidgetNode.type !== "WIDGET") {
            figma.ui.postMessage({ mode: "allNotes", notes: [], error: "Could not find this widget." });
            return;
          }

          const currentWidgetId = currentWidgetNode.widgetId;
          const noteNodes = figma.root
            .findWidgetNodesByWidgetId(currentWidgetId)
            .sort((a, b) => {
              const pageA = getNodePage(a)?.name || "";
              const pageB = getNodePage(b)?.name || "";
              if (pageA !== pageB) return pageA.localeCompare(pageB);
              return a.y - b.y || a.x - b.x;
            });
          const notes = noteNodes.map(widgetNodeToNoteListItem);
          figma.ui.postMessage({ mode: "allNotes", notes });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Could not load notes.";
          figma.ui.postMessage({ mode: "allNotes", notes: [], error: message });
        }
      })();
    })
  );
}

function openManageLinksModal(links: LinkData[], onSave: (links: LinkData[]) => void) {
  waitForTask(
    new Promise<void>((resolve) => {
      figma.showUI(__html__, { width: 450, height: 220, title: "مدیریت لینک‌ها" });
      figma.ui.postMessage({ mode: "link", links });

      figma.ui.onmessage = (message: { type: string; payload?: { links: LinkData[] } | ResizePayload }) => {
        if (message.type === "resize" && message.payload) {
          figma.ui.resize((message.payload as ResizePayload).width, (message.payload as ResizePayload).height);
          return;
        }

        if (message.type === "cancel") {
          figma.closePlugin();
          resolve();
          return;
        }

        if (message.type !== "saveLinks" || !message.payload) return;

        const payload = message.payload as { links: LinkData[] };
        onSave(normalizeLinks(payload.links));
        figma.closePlugin();
        resolve();
      };
    })
  );
}

function openCategoryModal(selectedCategory: CategoryKey, onSave: (category: CategoryKey) => void) {
  waitForTask(
    new Promise<void>((resolve) => {
      figma.showUI(__html__, { width: 216, height: 224, title: "Category" });
      figma.ui.postMessage({
        mode: "category",
        selectedCategory,
        categories: CATEGORIES
      });

      figma.ui.onmessage = (message: { type: string; payload?: { category: CategoryKey } | ResizePayload }) => {
        if (message.type === "resize" && message.payload) {
          figma.ui.resize((message.payload as ResizePayload).width, (message.payload as ResizePayload).height);
          return;
        }

        if (message.type === "cancel") {
          figma.closePlugin();
          resolve();
          return;
        }

        if (message.type !== "saveCategory" || !message.payload) return;

        const payload = message.payload as { category: CategoryKey };
        onSave(payload.category);
        figma.closePlugin();
        resolve();
      };
    })
  );
}

function openAuthorModal(selectedAuthorId: string, onSave: (authorId: string) => void) {
  waitForTask(
    new Promise<void>((resolve) => {
      figma.showUI(__html__, { width: 216, height: 304, title: "Author" });
      figma.ui.postMessage({
        mode: "author",
        selectedAuthorId,
        authors: AUTHOR_PROFILES.map(({ id, name, initials, avatarFill, avatarSrc }) => ({ id, name, initials, avatarFill, avatarSrc }))
      });

      figma.ui.onmessage = (message: { type: string; payload?: { authorId: string } | ResizePayload }) => {
        if (message.type === "resize" && message.payload) {
          figma.ui.resize((message.payload as ResizePayload).width, (message.payload as ResizePayload).height);
          return;
        }

        if (message.type === "cancel") {
          figma.closePlugin();
          resolve();
          return;
        }

        if (message.type !== "saveAuthor" || !message.payload) return;

        const payload = message.payload as { authorId: string };
        onSave(payload.authorId);
        figma.closePlugin();
        resolve();
      };
    })
  );
}

function openFullEditModal({
  title,
  body,
  category,
  authorId,
  links,
  openLinkDialog = false,
  onLive,
  onSave
}: {
  title: string;
  body: string;
  category: CategoryKey;
  authorId: string;
  links: LinkData[];
  openLinkDialog?: boolean;
  onLive?: (payload: FullEditPayload) => void;
  onSave: (payload: FullEditPayload) => void;
}) {
  waitForTask(
    new Promise<void>((resolve) => {
      figma.showUI(__html__, { width: 450, height: 374, title: "Edit Note" });
      figma.ui.postMessage({
        mode: "fullEdit",
        title,
        body,
        category,
        authorId,
        links,
        openLinkDialog,
        categories: CATEGORIES,
        authors: AUTHOR_PROFILES.map(({ id, name, initials, avatarFill, avatarSrc }) => ({ id, name, initials, avatarFill, avatarSrc }))
      });

      figma.ui.onmessage = (message: {
        type: string;
        payload?: FullEditPayload | ResizePayload;
      }) => {
        if (message.type === "resize" && message.payload) {
          figma.ui.resize((message.payload as ResizePayload).width, (message.payload as ResizePayload).height);
          return;
        }

        if (message.type === "cancel") {
          figma.closePlugin();
          resolve();
          return;
        }

        if (message.type === "liveUpdate" && message.payload) {
          onLive?.(normalizeFullEditPayload(message.payload as FullEditPayload));
          return;
        }

        if (message.type !== "saveNote" || !message.payload) return;

        onSave(normalizeFullEditPayload(message.payload as FullEditPayload));
        figma.closePlugin();
        resolve();
      };
    })
  );
}

function ConnectorLeg({
  side,
  length,
  scale,
  stroke
}: {
  side: LegSide;
  length: LegLength;
  scale: number;
  stroke: string;
}) {
  if (side === "none") return null;

  const lineLength = scaleValue(LEG_LENGTHS[length], scale);
  const thickness = Math.max(2, scaleValue(2, scale));
  const dot = scaleValue(11, scale);

  const line = (width: number, height: number) => (
    <Frame width={width} height={height} fill={stroke} cornerRadius={thickness / 2} />
  );

  if (side === "left") {
    return (
      <AutoLayout direction="horizontal" spacing={0} verticalAlignItems="center">
        <AutoLayout direction="horizontal" spacing={0} verticalAlignItems="center">
          <Frame width={dot} height={dot} cornerRadius={dot / 2} fill={stroke} />
          {line(lineLength, thickness)}
        </AutoLayout>
      </AutoLayout>
    );
  }

  if (side === "right") {
    return (
      <AutoLayout direction="horizontal" spacing={0} verticalAlignItems="center">
        <AutoLayout direction="horizontal" spacing={0} verticalAlignItems="center">
          {line(lineLength, thickness)}
          <Frame width={dot} height={dot} cornerRadius={dot / 2} fill={stroke} />
        </AutoLayout>
      </AutoLayout>
    );
  }

  if (side === "top") {
    return (
      <AutoLayout direction="vertical" spacing={0} horizontalAlignItems="center">
        <Frame width={dot} height={dot} cornerRadius={dot / 2} fill={stroke} />
        {line(thickness, lineLength)}
      </AutoLayout>
    );
  }

  return (
    <AutoLayout direction="vertical" spacing={0} horizontalAlignItems="center">
      {line(thickness, lineLength)}
      <Frame width={dot} height={dot} cornerRadius={dot / 2} fill={stroke} />
    </AutoLayout>
  );
}

function EditIcon({ color, size }: { color: string; size: number }) {
  return (
    <SVG
      width={size}
      height={size}
      src={`<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="${color}" stroke-width="0.96" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.93666 8.98336C5.9602 8.86564 5.97198 8.80679 5.9935 8.75191C6.01261 8.70319 6.03739 8.6569 6.06732 8.61398C6.10104 8.56562 6.14349 8.52318 6.22837 8.4383L9 5.66667C9.36819 5.29848 9.96514 5.29848 10.3333 5.66667C10.7015 6.03486 10.7015 6.63181 10.3333 7L7.5617 9.77163C7.47682 9.85651 7.43438 9.89896 7.38602 9.93268C7.3431 9.96261 7.29681 9.98739 7.24809 10.0065C7.19321 10.028 7.13436 10.0398 7.01664 10.0633L5.66667 10.3333L5.93666 8.98336Z" stroke="${color}" stroke-width="0.96" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
    />
  );
}

function LinkIcon({ color, size }: { color: string; size: number }) {
  return (
    <SVG
      width={size}
      height={size}
      src={`<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.1 5.9L7.70004 5.29996C8.52851 4.47149 9.87174 4.47149 10.7002 5.29996C11.5287 6.12844 11.5287 7.47167 10.7002 8.30014L10.1002 8.90018M5.89993 7.10007L5.29989 7.70011C4.47142 8.52858 4.47142 9.87181 5.29989 10.7003C6.12837 11.5288 7.4716 11.5288 8.30007 10.7003L8.90011 10.1002M6.79998 9.2002L9.20012 6.80005M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="${color}" stroke-width="0.96" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
    />
  );
}

function LinkOutIcon({ color, size, opacity = 1 }: { color: string; size: number; opacity?: number }) {
  return (
    <SVG
      width={size}
      height={size}
      src={`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="${opacity}" d="M5.10558 5.10546C8.91319 1.29785 15.087 1.29785 18.8946 5.10546C22.7023 8.91308 22.7023 15.0869 18.8946 18.8945C16.5038 21.2853 13.1799 22.1739 10.0978 21.5635C9.69158 21.483 9.42771 21.0888 9.50793 20.6826C9.58838 20.2764 9.98258 20.0115 10.3888 20.0918C13.0009 20.6091 15.812 19.8561 17.8341 17.834C21.0559 14.6122 21.0559 9.38784 17.8341 6.16601C14.6123 2.94419 9.38795 2.94419 6.16613 6.16601C4.14404 8.1881 3.39098 10.9992 3.90832 13.6113C3.98859 14.0175 3.72371 14.4117 3.3175 14.4922C2.91132 14.5724 2.51708 14.3085 2.43664 13.9023C1.82625 10.8202 2.71477 7.49628 5.10558 5.10546ZM14.7501 15.6572C14.7499 16.0713 14.4142 16.4072 14.0001 16.4072C13.586 16.4072 13.2503 16.0713 13.2501 15.6572V11.8105L6.16613 18.8945C5.87321 19.1871 5.39838 19.1873 5.10558 18.8945C4.81279 18.6017 4.81299 18.1269 5.10558 17.834L12.1896 10.75H8.34289C7.92884 10.7498 7.59289 10.4141 7.59289 10C7.59289 9.58591 7.92884 9.2502 8.34289 9.25H14.0001C14.4143 9.25 14.7501 9.58578 14.7501 10V15.6572Z" fill="${color}"/></svg>`}
    />
  );
}

function LinkButton({ link, scale, color }: { link: LinkData; scale: number; color: string }) {
  const iconSize = scaleValue(16, scale);
  const fontSize = scaleValue(14, scale);

  return (
    <AutoLayout
      direction="horizontal"
      spacing={scaleValue(4, scale)}
      verticalAlignItems="center"
      horizontalAlignItems="center"
      onClick={() => figma.openExternal(link.url)}
    >
      <Text
        href={link.url}
        font={BODY_FONT}
        fontFamily={NOTE_FONT_FAMILY}
        fontSize={fontSize}
        fontWeight={BODY_FONT_WEIGHT}
        fill={color}
        horizontalAlignText="right"
      >
        {link.title}
      </Text>
      <LinkOutIcon color={color} size={iconSize} opacity={0.5} />
    </AutoLayout>
  );
}

function NoteCard({
  note,
  scale,
  cardWidth,
  legSide,
  legPosition,
  legLength,
  title,
  body,
  links,
  hideTitle,
  singleTextMode,
  onCategoryClick,
  onAuthorClick,
  onEditClick,
  onLinksClick,
  onTitleChange,
  onBodyChange
}: {
  note: NoteData;
  scale: number;
  cardWidth: CardWidth;
  legSide: LegSide;
  legPosition: LegPosition;
  legLength: LegLength;
  title: string;
  body: string;
  links: LinkData[];
  hideTitle: boolean;
  singleTextMode: boolean;
  onCategoryClick: () => void;
  onAuthorClick: () => void;
  onEditClick: () => void;
  onLinksClick: () => void;
  onTitleChange: (title: string) => void;
  onBodyChange: (body: string) => void;
}) {
  const author = getAuthorProfile(note);
  const authorLabel = author.name || "Select author";
  const category = getCategory(note.category);
  const theme = CATEGORY_THEME[note.category];
  const width = scaleValue(CARD_WIDTHS[cardWidth], scale);
  const contentPadding = scaleValue(12, scale);
  const titleSize = scaleValue(20, scale);
  const bodySize = scaleValue(16, scale);
  const metaSize = scaleValue(10, scale);
  const tagSize = scaleValue(10, scale);
  const stroke = singleTextMode ? "#000000" : category.color;
  const cardRadius = scaleValue(8, scale);
  const simpleTextFill = "#111111";
  const simplePlaceholderFill = hexToSolidPaint(simpleTextFill, 0.6);
  const contentPlaceholderFill = hexToSolidPaint(theme.text, 0.6);
  const iconHoverFill = hexToSolidPaint(theme.text, 0.15);
  const legEdgeOffset = scaleValue(28, scale);
  const sideLegPadding =
    legPosition === "start"
      ? { top: legEdgeOffset, right: 0, bottom: 0, left: 0 }
      : legPosition === "end"
        ? { top: 0, right: 0, bottom: legEdgeOffset, left: 0 }
        : { top: 0, right: 0, bottom: 0, left: 0 };
  const verticalLegPadding =
    legPosition === "start"
      ? { top: 0, right: 0, bottom: 0, left: legEdgeOffset }
      : legPosition === "end"
        ? { top: 0, right: legEdgeOffset, bottom: 0, left: 0 }
        : { top: 0, right: 0, bottom: 0, left: 0 };

  const avatar = (
    <AutoLayout
      width={scaleValue(16, scale)}
      height={scaleValue(16, scale)}
      cornerRadius={scaleValue(9, scale)}
      fill={author.avatarFill}
      horizontalAlignItems="center"
      verticalAlignItems="center"
    >
      {author.avatarSrc ? (
        <Image
          src={author.avatarSrc}
          width={scaleValue(16, scale)}
          height={scaleValue(16, scale)}
          cornerRadius={scaleValue(9, scale)}
        />
      ) : (
        <Text
          font={META_BOLD_FONT}
          fontFamily={NOTE_FONT_FAMILY}
          fontSize={scaleValue(8, scale)}
          fontWeight={700}
          fill={author.avatarText}
        >
          {author.initials}
        </Text>
      )}
    </AutoLayout>
  );

  const simpleCard = (
    <AutoLayout
      direction="vertical"
      width={width}
      padding={contentPadding}
      cornerRadius={cardRadius}
      stroke={stroke}
      strokeWidth={scaleValue(2, scale)}
      fill="#FFFFFF"
      horizontalAlignItems="end"
    >
      <Input
        value={body}
        placeholder="متن یادداشت"
        font={BODY_FONT}
        fontFamily={NOTE_FONT_FAMILY}
        fontSize={bodySize}
        fontWeight={BODY_FONT_WEIGHT}
        lineHeight={scaleValue(24, scale)}
        fill={simpleTextFill}
        width="fill-parent"
        horizontalAlignText="right"
        inputBehavior="multiline"
        placeholderProps={{
          font: BODY_FONT,
          fill: simplePlaceholderFill,
          fontFamily: NOTE_FONT_FAMILY,
          fontSize: bodySize,
          fontWeight: BODY_FONT_WEIGHT,
          opacity: 1
        } as unknown as { fill: WidgetJSX.SolidPaint; opacity: number }}
        onTextEditEnd={(event) => onBodyChange(event.characters)}
      />
    </AutoLayout>
  );

  const fullCard = (
    <AutoLayout
      direction="vertical"
      width={width}
      padding={contentPadding}
      spacing={scaleValue(4, scale)}
      cornerRadius={cardRadius}
      stroke={stroke}
      strokeWidth={scaleValue(2, scale)}
      fill={theme.bg}
      horizontalAlignItems="end"
    >
      <AutoLayout direction="vertical" width="fill-parent" spacing={scaleValue(8, scale)} horizontalAlignItems="end">
        <AutoLayout
          padding={{
            top: scaleValue(2, scale),
            right: scaleValue(12, scale),
            bottom: scaleValue(2, scale),
            left: scaleValue(12, scale)
          }}
          cornerRadius={scaleValue(9, scale)}
          fill={category.color}
          hoverStyle={{ fill: category.color, opacity: 0.82 }}
          onClick={onCategoryClick}
        >
          <Text
            font={META_MEDIUM_FONT}
            fontFamily={NOTE_FONT_FAMILY}
            fontSize={tagSize}
            fontWeight={BODY_FONT_WEIGHT}
            fill="#FFFFFF"
            horizontalAlignText="right"
          >
            {category.label}
          </Text>
        </AutoLayout>

        {!hideTitle && (
          <Input
            value={title}
            placeholder="عنوان یادداشت"
            font={TITLE_FONT}
            fontFamily={NOTE_FONT_FAMILY}
            fontSize={titleSize}
            fontWeight={TITLE_FONT_WEIGHT}
            lineHeight={scaleValue(28, scale)}
            fill={theme.text}
            width="fill-parent"
            horizontalAlignText="right"
            inputBehavior="wrap"
            placeholderProps={{
              font: TITLE_FONT,
              fill: contentPlaceholderFill,
              fontFamily: NOTE_FONT_FAMILY,
              fontSize: titleSize,
              fontWeight: TITLE_FONT_WEIGHT,
              opacity: 1
            } as unknown as { fill: WidgetJSX.SolidPaint; opacity: number }}
            onTextEditEnd={(event) => onTitleChange(event.characters)}
          />
        )}
      </AutoLayout>

      <AutoLayout
        direction="vertical"
        width="fill-parent"
        spacing={scaleValue(4, scale)}
        horizontalAlignItems="end"
      >
        <Input
          value={body}
          placeholder="متن یادداشت"
          font={BODY_FONT}
          fontFamily={NOTE_FONT_FAMILY}
          fontSize={bodySize}
          fontWeight={BODY_FONT_WEIGHT}
          lineHeight={scaleValue(24, scale)}
          fill={theme.text}
          width="fill-parent"
          horizontalAlignText="right"
          inputBehavior="multiline"
          placeholderProps={{
            font: BODY_FONT,
            fill: contentPlaceholderFill,
            fontFamily: NOTE_FONT_FAMILY,
            fontSize: bodySize,
            fontWeight: BODY_FONT_WEIGHT,
            opacity: 1
          } as unknown as { fill: WidgetJSX.SolidPaint; opacity: number }}
          onTextEditEnd={(event) => onBodyChange(event.characters)}
        />

        {links.length > 0 && (
          <AutoLayout
            direction="horizontal"
            width="fill-parent"
            wrap
            spacing={{ horizontal: scaleValue(12, scale), vertical: scaleValue(12, scale) }}
            padding={{ top: scaleValue(16, scale), right: 0, bottom: 0, left: 0 }}
            horizontalAlignItems="end"
            verticalAlignItems="center"
          >
            {[...links].reverse().map((link) => (
              <LinkButton key={link.id} link={link} scale={scale} color={theme.linkText} />
            ))}
          </AutoLayout>
        )}
      </AutoLayout>

      <AutoLayout
        direction="horizontal"
        width="fill-parent"
        padding={{ top: scaleValue(16, scale), right: 0, bottom: 0, left: 0 }}
        verticalAlignItems="center"
      >
        <AutoLayout direction="horizontal" spacing={scaleValue(4, scale)} verticalAlignItems="center">
          <AutoLayout
            width={scaleValue(18, scale)}
            height={scaleValue(18, scale)}
            cornerRadius={scaleValue(9, scale)}
            horizontalAlignItems="center"
            verticalAlignItems="center"
            hoverStyle={{ fill: iconHoverFill }}
            onClick={onEditClick}
          >
            <EditIcon color={theme.text} size={scaleValue(16, scale)} />
          </AutoLayout>
          <AutoLayout
            width={scaleValue(18, scale)}
            height={scaleValue(18, scale)}
            cornerRadius={scaleValue(9, scale)}
            horizontalAlignItems="center"
            verticalAlignItems="center"
            hoverStyle={{ fill: iconHoverFill }}
            onClick={onLinksClick}
          >
            <LinkIcon color={theme.text} size={scaleValue(16, scale)} />
          </AutoLayout>
        </AutoLayout>
        <Frame width="fill-parent" height={1} opacity={0} />
        <AutoLayout direction="horizontal" spacing={scaleValue(4, scale)} verticalAlignItems="center">
          <Text
            font={FOOTER_META_FONT}
            fontFamily="Inter"
            fontSize={metaSize}
            fontWeight={500}
            fill={theme.secondaryText}
            horizontalAlignText="right"
          >
            {formatUpdatedAt(note.updatedAt)}
          </Text>
          <Frame
            width={scaleValue(4, scale)}
            height={scaleValue(4, scale)}
            cornerRadius={scaleValue(2, scale)}
            fill={theme.secondaryText}
            opacity={0.4}
          />
          <AutoLayout
            direction="horizontal"
            spacing={scaleValue(4, scale)}
            verticalAlignItems="center"
            hoverStyle={{ opacity: 0.72 }}
            onClick={onAuthorClick}
          >
            <Text
              font={META_MEDIUM_FONT}
              fontFamily={NOTE_FONT_FAMILY}
              fontSize={metaSize}
              fontWeight={500}
              fill={theme.secondaryText}
              horizontalAlignText="right"
            >
              {authorLabel}
            </Text>
            {avatar}
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  );

  const card = singleTextMode ? simpleCard : fullCard;

  if (legSide === "left") {
    return (
      <AutoLayout direction="horizontal" spacing={0} verticalAlignItems={legPositionToVerticalAlign(legPosition)}>
        <AutoLayout direction="vertical" padding={sideLegPadding}>
          <ConnectorLeg side="left" length={legLength} scale={scale} stroke={stroke} />
        </AutoLayout>
        {card}
      </AutoLayout>
    );
  }

  if (legSide === "right") {
    return (
      <AutoLayout direction="horizontal" spacing={0} verticalAlignItems={legPositionToVerticalAlign(legPosition)}>
        {card}
        <AutoLayout direction="vertical" padding={sideLegPadding}>
          <ConnectorLeg side="right" length={legLength} scale={scale} stroke={stroke} />
        </AutoLayout>
      </AutoLayout>
    );
  }

  if (legSide === "top") {
    return (
      <AutoLayout direction="vertical" spacing={0} horizontalAlignItems={legPositionToHorizontalAlign(legPosition)}>
        <AutoLayout direction="horizontal" padding={verticalLegPadding}>
          <ConnectorLeg side="top" length={legLength} scale={scale} stroke={stroke} />
        </AutoLayout>
        {card}
      </AutoLayout>
    );
  }

  if (legSide === "bottom") {
    return (
      <AutoLayout direction="vertical" spacing={0} horizontalAlignItems={legPositionToHorizontalAlign(legPosition)}>
        {card}
        <AutoLayout direction="horizontal" padding={verticalLegPadding}>
          <ConnectorLeg side="bottom" length={legLength} scale={scale} stroke={stroke} />
        </AutoLayout>
      </AutoLayout>
    );
  }

  return card;
}

function ConsistencyNoteWidget() {
  const widgetId = useWidgetId();
  const [note, setNote] = useSyncedState<NoteData>("note", EMPTY_NOTE);
  const [title, setTitle] = useSyncedState("title", "");
  const [body, setBody] = useSyncedState("body", "");
  const [contentMigrated, setContentMigrated] = useSyncedState("contentMigrated", false);
  const [links, setLinks] = useSyncedState<LinkData[]>("links", []);
  const [scaleIndex, setScaleIndex] = useSyncedState("scaleIndex", 3);
  const [scaleIndexMigrated, setScaleIndexMigrated] = useSyncedState("scaleIndexMigratedV2", false);
  const [cardWidth, setCardWidth] = useSyncedState<CardWidth>("cardWidth", "small");
  const [legSide, setLegSide] = useSyncedState<LegSide>("legSide", "left");
  const [legPosition, setLegPosition] = useSyncedState<LegPosition>("legPosition", "middle");
  const [legLength, setLegLength] = useSyncedState<LegLength>("legLength", "small");
  const [hideTitle, setHideTitle] = useSyncedState("hideTitle", false);
  const [singleTextMode, setSingleTextMode] = useSyncedState("singleTextMode", false);

  const scale = SCALE_STEPS[Math.min(Math.max(scaleIndex, 0), SCALE_STEPS.length - 1)];

  useEffect(() => {
    if (!scaleIndexMigrated) {
      setScaleIndex(SCALE_INDEX_MIGRATION[scaleIndex] ?? Math.min(Math.max(scaleIndex, 0), SCALE_STEPS.length - 1));
      setScaleIndexMigrated(true);
      return;
    }

    if (!note.authorName) {
      setNote(withDefaultAuthor(note));
    } else {
      const normalized = normalizeAuthor(note);
      const normalizedCategory = normalizeCategory(normalized.category);
      if (
        normalized.authorId !== note.authorId ||
        normalized.authorName !== note.authorName ||
        normalizedCategory !== note.category
      ) {
        setNote({
          ...normalized,
          category: normalizedCategory
        });
      }
    }

    if (!contentMigrated) {
      setTitle(note.title);
      setBody(note.body);
      setContentMigrated(true);
    }
  });

  usePropertyMenu(
    [
      {
        itemType: "toggle",
        propertyName: "advancedMode",
        tooltip: "Advanced mode",
        isToggled: !singleTextMode,
        icon: MENU_ICONS.simpleAdvanced
      },
      { itemType: "separator" },
      {
        itemType: "toggle",
        propertyName: "cardWidthSmall",
        tooltip: "Small",
        isToggled: cardWidth === "small",
        icon: MENU_ICONS.cardSmall
      },
      {
        itemType: "toggle",
        propertyName: "cardWidthMedium",
        tooltip: "Medium",
        isToggled: cardWidth === "medium",
        icon: MENU_ICONS.cardMedium
      },
      {
        itemType: "toggle",
        propertyName: "cardWidthLarge",
        tooltip: "Large",
        isToggled: cardWidth === "large",
        icon: MENU_ICONS.cardLarge
      },
      { itemType: "separator" },
      {
        itemType: "dropdown",
        propertyName: "legSide",
        tooltip: "Leg direction",
        selectedOption: legSide,
        options: LEG_SIDE_OPTIONS
      },
      ...(legSide === "none"
        ? []
        : ([
            {
              itemType: "dropdown",
              propertyName: "legPosition",
              tooltip: "Leg position",
              selectedOption: legPosition,
              options: getLegPositionOptions(legSide)
            },
            {
              itemType: "dropdown",
              propertyName: "legLength",
              tooltip: "Leg length",
              selectedOption: legLength,
              options: LEG_LENGTH_OPTIONS
            }
          ] as const)),
      { itemType: "separator" },
      { itemType: "action", propertyName: "scaleDown", tooltip: "Smaller", icon: MENU_ICONS.scaleDown },
      { itemType: "action", propertyName: "scaleUp", tooltip: "Larger", icon: MENU_ICONS.scaleUp },
      { itemType: "separator" },
      { itemType: "action", propertyName: "allNotes", tooltip: "All notes", icon: MENU_ICONS.allNotes },
      { itemType: "action", propertyName: "newNote", tooltip: "Add new note", icon: MENU_ICONS.newNote }
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "advancedMode") {
        setSingleTextMode(!singleTextMode);
        return;
      }

      if (propertyName === "cardWidthLarge") {
        setCardWidth("large");
        return;
      }

      if (propertyName === "cardWidthMedium") {
        setCardWidth("medium");
        return;
      }

      if (propertyName === "cardWidthSmall") {
        setCardWidth("small");
        return;
      }

      if (propertyName === "category" && propertyValue) {
        setNote({
          ...note,
          category: normalizeCategory(propertyValue),
          fontFamily: NOTE_FONT_FAMILY,
          updatedAt: new Date().toISOString()
        });
        return;
      }

      if (propertyName === "author" && propertyValue) {
        const author = findAuthorProfileById(propertyValue);
        if (!author) return;
        setNote({
          ...note,
          authorName: author.name,
          authorId: author.id,
          fontFamily: NOTE_FONT_FAMILY,
          updatedAt: new Date().toISOString()
        });
        return;
      }

      if (propertyName === "legSide" && propertyValue) {
        setLegSide(propertyValue as LegSide);
        return;
      }

      if (propertyName === "legPosition" && propertyValue) {
        setLegPosition(propertyValue as LegPosition);
        return;
      }

      if (propertyName === "legLength" && propertyValue) {
        setLegLength(propertyValue as LegLength);
        return;
      }

      if (propertyName === "scaleDown") {
        setScaleIndex(Math.max(0, scaleIndex - 1));
        return;
      }

      if (propertyName === "scaleUp") {
        setScaleIndex(Math.min(SCALE_STEPS.length - 1, scaleIndex + 1));
        return;
      }

      if (propertyName === "allNotes") {
        openAllNotesModal(widgetId);
        return;
      }

      if (propertyName === "newNote") {
        waitForTask(
          (async () => {
            const widgetNode = await figma.getNodeByIdAsync(widgetId);
            if (!widgetNode || widgetNode.type !== "WIDGET") return;

            const profile = getAuthorProfile(note);
            const clonedWidget = widgetNode.cloneWidget({
              note: {
                ...EMPTY_NOTE,
                authorId: profile.id,
                authorName: profile.name,
                updatedAt: new Date().toISOString()
              },
              title: "",
              body: "",
              contentMigrated: true,
              links: [],
              scaleIndex,
              cardWidth,
              legSide,
              legPosition,
              legLength,
              hideTitle: false,
              singleTextMode: false
            });

            widgetNode.parent?.appendChild(clonedWidget);
            clonedWidget.x = widgetNode.x + widgetNode.width + scaleValue(48, scale);
            clonedWidget.y = widgetNode.y;
            figma.currentPage.selection = [clonedWidget];
            figma.viewport.scrollAndZoomIntoView([clonedWidget]);
          })()
        );
      }
    }
  );

  const handleTitleChange = (title: string) => {
    setTitle(title);
  };

  const handleBodyChange = (body: string) => {
    setBody(body);
    setNote({
      ...note,
      fontFamily: NOTE_FONT_FAMILY,
      updatedAt: new Date().toISOString()
    });
  };

  const handleCategorySelect = () => {
    openCategoryModal(note.category, (category) => {
      setNote({
        ...note,
        category: normalizeCategory(category),
        fontFamily: NOTE_FONT_FAMILY,
        updatedAt: new Date().toISOString()
      });
    });
  };

  const handleAuthorSelect = () => {
    openAuthorModal(getAuthorProfile(note).id, (authorId) => {
      const author = findAuthorProfileById(authorId);
      if (!author) return;
      setNote({
        ...note,
        authorId: author.id,
        authorName: author.name,
        fontFamily: NOTE_FONT_FAMILY,
        updatedAt: new Date().toISOString()
      });
    });
  };

  const applyFullEditPayload = (payload: FullEditPayload) => {
    const author = findAuthorProfileById(payload.authorId) || getAuthorProfile(note);
    setTitle(payload.title);
    setBody(payload.body);
    setLinks(payload.links);
    setNote({
      ...note,
      category: normalizeCategory(payload.category),
      authorId: author.id,
      authorName: author.name,
      fontFamily: NOTE_FONT_FAMILY,
      updatedAt: new Date().toISOString()
    });
  };

  const handleFullEdit = () => {
    openFullEditModal({
      title,
      body,
      category: note.category,
      authorId: getAuthorProfile(note).id,
      links,
      onLive: applyFullEditPayload,
      onSave: applyFullEditPayload
    });
  };

  const handleLinksSelect = () => {
    openFullEditModal({
      title,
      body,
      category: note.category,
      authorId: getAuthorProfile(note).id,
      links,
      openLinkDialog: true,
      onLive: applyFullEditPayload,
      onSave: applyFullEditPayload
    });
  };

  return (
    <NoteCard
      note={note}
      scale={scale}
      cardWidth={cardWidth}
      legSide={legSide}
      legPosition={legPosition}
      legLength={legLength}
      title={title}
      body={body}
      links={links}
      hideTitle={hideTitle}
      singleTextMode={singleTextMode}
      onCategoryClick={handleCategorySelect}
      onAuthorClick={handleAuthorSelect}
      onEditClick={handleFullEdit}
      onLinksClick={handleLinksSelect}
      onTitleChange={handleTitleChange}
      onBodyChange={handleBodyChange}
    />
  );
}

widget.register(ConsistencyNoteWidget);
