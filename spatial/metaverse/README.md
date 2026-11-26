# 1AGE Metaverse Index — Build 001
Read-only adapter foundation for the Games Virtual Worlds Department. Intended for future reuse by 1AGE Search and Space. Not deployed or wired into the public UI yet.

Decentraland:
- Public documented destinations endpoint: https://places.decentraland.org/api/destinations
- Docs: https://docs.decentraland.org/apis/apis/places/places
- Map/parcel metadata: https://docs.decentraland.org/apis/apis/atlas-server/overview
- Named Worlds: https://docs.decentraland.org/apis/apis/worlds/overview
- Realm records: https://adr.decentraland.org/adr/ADR-144

Separate provider place ID, coordinate, world name, and ENS/DCL aliases. A parcel can belong to a larger scene; one title can match multiple independent venues. Never infer ENS ownership from a scene title. Resolve names through supported authoritative records, store source and checked date, and require verified ownership separately for claims. No contact data or visitor wallet tracking. Respect provider opt-outs and content moderation. The initial general-audience preview excludes adult, unknown-rated and gambling-related entries; keyword filters are not a substitute for moderation. No wagering, gambling integration or payments.

Future adapters: Upland developer network subject to access and terms (https://www.upland.me/learn/developer-network). Other worlds must have validated public APIs or owner-submitted links. Distinguish external launch from embedded experience; no implied partnership or shared assets. 

Next steps: execute node --test spatial/metaverse/decentraland.test.mjs; validate real response shape, CORS, pagination and usage terms; implement bounded server-side sync/cache with rate limits and stale-record/opt-out rechecks; resolve authoritative named-world aliases; expose search and in-world portals for eligible public entries. Live API could not be inspected in this session. Tests were authored, not executed. No actual destination counts or verified records are claimed.

## Build 002
The Virtual Worlds pavilion now mounts an on-demand provider search terminal with parcel/World selection, paginated deduplicated results, source dates, cancellation and timeout/error states. Supported coordinate-based desktop launch links are user-initiated. Named Worlds retain validated provider-reported ASCII .eth/.dcl.eth strings without claiming independent ENS resolution; official directory is the fallback. No persistent index yet.

Validation: eight Node fixture tests passed locally against exact Git blob hashes 09267952ac54467565ef00bc6f727ddef852ac3a (adapter) and 0684301323bb68785aab77fa883f7582ef047c74 (tests). These supersede the Build 001 test-status note. Live endpoint response and browser CORS remain unverified, as do the rendered terminal, mobile controls and desktop launch. Provider docs: https://docs.decentraland.org/apis/apis/places/places. Production unchanged.
