const db = require("./index");

const restaurants = [
  { id: "lakay", name: "Ti Manje Lakay", tag: "Restoran ayisyen", cover: "🍛", rating: 4.8, time_estimate: "10-18 min", fee: 75 },
  { id: "kokoye", name: "Kokoye Grill", tag: "Griye & Lanmè", cover: "🦐", rating: 4.6, time_estimate: "10-18 min", fee: 75 },
  { id: "bouyon", name: "Bouyon Boss", tag: "Soup & Bouyon", cover: "🍲", rating: 4.7, time_estimate: "10-18 min", fee: 75 },
  { id: "fritay", name: "Fritay Palè", tag: "Fritay & Snack", cover: "🍟", rating: 4.5, time_estimate: "10-18 min", fee: 75 },
  { id: "diri", name: "Diri Kole Deluxe", tag: "Plat Konplè", cover: "🍚", rating: 4.4, time_estimate: "10-18 min", fee: 75 },
  { id: "griyo", name: "Machann Griyo", tag: "Griyo Espesyal", cover: "🥘", rating: 4.9, time_estimate: "10-18 min", fee: 75 },
  { id: "fastfood", name: "Ti Kwen Fast Food", tag: "Fast Food & Pizza", cover: "🍕", rating: 4.6, time_estimate: "10-18 min", fee: 75 },
];

const menuItems = [
  { id: "l1", restaurant_id: "lakay", name: "Griyo ak Bannann", description: "Ak sòs piklis", price: 450 },
  { id: "l2", restaurant_id: "lakay", name: "Diri Kole ak Pwa Nwa", description: "Diri kole klasik", price: 300 },
  { id: "l3", restaurant_id: "lakay", name: "Poul Nan Sòs", description: "Poul mijote kreyòl", price: 400 },
  { id: "l4", restaurant_id: "lakay", name: "Legim ak Bèf", description: "Legim peyi ak bèf", price: 425 },
  { id: "l5", restaurant_id: "lakay", name: "Pain ak Ze", description: "Pen fre ak ze fri oswa boulye", price: 150 },
  { id: "k1", restaurant_id: "kokoye", name: "Lambi Griye", description: "Ak sòs pikan", price: 650 },
  { id: "k2", restaurant_id: "kokoye", name: "Pwason Fri Antye", description: "Ak bannann peze", price: 550 },
  { id: "k3", restaurant_id: "kokoye", name: "Kribich Sòs Kokoye", description: "Nan lèt kokoye", price: 700 },
  { id: "b1", restaurant_id: "bouyon", name: "Bouyon Konplè", description: "Ak legim ak vyann", price: 375 },
  { id: "b2", restaurant_id: "bouyon", name: "Soup Joumou", description: "Tradisyonèl", price: 350 },
  { id: "f1", restaurant_id: "fritay", name: "Akra ak Pikliz", description: "Cho e kwostiyan", price: 200 },
  { id: "f2", restaurant_id: "fritay", name: "Marinad", description: "Fri kwit nan moman", price: 150 },
  { id: "f3", restaurant_id: "fritay", name: "Bannann Peze", description: "Ak sòs ti malis", price: 175 },
  { id: "f4", restaurant_id: "fritay", name: "Tasso Kabrit", description: "Fri ak zepis", price: 500 },
  { id: "d1", restaurant_id: "diri", name: "Diri Djon Djon", description: "Ak vyann fri", price: 475 },
  { id: "d2", restaurant_id: "diri", name: "Diri ak Sòs Pwa Wouj", description: "Plat lakay", price: 300 },
  { id: "g1", restaurant_id: "griyo", name: "Griyo Konplè", description: "Diri, pwa, pikliz", price: 500 },
  { id: "g2", restaurant_id: "griyo", name: "Ti Griyo Solo", description: "Pou grangou vit", price: 250 },
  { id: "ff1", restaurant_id: "fastfood", name: "Spaghetti", description: "Sòs vyann", price: 275 },
  { id: "ff2", restaurant_id: "fastfood", name: "Pizza", description: "Fwomaj ak vyann", price: 500 },
  { id: "ff3", restaurant_id: "fastfood", name: "Sandwich", description: "Jambon ak fwomaj", price: 200 },
  { id: "ff4", restaurant_id: "fastfood", name: "Pâté", description: "Kode oswa vyann, cho", price: 100 },
  { id: "ff5", restaurant_id: "fastfood", name: "Lasagne", description: "Vyann ak fwomaj", price: 450 },
  { id: "ff6", restaurant_id: "fastfood", name: "Gratiné", description: "Fwomaj gratine cho", price: 400 },
  { id: "ff7", restaurant_id: "fastfood", name: "Diri Kole ak Pwason", description: "Pwason fri", price: 450 },
  { id: "ff8", restaurant_id: "fastfood", name: "Diri Kole ak Sòs Poul", description: "Sòs poul", price: 425 },
  { id: "ff9", restaurant_id: "fastfood", name: "Pica Pollo", description: "Poul fri estil pica pollo", price: 375 },
  { id: "ff10", restaurant_id: "fastfood", name: "Corn-dog", description: "Cho e krake", price: 175 },
];

const drivers = [
  { name: "Jean Louis", phone: "37000001" },
  { name: "Wilner Pierre", phone: "37000002" },
];

const insertRestaurant = db.prepare(`
  INSERT OR REPLACE INTO restaurants (id, name, tag, cover, rating, time_estimate, fee)
  VALUES (@id, @name, @tag, @cover, @rating, @time_estimate, @fee)
`);

const insertMenuItem = db.prepare(`
  INSERT OR REPLACE INTO menu_items (id, restaurant_id, name, description, price)
  VALUES (@id, @restaurant_id, @name, @description, @price)
`);

const insertDriver = db.prepare(`
  INSERT INTO drivers (name, phone) VALUES (?, ?)
`);

const seed = db.transaction(() => {
  restaurants.forEach((r) => insertRestaurant.run(r));
  menuItems.forEach((m) => insertMenuItem.run(m));

  const existingDrivers = db.prepare("SELECT COUNT(*) as n FROM drivers").get().n;
  if (existingDrivers === 0) {
    drivers.forEach((d) => insertDriver.run(d.name, d.phone));
  }
});

seed();

console.log(`Baz done seed ak ${restaurants.length} restoran, ${menuItems.length} plat, ${drivers.length} chofè.`);
