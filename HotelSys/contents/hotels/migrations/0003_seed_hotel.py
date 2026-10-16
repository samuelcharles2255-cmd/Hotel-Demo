from decimal import Decimal
from django.db import migrations


def seed_hotel_data(apps, schema_editor):
    Hotel = apps.get_model("hotels", "Hotel")
    RoomType = apps.get_model("hotels", "RoomType")
    Room = apps.get_model("hotels", "Room")

    hotel, _ = Hotel.objects.get_or_create(
        slug="aether-luxury-hotel",
        defaults={
            "name": "Aether Luxury Hotel",
            "description": (
                "Specialty luxury lodging in Mbeya, Tanzania, situated on Hospital Hill Road. "
                "Features executive king bedrooms, spacious twin suites, dedicated workstations, "
                "private kitchenettes, meeting facilities, a restaurant & lounge, and airport transportation."
            ),
            "address": "Hospital Hill Rd, 4C5R+R3H",
            "city": "Mbeya",
            "country": "Tanzania",
            "phone": "+255 618 130 940",
            "email": "reservations@aether-mbeya.com",
            "currency": "TSH",
            "timezone": "Africa/Dar_es_Salaam",
            "is_active": True,
        },
    )

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
                "Breakfast included",
            ],
            "rooms": ["101", "102", "103", "104"],
        },
        {
            "name": "Deluxe Twin Room",
            "description": (
                "Tastefully appointed room with two comfortable double beds, designer headboards, "
                "carpeted floors, dedicated work desk, satellite TV, and modern bathroom."
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
                "Breakfast included",
            ],
            "rooms": ["201", "202", "203", "204"],
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
                "Executive Dining & Lounge",
                "In-Room Kitchenette & Bar",
                "King Bedroom Ensuite",
                "High Speed WiFi & Workstation",
            ],
            "rooms": ["301", "302", "303"],
        },
        {
            "name": "Conference & Meeting Hall Suite",
            "description": (
                "Specialized corporate facility equipped with modular executive seating, banquet dining "
                "configuration, audiovisual presentation projection, and dedicated catering breakout areas."
            ),
            "base_price": Decimal("600000.00"),
            "max_adults": 10,
            "max_children": 0,
            "bed_configuration": "Conference Table & Lounge",
            "amenities": [
                "Conference Tables & Ergonomic Chairs",
                "High-definition AV projection & PA sound",
                "Dedicated breakout dining space",
                "High-speed corporate WiFi",
            ],
            "rooms": ["401"],
        },
    ]

    for rt_data in room_types_data:
        rt, _ = RoomType.objects.get_or_create(
            hotel=hotel,
            name=rt_data["name"],
            defaults={
                "description": rt_data["description"],
                "base_price": rt_data["base_price"],
                "max_adults": rt_data["max_adults"],
                "max_children": rt_data["max_children"],
                "bed_configuration": rt_data["bed_configuration"],
                "amenities": rt_data["amenities"],
                "is_active": True,
            },
        )
        for room_num in rt_data["rooms"]:
            Room.objects.get_or_create(
                hotel=hotel,
                number=room_num,
                defaults={
                    "room_type": rt,
                    "status": "active",
                },
            )


def unseed_hotel_data(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("hotels", "0002_initial"),
    ]

    operations = [
        migrations.RunPython(seed_hotel_data, unseed_hotel_data),
    ]
