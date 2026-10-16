"""
Populates Aether Luxury Hotel in Mbeya with accurate room types,
physical rooms, real room images from uploaded assets, and realistic descriptions.
"""
import os
import shutil
import sys
from pathlib import Path
from decimal import Decimal

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "config"))
sys.path.insert(0, str(BASE_DIR / "contents"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from hotels.models import Hotel, RoomType, Room, RoomImage

def seed():
    # 1. Update Hotel Details
    hotel, _ = Hotel.objects.get_or_create(id=1)
    hotel.name = "Aether Luxury Hotel"
    hotel.slug = "aether-luxury-hotel"
    hotel.description = (
        "Specialty luxury lodging in Mbeya, Tanzania, situated on Hospital Hill Road. "
        "Ranked #10 of 12 Specialty lodging in Mbeya with 5.0 Rooms and 5.0 Value ratings. "
        "Features executive king bedrooms, spacious twin suites, dedicated workstations, "
        "private kitchenettes, meeting facilities, a restaurant & lounge, and airport transportation."
    )
    hotel.address = "Hospital Hill Rd, 4C5R+R3H"
    hotel.city = "Mbeya"
    hotel.country = "Tanzania"
    hotel.phone = "+255 618 130 940"
    hotel.email = "reservations@aether-mbeya.com"
    hotel.currency = "TSH"
    hotel.timezone = "Africa/Dar_es_Salaam"
    hotel.is_active = True
    hotel.save()
    print(f"Updated Hotel: {hotel.name} in {hotel.city}")

    # 2. Room Types configuration
    room_types_data = [
        {
            "name": "Executive King Suite",
            "description": (
                "Spacious executive suite featuring an opulent king-size bed with rich mahogany wood "
                "paneling, warm mood lighting, an ergonomic workstation with high-speed WiFi, smart TV, "
                "in-room kitchenette, modern bathroom with hot tub, and panoramic views of Mbeya's highlands."
            ),
            "base_price": Decimal("250000.00"),
            "max_adults": 2,
            "max_children": 1,
            "bed_configuration": "1 King Bed",
            "amenities": [
                "Free High Speed Internet (WiFi)",
                "Hot tub / Ensuite Bath",
                "In-Room Kitchenette",
                "Workstation & Smart TV",
                "Free parking",
                "Airport transportation",
                "Air conditioning",
                "Highland mountain views",
                "Breakfast included",
            ],
            "rooms": ["101", "102", "103", "104"],
            "primary_image": "1_Executive_King_Bedrooms/578624935.jpg",
            "gallery_images": [
                ("1_Executive_King_Bedrooms/578624975.jpg", "Executive King Suite Bed & Lounge"),
                ("4_In_Room_Workstations_And_TV_Consoles/578624973.jpg", "In-Room Workstation & Entertainment Console"),
                ("5_Kitchenettes/578625044.jpg", "Fully Equipped In-Room Kitchenette"),
                ("6_Bathroom_Facilities/578625076.jpg", "Modern Ensuite Bathroom & Vanity"),
                ("1_Executive_King_Bedrooms/578625123.jpg", "King Bed Atmosphere & Lighting"),
            ],
        },
        {
            "name": "Deluxe Twin Room",
            "description": (
                "Tastefully appointed room with two comfortable double beds, designer headboards, "
                "carpeted floors, dedicated work desk, satellite TV, and modern bathroom. "
                "Ideal for families, companions, and children traveling together."
            ),
            "base_price": Decimal("180000.00"),
            "max_adults": 2,
            "max_children": 2,
            "bed_configuration": "2 Double Beds",
            "amenities": [
                "Free High Speed Internet (WiFi)",
                "Children Activities (Kid / Family Friendly)",
                "Ensuite bathroom with hot shower",
                "Workstation & Smart TV",
                "Free parking",
                "Airport transportation",
                "Tea & coffee making facilities",
                "Breakfast included",
            ],
            "rooms": ["201", "202", "203", "204"],
            "primary_image": "2_Twin_Double_Guest_Rooms/580482452.jpg",
            "gallery_images": [
                ("2_Twin_Double_Guest_Rooms/580482448.jpg", "Twin Guest Room Twin Beds"),
                ("2_Twin_Double_Guest_Rooms/580482456.jpg", "Twin Bedroom Side View"),
                ("4_In_Room_Workstations_And_TV_Consoles/578624964.jpg", "Workstation & Satellite TV"),
                ("6_Bathroom_Facilities/578625076.jpg", "Ensuite Bath Facilities"),
            ],
        },
        {
            "name": "Grand Executive Living Suite",
            "description": (
                "The premier residence at Aether. Includes an expansive separate executive living room "
                "with premium leather sofa, fluted wood partitions, wingback chairs, entertainment console, "
                "master king bedroom, executive kitchenette with marble finishes, and deluxe bathroom."
            ),
            "base_price": Decimal("450000.00"),
            "max_adults": 3,
            "max_children": 2,
            "bed_configuration": "1 King Bed + Executive Living Salon",
            "amenities": [
                "Separate Executive Living Room",
                "Free High Speed Internet (WiFi)",
                "Hot tub & Luxury Bathroom",
                "Kitchenette with Modern Appliances",
                "Bar / lounge access",
                "Executive meeting & dining area",
                "Free parking",
                "Airport transportation",
                "Complimentary minibar & breakfast",
            ],
            "rooms": ["301", "302"],
            "primary_image": "3_Executive_Living_Rooms_And_Suites/578625002.jpg",
            "gallery_images": [
                ("3_Executive_Living_Rooms_And_Suites/578625039.jpg", "Living Salon & Seating Area"),
                ("1_Executive_King_Bedrooms/578625121.jpg", "Reception & Executive Suite Entry"),
                ("4_In_Room_Workstations_And_TV_Consoles/578625034.jpg", "Executive Desk & Lounge TV"),
                ("5_Kitchenettes/578624986.jpg", "Suite Kitchenette & Refreshment Station"),
            ],
        },
        {
            "name": "Conference & Meeting Hall",
            "description": (
                "Comprehensive corporate meeting and seminar venue equipped with audiovisual gear, "
                "flexible seating arrangements, high-speed WiFi, and catering from our on-site restaurant."
            ),
            "base_price": Decimal("300000.00"),
            "max_adults": 30,
            "max_children": 0,
            "bed_configuration": "Executive Meeting & Seminar Hall",
            "amenities": [
                "Meeting rooms",
                "Free High Speed Internet (WiFi)",
                "Presentation audio/visual tech",
                "Catering & Bar / lounge service",
                "Free parking",
                "Airport transportation for delegates",
            ],
            "rooms": ["CONF-A", "CONF-B"],
            "primary_image": "7_Restaurant_And_Dining_Area/578625018(1).jpg",
            "gallery_images": [
                ("7_Restaurant_And_Dining_Area/578625029.jpg", "Banquet & Meeting Table Setup"),
                ("8_Corridors_Entrances_And_Decor/578625110.jpg", "Lobby & Breakout Area"),
                ("8_Corridors_Entrances_And_Decor/578624996.jpg", "Hotel Exterior & Parking Grounds"),
            ],
        },
    ]

    media_dir = BASE_DIR / "media" / "room_images" / "2026" / "10"
    media_dir.mkdir(parents=True, exist_ok=True)
    source_base = BASE_DIR / "media" / "hotel_images"

    for rdata in room_types_data:
        # Find or create room type
        rt, created = RoomType.objects.get_or_create(
            hotel=hotel,
            name=rdata["name"],
            defaults={
                "description": rdata["description"],
                "base_price": rdata["base_price"],
                "max_adults": rdata["max_adults"],
                "max_children": rdata["max_children"],
                "bed_configuration": rdata["bed_configuration"],
                "amenities": rdata["amenities"],
                "is_active": True,
            }
        )
        if not created:
            rt.description = rdata["description"]
            rt.base_price = rdata["base_price"]
            rt.max_adults = rdata["max_adults"]
            rt.max_children = rdata["max_children"]
            rt.bed_configuration = rdata["bed_configuration"]
            rt.amenities = rdata["amenities"]
            rt.is_active = True
            rt.save()

        print(f"RoomType saved: {rt.name} (id={rt.id})")

        # Create physical rooms
        for room_no in rdata["rooms"]:
            Room.objects.get_or_create(
                hotel=hotel,
                number=room_no,
                defaults={"room_type": rt, "status": Room.Status.ACTIVE}
            )

        # Clear existing images for clean re-population
        rt.images.all().delete()

        # Primary Image
        prim_src = source_base / rdata["primary_image"]
        if prim_src.exists():
            dest_name = f"rt_{rt.id}_primary_{prim_src.name}"
            dest_path = media_dir / dest_name
            shutil.copy2(prim_src, dest_path)
            rel_path = f"room_images/2026/10/{dest_name}"
            RoomImage.objects.create(
                room_type=rt,
                image=rel_path,
                alt_text=f"{rt.name} - Primary View",
                is_primary=True,
                sort_order=0,
            )
            print(f"  Added primary image: {rel_path}")

        # Gallery Images
        for idx, (img_rel, alt_label) in enumerate(rdata["gallery_images"], start=1):
            g_src = source_base / img_rel
            if g_src.exists():
                dest_name = f"rt_{rt.id}_gal_{idx}_{g_src.name}"
                dest_path = media_dir / dest_name
                shutil.copy2(g_src, dest_path)
                rel_path = f"room_images/2026/10/{dest_name}"
                RoomImage.objects.create(
                    room_type=rt,
                    image=rel_path,
                    alt_text=alt_label,
                    is_primary=False,
                    sort_order=idx,
                )
                print(f"  Added gallery image: {rel_path}")

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed()

