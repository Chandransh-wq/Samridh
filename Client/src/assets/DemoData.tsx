import { faker } from "@faker-js/faker";
import { GiAtom, GiBrain, GiBookshelf } from "react-icons/gi";

export interface Page {
  _id?: string;
  page: string;
  pageContent: string;
  createdAt?: string;
  updatedAt?: string;
  tags: string[];
}

export interface folder {
  _id?: string;
  title: string;
  description: string;
  color: string;
  favorite: boolean;
  tags: string[];
  icon: React.ReactNode;
  pages: Page[];
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  name: string;
  des: string;
}

// Predefined icons array
const ICONS = [<GiAtom />, <GiBrain />, <GiBookshelf />];

// Predefined tags array
export const TAGS = [
  "Computer",
  "Math",
  "Chemistry",
  "Biology",
  "Finance",
  "Art",
  "AI",
  "Psychology",
  "Sociology",
  "Communication",
  "Environment", // correct spelling
  "Physics",
  "Astronomy",
  "Language",
  "Programming",
  "Design",
];

const generatePage = (): Page => ({
  _id: faker.string.uuid(),
  page: `Page ${faker.number.int({ min: 1, max: 10 })}`,
  pageContent: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 12 })),
  createdAt: faker.date
    .between({ from: "2025-01-01", to: "2025-10-01" })
    .toISOString(),
  updatedAt: faker.date
    .between({ from: "2025-01-01", to: "2025-10-10" })
    .toISOString(),
  tags: faker.helpers.arrayElements(TAGS, faker.number.int({ min: 1, max: 4 })),
});

const generatefolder = (): folder => ({
  _id: faker.string.uuid(),
  title: faker.lorem.words(faker.number.int({ min: 2, max: 4 })),
  description: faker.lorem.sentences(faker.number.int({ min: 1, max: 4 })),
  color: faker.color.rgb(),
  favorite: faker.datatype.boolean(),
  tags: faker.helpers.arrayElements(TAGS, faker.number.int({ min: 2, max: 5 })),
  icon: ICONS[faker.number.int({ min: 0, max: ICONS.length - 1 })],
  pages: Array.from(
    { length: faker.number.int({ min: 2, max: 5 }) },
    generatePage,
  ),
});

const generateUser = (): User => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  username: faker.internet.username(),
  email: faker.internet.email(),
  avatar: Math.random() < 0.7 ? faker.image.avatar() : undefined, // 70% chance to have avatar
  createdAt: faker.date
    .between({ from: "2023-01-01", to: "2025-01-01" })
    .toISOString(),
});

const generateNotification = (): Notification => ({
  id: faker.string.uuid(),
  name: faker.word.words(),
  des: faker.lorem.sentence(),
});

const randomLength = Math.floor(Math.random() * 10) + 1;

// Generate demo data
export const folderData: folder[] = Array.from(
  { length: randomLength },
  generatefolder,
);

export const notifications: Notification[] = Array.from(
  { length: faker.number.int({ min: 3, max: 8 }) },
  generateNotification,
);

export const userInfo: User = generateUser();
