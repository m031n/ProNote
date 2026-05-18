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

const SCALE_STEPS = [0.6, 0.72, 0.84, 0.96, 1.08, 1.2, 1.36, 1.52, 1.68];
const NOTE_FONT_FAMILY = "IRANSansXVF";
const TITLE_FONT_WEIGHT = 700;
const BODY_FONT_WEIGHT = 500;
const TITLE_FONT = { family: NOTE_FONT_FAMILY, style: "Bold" };
const BODY_FONT = { family: NOTE_FONT_FAMILY, style: "Medium" };
const META_BOLD_FONT = { family: NOTE_FONT_FAMILY, style: "Bold" };
const META_MEDIUM_FONT = { family: NOTE_FONT_FAMILY, style: "Medium" };
const PLACEHOLDER_FILL = {
  type: "solid",
  color: { r: 160 / 255, g: 166 / 255, b: 178 / 255, a: 1 },
  opacity: 1
} as const;

const CATEGORIES: Array<{
  key: CategoryKey;
  label: string;
  color: string;
}> = [
  { key: "technical", label: "فنی", color: "#329546" },
  { key: "design", label: "دیزاین", color: "#2B52D4" },
  { key: "business", label: "بیزینس", color: "#D42525" },
  { key: "design_changes", label: "تغییرات دیزاینی", color: "#9218B3" },
  { key: "feedback", label: "فیدبک", color: "#E0A011" }
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
  small: 104,
  medium: 208,
  long: 416
};

const CARD_WIDTH_OPTIONS = [
  { option: "small", label: "Small" },
  { option: "medium", label: "Medium" },
  { option: "large", label: "Large" }
];

const CARD_WIDTHS: Record<CardWidth, number> = {
  small: 300,
  medium: 500,
  large: 700
};

const MENU_ICONS = {
  simpleAdvanced:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22V16M9 19L12 22L15 19M12 8V2M9 5L12 2L15 5M4 12H2M10 12H8M16 12H14M22 12H20" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  addLink:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 17H7C5.67392 17 4.40215 16.4732 3.46447 15.5355C2.52678 14.5979 2 13.3261 2 12C2 10.6739 2.52678 9.40215 3.46447 8.46447C4.40215 7.52678 5.67392 7 7 7H9M15 7H17C18.3261 7 19.5979 7.52678 20.5355 8.46447C21.4732 9.40215 22 10.6739 22 12C22 13.3261 21.4732 14.5979 20.5355 15.5355C19.5979 16.4732 18.3261 17 17 17H15M8 12H16" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  hideHeader:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 20.662V19C7 18.4696 7.21071 17.9609 7.58579 17.5858C7.96086 17.2107 8.46957 17 9 17H15C15.5304 17 16.0391 17.2107 16.4142 17.5858C16.7893 17.9609 17 18.4696 17 19V20.662M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10Z" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  hideTitle:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 16L17.536 8.672C17.6053 8.47151 17.7354 8.29762 17.9082 8.17454C18.081 8.05147 18.2879 7.98532 18.5 7.98532C18.7121 7.98532 18.919 8.05147 19.0918 8.17454C19.2646 8.29762 19.3947 8.47151 19.464 8.672L22 16M15.697 14H21.303M2 16L6.039 6.31C6.07698 6.2189 6.14107 6.14109 6.22319 6.08635C6.30532 6.03161 6.4018 6.0024 6.5005 6.0024C6.5992 6.0024 6.69568 6.03161 6.77781 6.08635C6.85993 6.14109 6.92402 6.2189 6.962 6.31L11 16M3.304 13H9.696" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  scaleDown:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21L16.65 16.65M8 11H14M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  scaleUp:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21L16.65 16.65M11 8V14M8 11H14M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  newNote:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#FFFFFF" stroke-width="2"/><path d="M12 8V16M8 12H16" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/></svg>'
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
  { id: "zahra", name: "Zahra", initials: "ZA", avatarFill: "#FCE7F3", avatarText: "#831843", avatarSrc: zahraAvatar },
  { id: "mahdi", name: "Mahdi", initials: "MA", avatarFill: "#DBEAFE", avatarText: "#1E3A8A", avatarSrc: mahdiAvatar },
  { id: "bahar", name: "Bahar", initials: "BA", avatarFill: "#DCFCE7", avatarText: "#14532D", avatarSrc: baharAvatar },
  { id: "lida", name: "Lida", initials: "LI", avatarFill: "#FEF3C7", avatarText: "#78350F", avatarSrc: lidaAvatar },
  { id: "moein", name: "Moein", initials: "MO", avatarFill: "#E0E7FF", avatarText: "#312E81", avatarSrc: moeinAvatar },
  { id: "sajad", name: "Sajad", initials: "SA", avatarFill: "#FEE2E2", avatarText: "#7F1D1D", avatarSrc: sajadAvatar },
  { id: "hasan", name: "Hasan", initials: "HA", avatarFill: "#CCFBF1", avatarText: "#134E4A", avatarSrc: hasanAvatar }
];

