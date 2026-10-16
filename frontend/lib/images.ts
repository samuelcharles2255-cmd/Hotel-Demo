/**
 * Central image registry for Aether Luxury Hotel (Mbeya, Tanzania).
 * Restructured with real photography from the hotel's executive suites,
 * twin guest rooms, living salons, dining halls, and property amenities.
 */
export const images = {
  /* Home — hero: opulent executive king suite with warm mahogany and ambient lighting */
  homeHero: "/hotel_images/1_Executive_King_Bedrooms/578624935.jpg",

  /* Home — collection cards */
  cardRooms: "/hotel_images/1_Executive_King_Bedrooms/578624975.jpg",
  cardExperience: "/hotel_images/3_Executive_Living_Rooms_And_Suites/578625002.jpg",
  cardArt: "/hotel_images/1_Executive_King_Bedrooms/578625121.jpg",

  /* Home — dining & architectural atmosphere */
  dining: "/hotel_images/7_Restaurant_And_Dining_Area/578625029.jpg",
  concreteTexture: "/hotel_images/8_Corridors_Entrances_And_Decor/578625110.jpg",

  /* Room detail — Executive King Suite */
  suiteHero: "/hotel_images/1_Executive_King_Bedrooms/578624935.jpg",
  suiteGallery: [
    "/hotel_images/3_Executive_Living_Rooms_And_Suites/578625002.jpg", // 01 Living Salon
    "/hotel_images/6_Bathroom_Facilities/578625076.jpg",              // 02 Bath & Vanity
    "/hotel_images/4_In_Room_Workstations_And_TV_Consoles/578624973.jpg", // 03 Workstation & Console
    "/hotel_images/5_Kitchenettes/578625044.jpg",                     // 04 In-room Kitchenette
  ],
  suiteDetail: "/hotel_images/1_Executive_King_Bedrooms/578625123.jpg",

  /* Booking — split layout: building exterior in Mbeya */
  bookingExterior: "/hotel_images/8_Corridors_Entrances_And_Decor/578624996.jpg",
  bookingRooms: [
    "/hotel_images/2_Twin_Double_Guest_Rooms/580482452.jpg",          // Deluxe Twin Room
    "/hotel_images/1_Executive_King_Bedrooms/578624935.jpg",          // Executive King Suite
    "/hotel_images/3_Executive_Living_Rooms_And_Suites/578625002.jpg", // Grand Executive Living Suite
    "/hotel_images/7_Restaurant_And_Dining_Area/578625018(1).jpg",     // Conference & Meeting Hall
  ],

  /* Confirmation */
  confirmRoom: "/hotel_images/1_Executive_King_Bedrooms/578624975.jpg",

  /* Authentication */
  authPanel: "/hotel_images/8_Corridors_Entrances_And_Decor/578625110.jpg",

  /* Additional category galleries */
  categories: {
    executiveBedrooms: [
      "/hotel_images/1_Executive_King_Bedrooms/578624935.jpg",
      "/hotel_images/1_Executive_King_Bedrooms/578624975.jpg",
      "/hotel_images/1_Executive_King_Bedrooms/578624978.jpg",
      "/hotel_images/1_Executive_King_Bedrooms/578625015.jpg",
      "/hotel_images/1_Executive_King_Bedrooms/578625123.jpg",
    ],
    twinGuestRooms: [
      "/hotel_images/2_Twin_Double_Guest_Rooms/580482452.jpg",
      "/hotel_images/2_Twin_Double_Guest_Rooms/580482448.jpg",
      "/hotel_images/2_Twin_Double_Guest_Rooms/580482456.jpg",
      "/hotel_images/2_Twin_Double_Guest_Rooms/580482466.jpg",
    ],
    executiveLivingSuites: [
      "/hotel_images/3_Executive_Living_Rooms_And_Suites/578625002.jpg",
      "/hotel_images/3_Executive_Living_Rooms_And_Suites/578625039.jpg",
      "/hotel_images/3_Executive_Living_Rooms_And_Suites/578625132.jpg",
    ],
    workstations: [
      "/hotel_images/4_In_Room_Workstations_And_TV_Consoles/578624973.jpg",
      "/hotel_images/4_In_Room_Workstations_And_TV_Consoles/578624964.jpg",
      "/hotel_images/4_In_Room_Workstations_And_TV_Consoles/578625034.jpg",
    ],
    kitchenettes: [
      "/hotel_images/5_Kitchenettes/578625044.jpg",
      "/hotel_images/5_Kitchenettes/578624986.jpg",
      "/hotel_images/5_Kitchenettes/578625137.jpg",
    ],
    dining: [
      "/hotel_images/7_Restaurant_And_Dining_Area/578625018(1).jpg",
      "/hotel_images/7_Restaurant_And_Dining_Area/578625029.jpg",
      "/hotel_images/7_Restaurant_And_Dining_Area/578625063.jpg",
    ],
    entranceAndDecor: [
      "/hotel_images/8_Corridors_Entrances_And_Decor/578624996.jpg",
      "/hotel_images/8_Corridors_Entrances_And_Decor/578625110.jpg",
      "/hotel_images/8_Corridors_Entrances_And_Decor/578625129.jpg",
    ],
  },
} as const;
