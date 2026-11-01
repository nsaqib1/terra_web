# Terramids Bilingual Localization — Phase 5

## Scope
Frontend-only localization for community discovery, community proposals, and the community detail experience.

## Updated files
- `src/i18n/index.ts`
- `src/i18n/dictionaries/en.ts`
- `src/i18n/dictionaries/bn.ts`
- `src/app/communities/page.tsx`
- `src/app/communities/propose/page.tsx`
- `src/app/community/[slug]/page.tsx`
- `src/components/community/CommunityTags.tsx`
- `src/components/community/CommunityDiscussionCard.tsx`
- `src/components/communities/CommunityProposalCard.tsx`

## Behavior
- Community directory labels, empty states, errors and actions are localized.
- Community proposal form, validation hints, character counters, submission and success states are localized.
- Community membership actions, tag filters, resource labels, empty states and leave confirmation are localized.
- Community member-since dates use full Bangla month names and Bangla locale formatting when Bangla is selected.
- User-generated community names, descriptions, tags and post content remain unchanged.
- No backend files or API contracts were changed.

## Validation
- 144 TypeScript/TSX files passed TypeScript transpile syntax parsing.
- English and Bangla common dictionaries each contain 275 keys with matching key sets.
- 84 statically referenced translation keys in the modified screens/components were checked; none are missing from the type union or dictionaries.
- ZIP integrity check passed.
- Full Next.js build and ESLint were not run because project dependencies are not installed in this working environment.

## Governance note
The existing community page exposes a Governance tab/summary copy, but this frontend snapshot does not contain a dedicated member-facing governance workflow route for proposals or voting. This phase localizes the existing governance-related community labels and explanatory copy; it does not invent or implement a new governance feature.
