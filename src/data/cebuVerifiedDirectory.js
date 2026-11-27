// 20 Real Cebu City Restaurants, Fast Food Chains, Lechon Houses & Cafés
// Mirrors the 20 records in SUPABASE_SETUP.md (owner-1 through owner-20) so they
// appear immediately on the Cebu City map and in the Max Budget (₱) filter even
// before Overpass finishes loading or before the SQL seed is executed.

export const CEBU_VERIFIED_RESTAURANTS = [
  {
    id: 'owner-1',
    osmType: 'foodfinder',
    osmId: '1',
    name: 'Jollibee — Fuente Osmeña Circle',
    lat: 10.3108,
    lon: 123.8939,
    category: 'Fast Food',
    cuisine: 'Filipino Fast Food',
    cuisines: ['Filipino Fast Food', 'Fried Chicken', 'Burgers'],
    address: 'Fuente Osmeña Circle, Capitol Site, Cebu City',
    openingHours: '24/7',
    phone: '(032) 254-8888',
    website: 'https://www.jollibee.com.ph',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'jb-1',
        name: '1-pc Chickenjoy with Jolly Spaghetti',
        category: 'Chickenjoy & Combos',
        price: 142,
        description:
          'Crispylicious, juicylicious fried chicken served with sweet-style Jolly Spaghetti and gravy.',
        imageUrl:
          'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'jb-2',
        name: '1-pc Chickenjoy Solo with Rice',
        category: 'Chickenjoy & Combos',
        price: 92,
        description:
          'Signature crispy fried chicken with steamed white rice and signature gravy.',
        imageUrl:
          'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'jb-3',
        name: 'Yumburger Solo',
        category: 'Burgers',
        price: 45,
        description: '100% pure beef patty with signature burger dressing on a soft bun.',
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'jb-4',
        name: 'Cheesy Yumburger',
        category: 'Burgers',
        price: 69,
        description:
          'Beef yumburger topped with creamy melted cheddar cheese and special dressing.',
        imageUrl:
          'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'jb-5',
        name: 'Jolly Spaghetti Solo',
        category: 'Noodles & Pasta',
        price: 65,
        description:
          'Filipino sweet-style spaghetti loaded with sliced hotdogs, ground meat, and grated cheese.',
        imageUrl:
          'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'jb-6',
        name: 'Palabok Fiesta Solo',
        category: 'Noodles & Pasta',
        price: 128,
        description:
          'Rice noodles topped with savory garlic-shrimp sauce, crushed chicharon, tinapa flakes, and egg.',
        imageUrl:
          'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'jb-7',
        name: 'Peach Mango Pie',
        category: 'Desserts & Drinks',
        price: 48,
        description:
          'Golden crispy pocket crust filled with real Philippine mangoes and peaches.',
        imageUrl:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-2',
    osmType: 'foodfinder',
    osmId: '2',
    name: "McDonald's — Fuente Osmeña",
    lat: 10.3095,
    lon: 123.8938,
    category: 'Fast Food',
    cuisine: 'Burgers & Fried Chicken',
    cuisines: ['Burgers', 'Fried Chicken', 'Fast Food'],
    address: 'Osmeña Blvd, Santa Cruz, Cebu City',
    openingHours: '24/7',
    phone: '(032) 253-6236',
    website: 'https://www.mcdonalds.com.ph',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'mc-1',
        name: '1-pc Chicken McDo with Rice',
        category: 'Chicken & Rice Meals',
        price: 92,
        description:
          'Golden crispy Chicken McDo served with steamed rice and savory mushroom gravy.',
        imageUrl:
          'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'mc-2',
        name: 'Big Mac Solo',
        category: 'Burgers',
        price: 179,
        description:
          'Double 100% beef patties, special Big Mac sauce, crisp lettuce, cheese, pickles, and onions.',
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'mc-3',
        name: 'Burger McDo Solo',
        category: 'Burgers',
        price: 44,
        description: 'Juicy beef patty with sweet-tangy Filipino burger sauce on a toasted bun.',
        imageUrl:
          'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'mc-4',
        name: 'McSpaghetti Solo',
        category: 'Pasta & Sides',
        price: 67,
        description: 'Sweet-sarap Filipino spaghetti with hotdog slices and cheddar cheese.',
        imageUrl:
          'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'mc-5',
        name: 'World Famous Fries (Medium)',
        category: 'Pasta & Sides',
        price: 79,
        description: 'Crispy golden potato fries lightly salted and cooked fresh.',
        imageUrl:
          'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'mc-6',
        name: 'McFlurry with Oreo',
        category: 'Desserts & Drinks',
        price: 69,
        description: 'Creamy vanilla soft-serve swirled with crunchy Oreo cookie pieces.',
        imageUrl:
          'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'mc-7',
        name: 'Coke McFloat',
        category: 'Desserts & Drinks',
        price: 57,
        description:
          'Chilled Coca-Cola topped with creamy vanilla soft-serve and chocolate syrup.',
        imageUrl:
          'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-3',
    osmType: 'foodfinder',
    osmId: '3',
    name: 'House of Lechon — Acacia Street',
    lat: 10.3193,
    lon: 123.9032,
    category: 'Restaurant',
    cuisine: 'Cebu Lechon & Filipino',
    cuisines: ['Cebu Lechon', 'Filipino', 'Cebuano'],
    address: 'Acacia St, Kamputhaw, Cebu City',
    openingHours: '10:00 AM – 10:00 PM',
    phone: '(032) 231-0958',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'hol-1',
        name: 'Carcar Special Lechon (1/4 kg)',
        category: 'Signature Cebu Lechon',
        price: 265,
        description:
          'Authentic Carcar-style slow-roasted pork with aromatic lemongrass, garlic, and crackling skin.',
        imageUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'hol-2',
        name: 'Spicy Cebu Lechon (1/4 kg)',
        category: 'Signature Cebu Lechon',
        price: 275,
        description:
          "Crispy roasted Cebu lechon infused with native bird's eye chilies and scallions.",
        imageUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'hol-3',
        name: 'Carcar Special Lechon (1/2 kg)',
        category: 'Signature Cebu Lechon',
        price: 510,
        description:
          'Half-kilogram platter of golden Carcar lechon served with rich liver-drippings gravy.',
        imageUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'hol-4',
        name: 'Baked Bantayan Scallops',
        category: 'Cebuano Classics',
        price: 285,
        description: 'Fresh Bantayan Island scallops baked with garlic butter and melted cheese.',
        imageUrl:
          'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'hol-5',
        name: 'Cebu Ngohiong Platter',
        category: 'Cebuano Classics',
        price: 160,
        description:
          'Five-spice julienned heart-of-palm and minced pork rolls with house spicy sweet sauce.',
        imageUrl:
          'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'hol-6',
        name: 'Dinuguan sa Carcar',
        category: 'Cebuano Classics',
        price: 185,
        description: 'Savory Cebuano pork blood stew simmered with vinegar, garlic, and green chili.',
        imageUrl:
          'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-4',
    osmType: 'foodfinder',
    osmId: '4',
    name: "Rico's Lechon — Escario Central",
    lat: 10.3177,
    lon: 123.8961,
    category: 'Restaurant',
    cuisine: 'Cebu Lechon & Filipino',
    cuisines: ['Cebu Lechon', 'Filipino'],
    address: 'N. Escario St, Capitol Site, Cebu City',
    openingHours: '10:00 AM – 10:00 PM',
    phone: '(032) 260-4719',
    website: 'https://ricoslechon.com',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'rl-1',
        name: 'Original Cebu Lechon (1/4 kg)',
        category: 'Roasted Lechon',
        price: 260,
        description:
          "Rico's world-famous Cebu lechon roasted with native lemongrass and crushed garlic.",
        imageUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'rl-2',
        name: 'Spicy Cebu Lechon (1/4 kg)',
        category: 'Roasted Lechon',
        price: 275,
        description: 'Pioneering spicy roasted Cebu lechon seasoned with chilies and native herbs.',
        imageUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'rl-3',
        name: 'Lechon Paksiw',
        category: 'Main Dishes',
        price: 240,
        description:
          'Tender roasted lechon simmered in a sweet-tangy liver and cane vinegar reduction.',
        imageUrl:
          'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'rl-4',
        name: 'Monggos with Lechon Bits',
        category: 'Main Dishes',
        price: 165,
        description: 'Slow-cooked mung bean stew topped with crispy roasted lechon cracklings.',
        imageUrl:
          'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'rl-5',
        name: 'Kinilaw na Tanigue',
        category: 'Appetizers & Seafood',
        price: 295,
        description:
          'Fresh Spanish mackerel cured in coconut vinegar, ginger, red onions, and chili.',
        imageUrl:
          'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'rl-6',
        name: 'Buko Pandan Salad',
        category: 'Desserts',
        price: 110,
        description: 'Chilled young coconut strips and pandan jelly in sweetened cream.',
        imageUrl:
          'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-5',
    osmType: 'foodfinder',
    osmId: '5',
    name: 'CNT Lechon — Guadalupe',
    lat: 10.3204,
    lon: 123.8845,
    category: 'Restaurant',
    cuisine: 'Traditional Cebu Lechon',
    cuisines: ['Cebu Lechon', 'Filipino'],
    address: 'V. Rama Ave, Guadalupe, Cebu City',
    openingHours: '07:00 AM – 08:00 PM',
    phone: '(032) 254-4249',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'cnt-1',
        name: 'CNT Roasted Cebu Lechon (1/4 kg)',
        category: 'Cebu Lechon',
        price: 250,
        description:
          'Classic salty-savory Cebu lechon with ultra-crispy red skin roasted over charcoal.',
        imageUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'cnt-2',
        name: 'CNT Lechon Belly Cut (1/4 kg)',
        category: 'Cebu Lechon',
        price: 265,
        description:
          'Juicy rib-and-belly section seasoned with lemongrass, peppercorns, and spring onions.',
        imageUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'cnt-3',
        name: 'CNT Roasted Lechon (1/2 kg)',
        category: 'Cebu Lechon',
        price: 490,
        description: 'Half-kilogram family order of freshly chopped CNT Cebu Lechon.',
        imageUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'cnt-4',
        name: 'Traditional Dinuguan Bowl',
        category: 'Sides & Rice',
        price: 95,
        description: 'Rich Cebuano blood stew served warm to pair with puso and lechon.',
        imageUrl:
          'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'cnt-5',
        name: 'Puso (Hanging Rice · 5 pcs)',
        category: 'Sides & Rice',
        price: 35,
        description: 'Traditional Cebuano rice boiled inside woven young coconut fronds.',
        imageUrl:
          'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'cnt-6',
        name: 'Atsara Pickled Papaya',
        category: 'Sides & Rice',
        price: 65,
        description: 'Sweet and tangy pickled green papaya slaw.',
        imageUrl:
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-6',
    osmType: 'foodfinder',
    osmId: '6',
    name: 'Chowking — Colon Street',
    lat: 10.2968,
    lon: 123.899,
    category: 'Fast Food',
    cuisine: 'Chinese Fast Food',
    cuisines: ['Chinese', 'Dimsum', 'Noodles'],
    address: 'Colon St, Downtown, Cebu City',
    openingHours: '07:00 AM – 10:00 PM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'ck-1',
        name: 'Chinese-Style Fried Chicken Lauriat',
        category: 'Lauriat & Rice Meals',
        price: 215,
        description: 'Fried chicken, pancit canton, egg fried rice, siomai, buchi, and chicharap.',
        imageUrl:
          'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'ck-2',
        name: 'Pork Chao Fan with Steamed Siomai',
        category: 'Lauriat & Rice Meals',
        price: 109,
        description: 'Wok-fried pork Chao Fan rice topped with 4 pieces of steamed pork siomai.',
        imageUrl:
          'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'ck-3',
        name: 'Beef Wonton Mami',
        category: 'Noodles & Dimsum',
        price: 125,
        description:
          'Egg noodles in rich beef broth with braised beef chunks, wontons, and bok choy.',
        imageUrl:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'ck-4',
        name: 'Chunky Asado Siopao',
        category: 'Noodles & Dimsum',
        price: 62,
        description: 'Fluffy steamed bun filled with sweet-savory Chinese roast pork asado.',
        imageUrl:
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'ck-5',
        name: 'SuperSangkap Halo-Halo',
        category: 'Desserts',
        price: 99,
        description:
          'Shaved ice dessert with leche flan, ube halaya, sweetened beans, macapuno, and ice cream.',
        imageUrl:
          'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-7',
    osmType: 'foodfinder',
    osmId: '7',
    name: 'Mang Inasal — Ayala Center Cebu',
    lat: 10.3183,
    lon: 123.9056,
    category: 'Fast Food',
    cuisine: 'Filipino Charcoal Grill',
    cuisines: ['Filipino', 'Barbecue', 'Fast Food'],
    address: 'Ayala Center Cebu, Cebu Business Park, Cebu City',
    openingHours: '10:00 AM – 09:00 PM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'mi-1',
        name: 'Chicken Inasal Paa Large (PM1)',
        category: 'Charcoal Grilled Meals',
        price: 159,
        description:
          'Marinated chicken leg & thigh grilled over charcoal, served with rice, chicken oil, and calamansi.',
        imageUrl:
          'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'mi-2',
        name: 'Chicken Inasal Pecho Large (PM2)',
        category: 'Charcoal Grilled Meals',
        price: 169,
        description:
          'Charcoal-grilled chicken breast & wing marinated in lemongrass, ginger, and annatto.',
        imageUrl:
          'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'mi-3',
        name: '2-pc Pork BBQ Meal',
        category: 'Charcoal Grilled Meals',
        price: 129,
        description:
          'Two caramelized grilled pork barbecue skewers served with spiced vinegar and rice.',
        imageUrl:
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'mi-4',
        name: 'Sizzling Bangus Sisig',
        category: 'Sizzling & Merienda',
        price: 149,
        description:
          'Flaked milkfish sisig seasoned with onions, chili, and calamansi on a sizzling plate.',
        imageUrl:
          'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'mi-5',
        name: 'Extra Creamy Halo-Halo',
        category: 'Desserts',
        price: 99,
        description: 'Creamy shaved milk ice topped with leche flan, ube, banana, and golden corn.',
        imageUrl:
          'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-8',
    osmType: 'foodfinder',
    osmId: '8',
    name: 'KFC — Cebu IT Park',
    lat: 10.3309,
    lon: 123.9065,
    category: 'Fast Food',
    cuisine: 'Fried Chicken & Bowls',
    cuisines: ['Fried Chicken', 'Burgers', 'Fast Food'],
    address: 'Skyrise 4, Cebu IT Park, Lahug, Cebu City',
    openingHours: '24/7',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'kfc-1',
        name: '1-pc Original Recipe Chicken w/ Rice',
        category: 'Chicken & Rice Bowls',
        price: 99,
        description:
          '11 herbs and spices fried chicken served with steamed rice and signature KFC gravy.',
        imageUrl:
          'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'kfc-2',
        name: 'Famous Bowl Meal',
        category: 'Chicken & Rice Bowls',
        price: 130,
        description:
          'Mashed potato bowl layered with sweet corn, crispy chicken shots, signature gravy, and shredded cheese.',
        imageUrl:
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'kfc-3',
        name: 'Sisig Rice Bowl',
        category: 'Chicken & Rice Bowls',
        price: 145,
        description:
          'Crispy chicken sisig tossed in savory mayo-calamansi dressing over hot rice with egg.',
        imageUrl:
          'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'kfc-4',
        name: 'Zinger Burger Solo',
        category: 'Burgers & Sides',
        price: 155,
        description:
          'Spicy crunchy chicken thigh fillet with lettuce and mayo on a toasted sesame bun.',
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'kfc-5',
        name: 'Mashed Potato (Regular)',
        category: 'Burgers & Sides',
        price: 55,
        description: 'Whipped mashed potatoes topped with warm KFC gravy.',
        imageUrl:
          'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-9',
    osmType: 'foodfinder',
    osmId: '9',
    name: 'Larsian BBQ — Fuente Osmeña',
    lat: 10.3098,
    lon: 123.8919,
    category: 'Restaurant',
    cuisine: 'Cebuano Street BBQ & Grill',
    cuisines: ['Barbecue', 'Cebuano', 'Seafood'],
    address: 'Don Mariano Cui St, Capitol Site, Cebu City',
    openingHours: '11:00 AM – 02:00 AM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'lar-1',
        name: 'Sinugbang Liempo (Grilled Pork Belly)',
        category: 'Charcoal Grill',
        price: 135,
        description:
          'Thick-cut marinated pork belly grilled over open charcoal, served with soy-calamansi chili dip.',
        imageUrl:
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'lar-2',
        name: 'Pork BBQ Skewers (5 Sticks)',
        category: 'Charcoal Grill',
        price: 75,
        description: 'Classic Cebu sweet-garlicky pork barbecue skewers basted on the grill.',
        imageUrl:
          'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'lar-3',
        name: 'Chorizo de Cebu Skewers (3 pcs)',
        category: 'Charcoal Grill',
        price: 85,
        description: 'Smoky-sweet round Cebuano pork sausages grilled over hot coals.',
        imageUrl:
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'lar-4',
        name: 'Sinugbang Nokus (Grilled Whole Squid)',
        category: 'Grilled Seafood',
        price: 165,
        description: 'Fresh squid stuffed with tomatoes and onions, charred over charcoal.',
        imageUrl:
          'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'lar-5',
        name: 'Puso (Hanging Rice · 6 pcs)',
        category: 'Rice & Drinks',
        price: 30,
        description: 'Six pieces of traditional Cebu woven coconut-leaf hanging rice.',
        imageUrl:
          'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-10',
    osmType: 'foodfinder',
    osmId: '10',
    name: 'Siomai sa Tisa — Original Katipunan Stall',
    lat: 10.2981,
    lon: 123.8732,
    category: 'Fast Food',
    cuisine: 'Cebu Dimsum & Street Food',
    cuisines: ['Dimsum', 'Cebuano', 'Street Food'],
    address: 'Katipunan St, Brgy. Tisa, Cebu City',
    openingHours: '06:00 AM – 12:00 AM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'tisa-1',
        name: 'Original Siomai sa Tisa (4 pcs)',
        category: 'Steamed Dimsum',
        price: 48,
        description:
          'Famous Barangay Tisa pork-and-shrimp dumplings topped with signature crispy chili garlic oil.',
        imageUrl:
          'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'tisa-2',
        name: 'Siomai sa Tisa Double Order (8 pcs)',
        category: 'Steamed Dimsum',
        price: 92,
        description:
          'Eight steamed Tisa pork siomai drizzled with calamansi soy and house chili oil.',
        imageUrl:
          'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'tisa-3',
        name: 'Cebu Pork Ngohiong (2 pcs)',
        category: 'Street Favorites',
        price: 36,
        description: 'Crispy battered five-spice ubod and pork spring rolls.',
        imageUrl:
          'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'tisa-4',
        name: 'Halang-Halang Beef Soup',
        category: 'Street Favorites',
        price: 85,
        description: 'Spicy Cebuano ginger-and-chili beef broth bowl.',
        imageUrl:
          'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'tisa-5',
        name: 'Puso Hanging Rice (4 pcs)',
        category: 'Rice & Drinks',
        price: 24,
        description: 'Four pieces of woven coconut-leaf hanging rice.',
        imageUrl:
          'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-11',
    osmType: 'foodfinder',
    osmId: '11',
    name: 'Sunburst Fried Chicken — Mango Square',
    lat: 10.3118,
    lon: 123.8981,
    category: 'Restaurant',
    cuisine: 'Heritage Fried Chicken',
    cuisines: ['Fried Chicken', 'Filipino'],
    address: 'Gen. Maxilom Ave, Kamputhaw, Cebu City',
    openingHours: '10:00 AM – 10:00 PM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'sb-1',
        name: 'Sunburst Snack Pack (2-pc Chicken)',
        category: 'Heritage Fried Chicken',
        price: 225,
        description:
          'Two pieces of signature pressure-fried chicken with coleslaw, potato fries, rice, and banana ketchup.',
        imageUrl:
          'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'sb-2',
        name: 'Regular Leg & Thigh Meal',
        category: 'Heritage Fried Chicken',
        price: 185,
        description:
          'Golden fried chicken quarter served with rice, gravy, and chilled coleslaw.',
        imageUrl:
          'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'sb-3',
        name: 'Crispy Chicken Skin Cracklings',
        category: 'Appetizers',
        price: 145,
        description:
          'Crunchy spiced chicken skin cracklings served with sinamak spiced vinegar.',
        imageUrl:
          'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'sb-4',
        name: 'Pork Teriyaki Rice Plate',
        category: 'Rice Meals',
        price: 195,
        description: 'Grilled glazed pork slices with buttered vegetables and garlic rice.',
        imageUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-12',
    osmType: 'foodfinder',
    osmId: '12',
    name: 'Orange Brutus — Fuente Osmeña',
    lat: 10.3105,
    lon: 123.893,
    category: 'Fast Food',
    cuisine: 'Sizzling Steaks & Burgers',
    cuisines: ['Burgers', 'Filipino Fast Food'],
    address: 'Fuente Osmeña Circle, Capitol Site, Cebu City',
    openingHours: '07:00 AM – 09:00 PM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'ob-1',
        name: 'Sizzling Burger Steak with Egg',
        category: 'Sizzling Plates',
        price: 125,
        description:
          "Cebu's iconic sizzling beef patty smothered in mushroom gravy with fried egg and rice.",
        imageUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'ob-2',
        name: 'Brute Burger with Cheese',
        category: 'Burgers & Meals',
        price: 89,
        description:
          'Flame-grilled pure beef burger with cheddar cheese, tomato, and house dressing.',
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'ob-3',
        name: 'Chorizo Burger Meal with Egg',
        category: 'Burgers & Meals',
        price: 98,
        description:
          'Sweet-savory Cebu chorizo patties served with sunny-side-up egg and steamed rice.',
        imageUrl:
          'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'ob-4',
        name: 'Chocolate Monster Cake Slice',
        category: 'Desserts & Shakes',
        price: 95,
        description:
          'Famous moist dark chocolate fudge cake topped with rich chocolate ganache.',
        imageUrl:
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'ob-5',
        name: 'Fresh Cebu Mango Shake',
        category: 'Desserts & Shakes',
        price: 75,
        description: 'Blended ripe Cebu carabao mango shake with milk.',
        imageUrl:
          'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-13',
    osmType: 'foodfinder',
    osmId: '13',
    name: 'Dimsum Break — Colon Heritage',
    lat: 10.2963,
    lon: 123.8979,
    category: 'Fast Food',
    cuisine: 'Cantonese Dimsum & Noodles',
    cuisines: ['Dimsum', 'Chinese', 'Noodles'],
    address: 'Colon St cor. Osmeña Blvd, Downtown, Cebu City',
    openingHours: '07:00 AM – 09:00 PM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'db-1',
        name: 'Original Steamed Fried Rice',
        category: 'Signature Dimsum',
        price: 115,
        description:
          "Cebu's beloved garlic fried rice topped with savory braised pork ribs, shrimp, and green peas.",
        imageUrl:
          'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'db-2',
        name: 'Hakaw Shrimp Dumplings (4 pcs)',
        category: 'Signature Dimsum',
        price: 128,
        description: 'Translucent steamed crystal dumplings filled with whole plump shrimp.',
        imageUrl:
          'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'db-3',
        name: 'Bacon Wrapped Siomai (4 pcs)',
        category: 'Signature Dimsum',
        price: 115,
        description: 'Steamed pork and mushroom siomai wrapped in smoky bacon strips.',
        imageUrl:
          'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'db-4',
        name: 'Qua Pao Steamed Pork Belly Bun',
        category: 'Buns & Desserts',
        price: 85,
        description:
          'Soft lotus leaf bun stuffed with five-spice braised pork belly and crushed peanuts.',
        imageUrl:
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'db-5',
        name: 'Almond Lychee Jelly',
        category: 'Buns & Desserts',
        price: 78,
        description: 'Chilled almond pudding cubes with sweet lychees in syrup.',
        imageUrl:
          'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-14',
    osmType: 'foodfinder',
    osmId: '14',
    name: 'Chika-an sa Cebu — Salinas Drive Lahug',
    lat: 10.3283,
    lon: 123.9029,
    category: 'Restaurant',
    cuisine: 'Traditional Cebuano & Filipino',
    cuisines: ['Cebuano', 'Filipino', 'Seafood'],
    address: 'Salinas Drive, Lahug, Cebu City',
    openingHours: '10:00 AM – 10:00 PM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'chk-1',
        name: 'Crispy Pata Regular',
        category: 'House Specialties',
        price: 545,
        description:
          'Deep-fried pork knuckle with blistered crackling skin and soy-vinegar onion dip.',
        imageUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'chk-2',
        name: 'Baked Scallops in Garlic Butter',
        category: 'House Specialties',
        price: 265,
        description: 'Broiled Visayan scallops topped with melted quezo and toasted garlic.',
        imageUrl:
          'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'chk-3',
        name: 'Pinakbet with Lechon Kawali',
        category: 'Vegetables & Noodles',
        price: 215,
        description:
          'Squash, eggplant, bitter melon, and string beans sautéed in shrimp paste with crispy pork.',
        imageUrl:
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'chk-4',
        name: 'Bam-i Cebuano',
        category: 'Vegetables & Noodles',
        price: 195,
        description:
          'Cebuano combination of sotanghon glass noodles and egg canton with pork, shrimp, and wood ear mushrooms.',
        imageUrl:
          'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'chk-5',
        name: 'Puto Maya at Sikwate',
        category: 'Cebuano Desserts',
        price: 125,
        description:
          'Ginger-infused sticky black & white glutinous rice with hot tablea cacao chocolate and ripe mango.',
        imageUrl:
          'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-15',
    osmType: 'foodfinder',
    osmId: '15',
    name: "STK ta Bay! — Paolito's Seafood House",
    lat: 10.3144,
    lon: 123.8914,
    category: 'Restaurant',
    cuisine: 'Seafood · Sugba Tuwa Kilaw',
    cuisines: ['Seafood', 'Cebuano', 'Filipino'],
    address: 'Orchid St, Capitol Site, Cebu City',
    openingHours: '10:30 AM – 10:00 PM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'stk-1',
        name: 'Sinugbang Panga sa Tuna (Grilled Tuna Jaw)',
        category: 'Sugba · Tuwa · Kilaw',
        price: 380,
        description: 'Charcoal-grilled yellowfin tuna jaw basted in sweet soy and calamansi.',
        imageUrl:
          'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'stk-2',
        name: 'Kinilaw na Tangigue',
        category: 'Sugba · Tuwa · Kilaw',
        price: 285,
        description:
          'Fresh mackerel cubes dressed in spiced tuba vinegar, ginger, shallots, and coconut milk.',
        imageUrl:
          'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'stk-3',
        name: 'Tinolang Manok Bisaya',
        category: 'Sugba · Tuwa · Kilaw',
        price: 260,
        description:
          'Native chicken soup simmered with green papaya, lemongrass, and moringa leaves (malunggay).',
        imageUrl:
          'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'stk-4',
        name: 'Crispy Chicharon Bakasi (Reef Eel)',
        category: 'Seafood & Vegetables',
        price: 230,
        description:
          'Cordova delicacy of crispy fried saltwater reef eel served with spiced vinegar.',
        imageUrl:
          'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'stk-5',
        name: 'Adobong Kangkong with Crispy Garlic',
        category: 'Seafood & Vegetables',
        price: 140,
        description: 'Water spinach braised in soy sauce, cane vinegar, and roasted garlic.',
        imageUrl:
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-16',
    osmType: 'foodfinder',
    osmId: '16',
    name: 'Abaca Baking Company — Crossroads Banilad',
    lat: 10.3357,
    lon: 123.9114,
    category: 'Café',
    cuisine: 'Artisan Bakery & All-Day Brunch',
    cuisines: ['Bakery', 'Coffee', 'Brunch'],
    address: 'Crossroads, Gov. M. Cuenco Ave, Banilad, Cebu City',
    openingHours: '07:00 AM – 10:00 PM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'abc-1',
        name: 'Classic French Butter Croissant',
        category: 'Viennoiserie & Pastries',
        price: 135,
        description:
          'Hand-laminated 27-layer flaky pastry baked golden with cultured French butter.',
        imageUrl:
          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'abc-2',
        name: 'Toasted Almond Pain au Chocolat',
        category: 'Viennoiserie & Pastries',
        price: 165,
        description:
          'Double dark chocolate batons baked in croissant pastry with almond frangipane.',
        imageUrl:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'abc-3',
        name: 'Eggs Benedict on Country Sourdough',
        category: 'All-Day Brunch',
        price: 395,
        description:
          'Two poached farm eggs, house-cured bacon, and lemon hollandaise over toasted sourdough.',
        imageUrl:
          'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'abc-4',
        name: 'Iced Spanish Latte',
        category: 'Specialty Espresso',
        price: 175,
        description:
          'Double-shot Abaca espresso shaken with textured milk and sweet condensed milk.',
        imageUrl:
          'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'abc-5',
        name: 'Flat White',
        category: 'Specialty Espresso',
        price: 160,
        description: 'Velvety micro-foamed milk poured over a double ristretto shot.',
        imageUrl:
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-17',
    osmType: 'foodfinder',
    osmId: '17',
    name: "Bo's Coffee — Capitol Flagship",
    lat: 10.3155,
    lon: 123.8916,
    category: 'Café',
    cuisine: 'Philippine Origin Coffee & Pastries',
    cuisines: ['Coffee', 'Pastries', 'Filipino Café'],
    address: 'Osmeña Blvd, Capitol Site, Cebu City',
    openingHours: '07:00 AM – 11:00 PM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'bos-1',
        name: 'Iced Creamy Latte',
        category: 'Philippine Coffee',
        price: 155,
        description:
          'Signature Philippine Highland arabica espresso over ice with sweet creamy milk.',
        imageUrl:
          'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'bos-2',
        name: 'Sagada Single Origin Pour Over',
        category: 'Philippine Coffee',
        price: 145,
        description:
          'Hand-poured Cordillera arabica with notes of dark cocoa and toasted nuts.',
        imageUrl:
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'bos-3',
        name: 'Caramel Froccino',
        category: 'Philippine Coffee',
        price: 175,
        description:
          'Ice-blended espresso topped with whipped cream and buttery caramel drizzle.',
        imageUrl:
          'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'bos-4',
        name: 'Grilled Three-Cheese Panini',
        category: 'All-Day Café Plates',
        price: 195,
        description: 'Mozzarella, cheddar, and cream cheese pressed on artisan ciabatta bread.',
        imageUrl:
          'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'bos-5',
        name: 'Classic New York Cheesecake',
        category: 'All-Day Café Plates',
        price: 165,
        description: 'Rich baked cream cheese slice on a buttery graham crust.',
        imageUrl:
          'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-18',
    osmType: 'foodfinder',
    osmId: '18',
    name: 'Tightrope Coffee — F. Cabahug',
    lat: 10.3248,
    lon: 123.9163,
    category: 'Café',
    cuisine: 'Specialty Coffee & Modern Brunch',
    cuisines: ['Coffee', 'Brunch', 'Pasta'],
    address: 'F. Cabahug St, Kasambagan, Cebu City',
    openingHours: '08:00 AM – 09:00 PM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'tr-1',
        name: 'Dirty Horchata Espresso',
        category: 'Craft Coffee',
        price: 175,
        description:
          'House cinnamon-rice horchata milk crowned with a double shot of specialty espresso.',
        imageUrl:
          'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'tr-2',
        name: 'Sea Salt Caramel Cold Brew',
        category: 'Craft Coffee',
        price: 165,
        description:
          '18-hour slow-steeped cold brew finished with whipped sea salt cream foam.',
        imageUrl:
          'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'tr-3',
        name: 'Truffle Mushroom Cream Pasta',
        category: 'Café Kitchen',
        price: 310,
        description:
          'Al dente linguine tossed with roasted shiitake mushrooms, parmesan, and white truffle oil.',
        imageUrl:
          'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'tr-4',
        name: 'Burnt Basque Cheesecake',
        category: 'Café Kitchen',
        price: 190,
        description:
          'Caramelized San Sebastian-style cheesecake with a creamy custardy center.',
        imageUrl:
          'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-19',
    osmType: 'foodfinder',
    osmId: '19',
    name: 'Sugbo Mercado — Cebu IT Park',
    lat: 10.3318,
    lon: 123.9061,
    category: 'Restaurant',
    cuisine: 'Cebu Night Market & Street Food',
    cuisines: ['Cebuano', 'Street Food', 'Barbecue'],
    address: 'Garden Bloc, Cebu IT Park, Apas, Cebu City',
    openingHours: '03:00 PM – 11:00 PM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'sm-1',
        name: 'Cebu Lechon Belly Roll Plate',
        category: 'Night Market Hits',
        price: 180,
        description:
          'Boneless herbed pork belly lechon chop served with spiced vinegar and garlic rice.',
        imageUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'sm-2',
        name: 'Flame-Torched Wagyu Beef Cubes',
        category: 'Night Market Hits',
        price: 165,
        description:
          'Skewered beef cubes torched to order with cheese sauce and garlic rice.',
        imageUrl:
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'sm-3',
        name: 'Octopus Takoyaki Balls (6 pcs)',
        category: 'Street Bites',
        price: 110,
        description:
          'Japanese batter balls with tender octopus, takoyaki sauce, kewpie mayo, and bonito flakes.',
        imageUrl:
          'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'sm-4',
        name: 'Mango Graham Float Shake',
        category: 'Drinks & Desserts',
        price: 100,
        description:
          'Fresh Cebu mango shake layered with whipped cream, crushed graham crackers, and mango cubes.',
        imageUrl:
          'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
  {
    id: 'owner-20',
    osmType: 'foodfinder',
    osmId: '20',
    name: 'La Vie Parisienne — Gorordo Avenue',
    lat: 10.3264,
    lon: 123.9001,
    category: 'Café',
    cuisine: 'French Bakery, Pastries & Pizza',
    cuisines: ['French Bakery', 'Pizza', 'Coffee'],
    address: 'Gorordo Ave, Lahug, Cebu City',
    openingHours: '07:00 AM – 12:00 AM',
    ownerLocation: true,
    hasPublishedMenu: true,
    items: [
      {
        id: 'lvp-1',
        name: 'Ham & Emmental Croissant Sandwich',
        category: 'French Bakery',
        price: 210,
        description:
          'Freshly baked butter croissant layered with Paris ham, Swiss Emmental cheese, and Dijon butter.',
        imageUrl:
          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'lvp-2',
        name: 'Artisan French Macarons Box (4 pcs)',
        category: 'French Bakery',
        price: 220,
        description:
          'Assorted almond meringue macarons (Pistachio, Raspberry, Salted Caramel, Dark Chocolate).',
        imageUrl:
          'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'lvp-3',
        name: 'Wood-Fired Margherita Pizza',
        category: 'Deli & Pizza',
        price: 380,
        description:
          'Thin-crust brick-oven pizza with San Marzano tomato sauce, fior di latte mozzarella, and basil.',
        imageUrl:
          'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'lvp-4',
        name: 'Quiche Lorraine',
        category: 'Deli & Pizza',
        price: 195,
        description:
          'Savory French pastry tart baked with smoked bacon, gruyere cheese, and egg custard.',
        imageUrl:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
      {
        id: 'lvp-5',
        name: 'Café Cappuccino',
        category: 'Coffee & Drinks',
        price: 140,
        description: 'Rich French-roast espresso topped with steamed milk and frothy foam.',
        imageUrl:
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
        available: true,
      },
    ],
  },
];