function scaleValue(value: number, scale: number) {
  return Math.round(value * scale);
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

type CurrentUserSnapshot = { id: string; name: string };

function snapshotCurrentUser(): CurrentUserSnapshot | null {
  const current = figma.currentUser;
  if (!current?.name) return null;
  return { id: current.id || "", name: current.name };
}

function withDefaultAuthor(note: NoteData, user: CurrentUserSnapshot | null): NoteData {
  if (note.authorName) return normalizeAuthor(note);

  const profile = findAuthorProfileByName(user?.name || "") || AUTHOR_PROFILES[0];
  return {
    ...note,
    authorId: profile.id,
    authorName: profile.name,
    updatedAt: note.updatedAt || new Date().toISOString()
  };
}

function displayAuthorName(note: NoteData, user: CurrentUserSnapshot | null) {
  return note.authorName || user?.name || "";
}

function findAuthorProfileById(id: string) {
  return AUTHOR_PROFILES.find((author) => author.id === id);
}

function findAuthorProfileByName(name: string) {
  return AUTHOR_PROFILES.find((author) => author.name.toLowerCase() === name.trim().toLowerCase());
}

function getAuthorProfile(note: NoteData, user: CurrentUserSnapshot | null) {
  return findAuthorProfileById(note.authorId) || findAuthorProfileByName(displayAuthorName(note, user)) || AUTHOR_PROFILES[0];
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

function openManageLinksModal(links: LinkData[], onSave: (links: LinkData[]) => void) {
  waitForTask(
    new Promise<void>((resolve) => {
      figma.showUI(__html__, { width: 520, height: 220, title: "مدیریت لینک‌ها" });
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
      figma.showUI(__html__, { width: 320, height: 260, title: "انتخاب نوع" });
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
      figma.showUI(__html__, { width: 320, height: 320, title: "انتخاب نویسنده" });
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
  onSave
}: {
  title: string;
  body: string;
  category: CategoryKey;
  authorId: string;
  links: LinkData[];
  onSave: (payload: { title: string; body: string; category: CategoryKey; authorId: string; links: LinkData[] }) => void;
}) {
  waitForTask(
    new Promise<void>((resolve) => {
      figma.showUI(__html__, { width: 560, height: 720, title: "ویرایش یادداشت" });
      figma.ui.postMessage({
        mode: "fullEdit",
        title,
        body,
        category,
        authorId,
        links,
        categories: CATEGORIES,
        authors: AUTHOR_PROFILES.map(({ id, name }) => ({ id, name }))
      });

      figma.ui.onmessage = (message: {
        type: string;
        payload?: { title: string; body: string; category: CategoryKey; authorId: string; links: LinkData[] } | ResizePayload;
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

        if (message.type !== "saveNote" || !message.payload) return;

        const payload = message.payload as { title: string; body: string; category: CategoryKey; authorId: string; links: LinkData[] };
        onSave({
          title: payload.title,
          body: payload.body,
          category: normalizeCategory(payload.category),
          authorId: payload.authorId,
          links: normalizeLinks(payload.links)
        });
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
  const dot = scaleValue(10, scale);

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
      src={`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 12 12" fill="none"><path d="M0.916711 1.7634C0.916711 1.34123 1.25847 0.99947 1.68064 0.99947H5.50027C5.75341 0.99947 5.95862 0.794257 5.95862 0.541114C5.95862 0.287971 5.75341 0.0827586 5.50026 0.0827586H1.68064C0.752184 0.0827586 0 0.834942 0 1.7634V10.3194C0 11.2478 0.752184 12 1.68064 12H10.2366C11.1651 12 11.9172 11.2478 11.9172 10.3194V6.49974C11.9172 6.24659 11.712 6.04138 11.4589 6.04138C11.2057 6.04138 11.0005 6.24659 11.0005 6.49974V10.3194C11.0005 10.7415 10.6588 11.0833 10.2366 11.0833H1.68064C1.25847 11.0833 0.916711 10.7415 0.916711 10.3194V1.7634Z" fill="${color}"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.4741 0.346881C10.0549 -0.11558 9.27055 -0.115627 8.85127 0.34674L4.21146 4.9312L4.20847 4.93492C4.02948 5.15806 3.88965 5.43281 3.88965 5.75764V7.68495C3.88965 7.95164 4.10563 8.11034 4.31597 8.11034H6.2485C6.57516 8.11034 6.85285 7.96999 7.07983 7.74367L11.6782 3.20056L11.6812 3.19683C11.8602 2.9737 12 2.69895 12 2.37412C12 2.05652 11.9081 1.777 11.6751 1.5446L10.4741 0.346881ZM8.15137 2.17795L4.80386 5.51643C4.76581 5.55438 4.74058 5.58904 4.72439 5.62536C4.70837 5.66132 4.69935 5.70308 4.69935 5.75764V7.30239H6.2485C6.30329 7.30239 6.34525 7.29338 6.38138 7.27737C6.41785 7.2612 6.45262 7.23601 6.49067 7.19806L9.83236 3.86538L8.15137 2.17795ZM10.3958 3.3035L11.1287 2.5725C11.1668 2.53455 11.192 2.49989 11.2082 2.46357C11.2242 2.42762 11.2333 2.38585 11.2333 2.33129C11.2333 2.27674 11.2242 2.23497 11.2082 2.19902C11.192 2.1627 11.1668 2.12804 11.1287 2.09009L9.92628 0.890869C9.7868 0.751766 9.5814 0.751766 9.44193 0.890869L8.71477 1.61607L10.3958 3.3035Z" fill="${color}"/></svg>`}
    />
  );
}

function LinkIcon({ color, size }: { color: string; size: number }) {
  return (
    <SVG
      width={size}
      height={size}
      src={`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 18 18" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.93962 1.38259C11.7841 -0.460786 14.7736 -0.46099 16.6174 1.38273C18.4607 3.22719 18.4611 6.21689 16.6174 8.06061L14.4784 10.1996C14.2099 10.4681 13.7745 10.4681 13.5059 10.1996C13.2374 9.93104 13.2374 9.49566 13.5059 9.22713L15.6449 7.08817C16.9514 5.78166 16.9516 3.66265 15.6448 2.35504C14.3383 1.04872 12.2195 1.04852 10.9119 2.35518L8.77296 4.49414C8.50442 4.76268 8.06905 4.76268 7.80051 4.49414C7.53198 4.22561 7.53198 3.79023 7.80051 3.5217L9.93962 1.38259Z" fill="${color}"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12.3376 5.6625C12.6061 5.93103 12.6061 6.36641 12.3376 6.63495L6.63489 12.3376C6.36635 12.6062 5.93098 12.6062 5.66244 12.3376C5.39391 12.0691 5.39391 11.6337 5.66244 11.3652L11.3651 5.6625C11.6337 5.39397 12.069 5.39397 12.3376 5.6625Z" fill="${color}"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4.49407 7.80057C4.76261 8.0691 4.76261 8.50448 4.49407 8.77301L2.35511 10.912C1.04861 12.2185 1.0484 14.3375 2.35525 15.6451C3.66172 16.9514 5.78052 16.9516 7.0881 15.645L9.22706 13.506C9.49559 13.2375 9.93097 13.2375 10.1995 13.506C10.468 13.7745 10.468 14.2099 10.1995 14.4784L8.06054 16.6174C6.21609 18.4608 3.22639 18.4611 1.38266 16.6174C-0.460716 14.773 -0.461061 11.7833 1.38266 9.93953L3.52163 7.80057C3.79016 7.53204 4.22554 7.53204 4.49407 7.80057Z" fill="${color}"/></svg>`}
    />
  );
}

function LinkButton({ link, scale }: { link: LinkData; scale: number }) {
  const iconSize = scaleValue(12, scale);
  const fontSize = scaleValue(12, scale);

  return (
    <AutoLayout
      direction="horizontal"
      spacing={4}
      verticalAlignItems="center"
      padding={{
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }}
      cornerRadius={0}
      horizontalAlignItems="end"
      onClick={() => figma.openExternal(link.url)}
    >
      <Text
        href={link.url}
        font={BODY_FONT}
        fontFamily={NOTE_FONT_FAMILY}
        fontSize={fontSize}
        fontWeight={BODY_FONT_WEIGHT}
        fill="#149B57"
        horizontalAlignText="right"
      >
        {link.title}
      </Text>
      <LinkIcon color="#149B57" size={iconSize} />
    </AutoLayout>
  );
}

function NoteCard({
  note,
  currentUser,
  scale,
  cardWidth,
  legSide,
  legPosition,
  legLength,
  title,
  body,
  links,
  hideHeader,
  hideTitle,
  singleTextMode,
  onCategoryClick,
  onAuthorClick,
  onEditClick,
  onTitleChange,
  onBodyChange
}: {
  note: NoteData;
  currentUser: CurrentUserSnapshot | null;
  scale: number;
  cardWidth: CardWidth;
  legSide: LegSide;
  legPosition: LegPosition;
  legLength: LegLength;
  title: string;
  body: string;
  links: LinkData[];
  hideHeader: boolean;
  hideTitle: boolean;
  singleTextMode: boolean;
  onCategoryClick: () => void;
  onAuthorClick: () => void;
  onEditClick: () => void;
  onTitleChange: (title: string) => void;
  onBodyChange: (body: string) => void;
}) {
  const author = getAuthorProfile(note, currentUser);
  const authorLabel = author.name || "Select author";
  const category = getCategory(note.category);
  const width = scaleValue(CARD_WIDTHS[cardWidth], scale);
  const padding = scaleValue(16, scale);
  const colorPadding = scaleValue(8, scale);
  const titleSize = scaleValue(18, scale);
  const bodySize = scaleValue(14, scale);
  const metaSize = scaleValue(10, scale);
  const tagSize = scaleValue(8, scale);
  const stroke = singleTextMode ? "#000000" : category.color;
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

  const cardContent = (
    <AutoLayout
      direction="vertical"
      width="fill-parent"
      padding={padding}
      spacing={scaleValue(12, scale)}
      cornerRadius={scaleValue(16, scale)}
      fill="#FFFFFF"
      effect={{
        type: "drop-shadow",
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        offset: { x: 0, y: scaleValue(4, scale) },
        blur: scaleValue(15, scale)
      }}
      horizontalAlignItems="end"
    >
      {!singleTextMode && !hideHeader && (
        <AutoLayout
          direction="horizontal"
          width="fill-parent"
          verticalAlignItems="center"
          spacing={scaleValue(8, scale)}
        >
          <AutoLayout
            width={16}
            height={16}
            cornerRadius={4}
            horizontalAlignItems="center"
            verticalAlignItems="center"
            hoverStyle={{ fill: "#F3F4F6" }}
            onClick={onEditClick}
          >
            <EditIcon color="#55606B" size={12} />
          </AutoLayout>
          <Frame width="fill-parent" height={1} opacity={0} />
          <AutoLayout direction="horizontal" verticalAlignItems="center" spacing={scaleValue(6, scale)}>
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
                fontWeight={BODY_FONT_WEIGHT}
                fill="#4B5563"
              >
                {authorLabel}
              </Text>
              <AutoLayout
                width={scaleValue(16, scale)}
                height={scaleValue(16, scale)}
                cornerRadius={scaleValue(8, scale)}
                fill={author.avatarFill}
                horizontalAlignItems="center"
                verticalAlignItems="center"
              >
                {author.avatarSrc ? (
                  <Image
                    src={author.avatarSrc}
                    width={scaleValue(16, scale)}
                    height={scaleValue(16, scale)}
                    cornerRadius={scaleValue(8, scale)}
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
            </AutoLayout>
            <Frame width={scaleValue(4, scale)} height={scaleValue(4, scale)} cornerRadius={scaleValue(2, scale)} fill="#D1D5DB" />
            <Text
              font={META_MEDIUM_FONT}
              fontFamily={NOTE_FONT_FAMILY}
              fontSize={metaSize}
              fontWeight={BODY_FONT_WEIGHT}
              fill="#4B5563"
              horizontalAlignText="right"
            >
              {formatUpdatedAt(note.updatedAt)}
            </Text>
            <Frame width={scaleValue(4, scale)} height={scaleValue(4, scale)} cornerRadius={scaleValue(2, scale)} fill="#D1D5DB" />
            <AutoLayout
              padding={{
                top: scaleValue(3, scale),
                right: scaleValue(8, scale),
                bottom: scaleValue(3, scale),
                left: scaleValue(8, scale)
              }}
              cornerRadius={scaleValue(999, scale)}
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
              >
                {category.label}
              </Text>
            </AutoLayout>
          </AutoLayout>
        </AutoLayout>
      )}

      {!singleTextMode && !hideHeader && <Frame width="fill-parent" height={1} fill="#E5E7EB" />}

      <AutoLayout direction="vertical" width="fill-parent" spacing={scaleValue(8, scale)} horizontalAlignItems="end">
        {!singleTextMode && !hideTitle && (
          <Input
            value={title}
            placeholder="عنوان یادداشت"
            font={TITLE_FONT}
            fontFamily={NOTE_FONT_FAMILY}
            fontSize={titleSize}
            fontWeight={TITLE_FONT_WEIGHT}
            fill={title ? "#24292F" : PLACEHOLDER_FILL}
            width="fill-parent"
            horizontalAlignText="right"
            inputBehavior="wrap"
            placeholderProps={{
              font: TITLE_FONT,
              fill: PLACEHOLDER_FILL,
              fontFamily: NOTE_FONT_FAMILY,
              fontSize: titleSize,
              fontWeight: TITLE_FONT_WEIGHT
            } as unknown as { fill: typeof PLACEHOLDER_FILL }}
            onTextEditEnd={(event) => onTitleChange(event.characters)}
          />
        )}

        <Input
          value={body}
          placeholder="متن یادداشت"
          font={BODY_FONT}
          fontFamily={NOTE_FONT_FAMILY}
          fontSize={bodySize}
          fontWeight={BODY_FONT_WEIGHT}
          lineHeight={scaleValue(21, scale)}
          fill={body ? "#4B5563" : PLACEHOLDER_FILL}
          width="fill-parent"
          horizontalAlignText="right"
          inputBehavior="multiline"
          placeholderProps={{
            font: BODY_FONT,
            fill: PLACEHOLDER_FILL,
            fontFamily: NOTE_FONT_FAMILY,
            fontSize: bodySize,
            fontWeight: BODY_FONT_WEIGHT
          } as unknown as { fill: typeof PLACEHOLDER_FILL }}
          onTextEditEnd={(event) => onBodyChange(event.characters)}
        />
      </AutoLayout>

      {!singleTextMode && links.length > 0 && (
        <AutoLayout direction="vertical" width="fill-parent" spacing={scaleValue(12, scale)} horizontalAlignItems="end">
          <Frame width="fill-parent" height={1} fill="#E5E7EB" />
          <AutoLayout
            direction="horizontal"
            width="fill-parent"
            spacing={scaleValue(16, scale)}
            horizontalAlignItems="end"
            verticalAlignItems="center"
          >
            {links.map((link) => (
              <LinkButton key={link.id} link={link} scale={scale} />
            ))}
          </AutoLayout>
        </AutoLayout>
      )}

    </AutoLayout>
  );

  const card = (
    <AutoLayout
      width={width}
      padding={colorPadding}
      cornerRadius={scaleValue(24, scale)}
      stroke={stroke}
      strokeWidth={scaleValue(2, scale)}
      strokeDashPattern={singleTextMode ? [] : [scaleValue(6, scale), scaleValue(6, scale)]}
    >
      {cardContent}
    </AutoLayout>
  );

  if (legSide === "left") {
    return (
      <AutoLayout direction="horizontal" spacing={scaleValue(8, scale)} verticalAlignItems={legPositionToVerticalAlign(legPosition)}>
        <AutoLayout direction="vertical" padding={sideLegPadding}>
          <ConnectorLeg side="left" length={legLength} scale={scale} stroke={stroke} />
        </AutoLayout>
        {card}
      </AutoLayout>
    );
  }

  if (legSide === "right") {
    return (
      <AutoLayout direction="horizontal" spacing={scaleValue(8, scale)} verticalAlignItems={legPositionToVerticalAlign(legPosition)}>
        {card}
        <AutoLayout direction="vertical" padding={sideLegPadding}>
          <ConnectorLeg side="right" length={legLength} scale={scale} stroke={stroke} />
        </AutoLayout>
      </AutoLayout>
    );
  }

  if (legSide === "top") {
    return (
      <AutoLayout direction="vertical" spacing={scaleValue(8, scale)} horizontalAlignItems={legPositionToHorizontalAlign(legPosition)}>
        <AutoLayout direction="horizontal" padding={verticalLegPadding}>
          <ConnectorLeg side="top" length={legLength} scale={scale} stroke={stroke} />
        </AutoLayout>
        {card}
      </AutoLayout>
    );
  }

  if (legSide === "bottom") {
    return (
      <AutoLayout direction="vertical" spacing={scaleValue(8, scale)} horizontalAlignItems={legPositionToHorizontalAlign(legPosition)}>
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
  const [currentUser] = useSyncedState<CurrentUserSnapshot | null>("currentUser", () => snapshotCurrentUser());
  const [scaleIndex, setScaleIndex] = useSyncedState("scaleIndex", 4);
  const [cardWidth, setCardWidth] = useSyncedState<CardWidth>("cardWidth", "small");
  const [legSide, setLegSide] = useSyncedState<LegSide>("legSide", "left");
  const [legPosition, setLegPosition] = useSyncedState<LegPosition>("legPosition", "middle");
  const [legLength, setLegLength] = useSyncedState<LegLength>("legLength", "small");
  const [hideHeader, setHideHeader] = useSyncedState("hideHeader", false);
  const [hideTitle, setHideTitle] = useSyncedState("hideTitle", false);
  const [singleTextMode, setSingleTextMode] = useSyncedState("singleTextMode", false);

  const scale = SCALE_STEPS[Math.min(Math.max(scaleIndex, 0), SCALE_STEPS.length - 1)];

  useEffect(() => {
    if (!note.authorName) {
      setNote(withDefaultAuthor(note, currentUser));
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
      {
        itemType: "dropdown",
        propertyName: "cardWidth",
        tooltip: "Width",
        selectedOption: cardWidth,
        options: CARD_WIDTH_OPTIONS
      },
      { itemType: "separator" },
      ...(singleTextMode
        ? []
        : ([
            {
              itemType: "toggle",
              propertyName: "hideHeader",
              tooltip: "Hide header",
              isToggled: !hideHeader,
              icon: MENU_ICONS.hideHeader
            },
            {
              itemType: "toggle",
              propertyName: "hideTitle",
              tooltip: "Hide title",
              isToggled: !hideTitle,
              icon: MENU_ICONS.hideTitle
            },
            { itemType: "separator" },
            { itemType: "action", propertyName: "addLink", tooltip: "Add link", icon: MENU_ICONS.addLink },
            { itemType: "separator" }
          ] as const)),
      {
        itemType: "dropdown",
        propertyName: "legSide",
        tooltip: "Direction",
        selectedOption: legSide,
        options: LEG_SIDE_OPTIONS
      },
      ...(legSide === "none"
        ? []
        : ([
            {
              itemType: "dropdown",
              propertyName: "legPosition",
              tooltip: "Position",
              selectedOption: legPosition,
              options: getLegPositionOptions(legSide)
            },
            {
              itemType: "dropdown",
              propertyName: "legLength",
              tooltip: "Length",
              selectedOption: legLength,
              options: LEG_LENGTH_OPTIONS
            }
          ] as const)),
      { itemType: "separator" },
      { itemType: "action", propertyName: "scaleDown", tooltip: "Smaller", icon: MENU_ICONS.scaleDown },
      { itemType: "action", propertyName: "scaleUp", tooltip: "Larger", icon: MENU_ICONS.scaleUp },
      { itemType: "separator" },
      { itemType: "action", propertyName: "newNote", tooltip: "Add new note", icon: MENU_ICONS.newNote }
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "addLink") {
        openManageLinksModal(links, (nextLinks) => {
          setLinks(nextLinks);
          setNote({
            ...note,
            fontFamily: NOTE_FONT_FAMILY,
            updatedAt: new Date().toISOString()
          });
        });
        return;
      }

      if (propertyName === "advancedMode") {
        setSingleTextMode(!singleTextMode);
        return;
      }

      if (propertyName === "cardWidth" && propertyValue) {
        setCardWidth(propertyValue as CardWidth);
        return;
      }

      if (propertyName === "hideHeader") {
        setHideHeader(!hideHeader);
        return;
      }

      if (propertyName === "hideTitle") {
        setHideTitle(!hideTitle);
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

      if (propertyName === "newNote") {
        waitForTask(
          (async () => {
            const widgetNode = await figma.getNodeByIdAsync(widgetId);
            if (!widgetNode || widgetNode.type !== "WIDGET") return;

            const profile = getAuthorProfile(note, currentUser);
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
              currentUser,
              scaleIndex,
              cardWidth,
              legSide,
              legPosition,
              legLength,
              hideHeader: false,
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
    openAuthorModal(getAuthorProfile(note, currentUser).id, (authorId) => {
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

  const handleFullEdit = () => {
    openFullEditModal({
      title,
      body,
      category: note.category,
      authorId: getAuthorProfile(note, currentUser).id,
      links,
      onSave: (payload) => {
        const author = findAuthorProfileById(payload.authorId) || getAuthorProfile(note, currentUser);
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
      }
    });
  };

  return (
    <NoteCard
      note={note}
      currentUser={currentUser}
      scale={scale}
      cardWidth={cardWidth}
      legSide={legSide}
      legPosition={legPosition}
      legLength={legLength}
      title={title}
      body={body}
      links={links}
      hideHeader={hideHeader}
      hideTitle={hideTitle}
      singleTextMode={singleTextMode}
      onCategoryClick={handleCategorySelect}
      onAuthorClick={handleAuthorSelect}
      onEditClick={handleFullEdit}
      onTitleChange={handleTitleChange}
      onBodyChange={handleBodyChange}
    />
  );
}

widget.register(ConsistencyNoteWidget);
