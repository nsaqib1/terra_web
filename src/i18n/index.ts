import en from "./dictionaries/en";
import bn from "./dictionaries/bn";

export type Language = "EN" | "BN";
export type TranslationKey =
  | "common.home"
  | "common.communities"
  | "common.tools"
  | "common.games"
  | "common.notifications"
  | "common.profile"
  | "common.settings"
  | "common.search"
  | "common.login"
  | "common.signup"
  | "common.logout"
  | "common.createPost"
  | "common.language"
  | "common.managePosts"
  | "common.adminConsole"
  | "common.points"
  | "common.openNavigation"
  | "common.exploreCommunities"
  | "common.myCommunities"
  | "common.proposeCommunity"
  | "common.signIn"
  | "common.toSeeJoined"
  | "common.couldNotLoad"
  | "common.notJoinedYet"
  | "common.explore"
  | "common.navigationMenu"
  | "common.closeNavigation"
  | "common.latestActivity"
  | "common.justNow"
  | "common.unreadNotifications"
  | "pages.proposeCommunity"
  | "pages.myPosts"
  | "pages.editPost"
  | "pages.admin"
  | "pages.community";

const dictionaries = { EN: en, BN: bn };

export function translate(language: Language, key: TranslationKey): string {
  const [group, item] = key.split(".") as ["common" | "pages", string];
  const dictionary = dictionaries[language] as unknown as Record<string, Record<string, string>>;
  const english = dictionaries.EN as unknown as Record<string, Record<string, string>>;
  return dictionary[group]?.[item] ?? english[group]?.[item] ?? key;
}
