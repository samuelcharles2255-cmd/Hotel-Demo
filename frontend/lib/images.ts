/**
 * Central image registry.
 * Every page pulls from here — swap these URLs for your own photography
 * and the whole site updates. (Currently placeholder Unsplash assets.)
 */
const u = (id: string, w = 2000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

export const images = {
  /* Home — hero: soft light across brutalist concrete */
  homeHero: u("1487958449943-2429e8be8625", 2600),

  /* Home — collection cards */
  cardRooms: u("1611892440504-42a792e24d32", 1600),
  cardExperience: u("1582719478250-c89cae4dc85b", 1600),
  cardArt: u("1540518614846-7eded433c457", 1600),

  /* Home — dining + statement */
  dining: u("1414235077428-338989a2e8c0", 1800),
  concreteTexture: u("1517816743773-6e0fd518b4a6", 2000),

  /* Room detail — North Light Suite */
  suiteHero: u("1616594039964-ae9021a400a0", 2600),
  suiteGallery: [
    u("1600607687939-ce8a6c25118c", 1400),
    u("1618221195710-dd6b41faaea6", 1400),
    u("1600210492486-724fe5c67fb0", 1400),
    u("1600566753086-00f18fb6b3ea", 1400),
  ],
  suiteDetail: u("1631049307264-da0ec9d70304", 2000),

  /* Booking — split layout */
  bookingExterior: u("1542314831-068cd1dbfeeb", 2200),
  bookingRooms: [
    u("1566073771259-6a8506099945", 600),
    u("1618773928121-c32242e63f39", 600),
    u("1505693416388-ac5ce068fe85", 600),
  ],

  /* Confirmation */
  confirmRoom: u("1590490360182-c33d57733427", 1800),

  /* Authentication — suite in morning light behind the glass panel */
  authPanel: u("1522708323590-d24dbb6b0267", 1600),
} as const;
