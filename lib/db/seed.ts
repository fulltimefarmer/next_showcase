import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { TABLE_DDL } from "./ddl";

try {
  const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envContent.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const value = t.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  /* use existing env */
}

const DATABASE_URL = process.env.DATABASE_URL!;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set, please check .env.local");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

const esc = (s: string) => s.replace(/'/g, "''");
function dateStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

const catDefs: [string, string, string][] = [
  ["Electronics", "electronics", "Consumer electronics and gadgets"],
  ["Clothing", "clothing", "Apparel and fashion"],
  ["Home & Kitchen", "home-kitchen", "Home appliances and kitchenware"],
  ["Beauty", "beauty", "Skincare and cosmetics"],
  ["Sports", "sports", "Sports equipment and outdoor"],
  ["Books", "books", "Books and stationery"],
  ["Toys", "toys", "Toys and games for kids"],
  ["Food", "food", "Snacks and gourmet food"],
];

const prodDefs: [string, string, string, number, string][] = [
  ["Wireless Mouse", "wireless-mouse", "Ergonomic wireless mouse", 25, "Electronics"],
  ["Mechanical Keyboard", "mechanical-keyboard", "RGB backlit mechanical keyboard", 89, "Electronics"],
  ["Bluetooth Headphones", "bluetooth-headphones", "Noise cancelling headphones", 129, "Electronics"],
  ["4K Monitor", "4k-monitor", "27 inch 4K IPS monitor", 349, "Electronics"],
  ["Smart Watch", "smart-watch", "Fitness tracking smart watch", 199, "Electronics"],
  ["Cotton T-Shirt", "cotton-t-shirt", "100% cotton casual t-shirt", 15, "Clothing"],
  ["Denim Jeans", "denim-jeans", "Classic slim fit denim jeans", 49, "Clothing"],
  ["Hoodie", "hoodie", "Warm fleece lined hoodie", 39, "Clothing"],
  ["Air Fryer", "air-fryer", "5.5L digital air fryer", 79, "Home & Kitchen"],
  ["Coffee Maker", "coffee-maker", "Programmable drip coffee maker", 59, "Home & Kitchen"],
  ["Blender", "blender", "High speed countertop blender", 45, "Home & Kitchen"],
  ["Face Serum", "face-serum", "Vitamin C brightening serum", 22, "Beauty"],
  ["Moisturizer", "moisturizer", "Hydrating daily moisturizer", 18, "Beauty"],
  ["Yoga Mat", "yoga-mat", "Non-slip eco friendly yoga mat", 28, "Sports"],
  ["Running Shoes", "running-shoes", "Lightweight running shoes", 95, "Sports"],
  ["Dumbbell Set", "dumbbell-set", "Adjustable dumbbell set", 120, "Sports"],
  ["Water Bottle", "water-bottle", "Insulated stainless steel bottle", 20, "Sports"],
  ["Novel", "novel", "Bestselling fiction novel", 12, "Books"],
  ["Cookbook", "cookbook", "Quick and easy recipes cookbook", 24, "Books"],
  ["Building Blocks", "building-blocks", "Creative building blocks set", 35, "Toys"],
  ["Stuffed Bear", "stuffed-bear", "Soft plush teddy bear", 16, "Toys"],
  ["Dark Chocolate", "dark-chocolate", "70% cacao dark chocolate bar", 6, "Food"],
  ["Green Tea", "green-tea", "Premium loose leaf green tea", 14, "Food"],
  ["Protein Bar", "protein-bar", "High protein snack bar (12 pack)", 22, "Food"],
];

const customerDefs: [string, string, string, string][] = [
  ["Alice Johnson", "alice@example.com", "13800000001", "active"],
  ["Bob Smith", "bob@example.com", "13800000002", "active"],
  ["Carol White", "carol@example.com", "13800000003", "active"],
  ["David Brown", "david@example.com", "13800000004", "active"],
  ["Eve Davis", "eve@example.com", "13800000005", "active"],
  ["Frank Miller", "frank@example.com", "13800000006", "active"],
  ["Grace Wilson", "grace@example.com", "13800000007", "active"],
  ["Henry Moore", "henry@example.com", "13800000008", "active"],
  ["Ivy Taylor", "ivy@example.com", "13800000009", "active"],
  ["Jack Anderson", "jack@example.com", "13800000010", "active"],
  ["Karen Thomas", "karen@example.com", "13800000011", "active"],
  ["Leo Jackson", "leo@example.com", "13800000012", "disabled"],
  ["Mia Harris", "mia@example.com", "13800000013", "active"],
  ["Nick Martin", "nick@example.com", "13800000014", "active"],
  ["Olivia Clark", "olivia@example.com", "13800000015", "active"],
  ["Peter Lewis", "peter@example.com", "13800000016", "disabled"],
];

const promoDefs: [string, string, string, number, number, string, string, number, string][] = [
  ["Welcome Discount", "WELCOME10", "fixed", 10, 50, dateStr(-30), dateStr(30), 1000, "active"],
  ["Summer Sale 20%", "SUMMER20", "percentage", 20, 100, dateStr(-15), dateStr(45), 500, "active"],
  ["Free Shipping", "FREESHIP", "fixed", 8, 80, dateStr(-60), dateStr(90), 2000, "active"],
  ["Member Only", "MEMBER5", "percentage", 5, 0, dateStr(-10), dateStr(120), 9999, "active"],
  ["Flash Sale", "FLASH50", "percentage", 50, 200, dateStr(-5), dateStr(5), 100, "active"],
  ["Expired Promo", "EXPIRED", "fixed", 15, 0, dateStr(-90), dateStr(-30), 100, "inactive"],
  ["Holiday Special", "HOLIDAY25", "percentage", 25, 150, dateStr(30), dateStr(60), 800, "active"],
  ["Referral Bonus", "REFER10", "fixed", 10, 0, dateStr(-20), dateStr(100), 300, "active"],
  ["Bundle Deal", "BUNDLE15", "percentage", 15, 120, dateStr(-8), dateStr(22), 400, "active"],
  ["Clearance", "CLEAR30", "percentage", 30, 60, dateStr(-40), dateStr(-2), 200, "inactive"],
];

const reviewDefs: [string, string, number, string, string][] = [
  ["Wireless Mouse", "Alice Johnson", 5, "Works great, very comfortable.", "approved"],
  ["Wireless Mouse", "Bob Smith", 4, "Good but battery life could be better.", "approved"],
  ["Mechanical Keyboard", "Carol White", 5, "Amazing tactile feel, love the RGB.", "approved"],
  ["Bluetooth Headphones", "David Brown", 5, "Noise cancelling is fantastic.", "approved"],
  ["Bluetooth Headphones", "Eve Davis", 3, "Sound is good but a bit heavy.", "approved"],
  ["4K Monitor", "Frank Miller", 5, "Crystal clear display, great value.", "approved"],
  ["Smart Watch", "Grace Wilson", 4, "Tracks my workouts accurately.", "approved"],
  ["Cotton T-Shirt", "Henry Moore", 5, "Soft and fits perfectly.", "approved"],
  ["Denim Jeans", "Ivy Taylor", 4, "Nice quality denim.", "approved"],
  ["Hoodie", "Jack Anderson", 5, "Super warm and cozy.", "approved"],
  ["Air Fryer", "Karen Thomas", 5, "Changed my cooking game.", "approved"],
  ["Coffee Maker", "Leo Jackson", 4, "Makes a solid cup of coffee.", "approved"],
  ["Blender", "Mia Harris", 3, "Works but is quite loud.", "pending"],
  ["Face Serum", "Nick Martin", 5, "My skin looks brighter already.", "approved"],
  ["Moisturizer", "Olivia Clark", 4, "Light and non-greasy.", "approved"],
  ["Yoga Mat", "Peter Lewis", 5, "Great grip, no slipping.", "approved"],
  ["Running Shoes", "Alice Johnson", 5, "So light and comfortable.", "approved"],
  ["Dumbbell Set", "Bob Smith", 4, "Easy to adjust, solid build.", "approved"],
  ["Water Bottle", "Carol White", 5, "Keeps water cold all day.", "approved"],
  ["Novel", "David Brown", 5, "Could not put it down.", "approved"],
  ["Cookbook", "Eve Davis", 4, "Easy recipes, delicious results.", "pending"],
  ["Building Blocks", "Frank Miller", 5, "My kids love it.", "approved"],
  ["Stuffed Bear", "Grace Wilson", 2, "Cute but smaller than expected.", "pending"],
  ["Dark Chocolate", "Henry Moore", 5, "Rich and smooth.", "approved"],
];

const contentDefs: [string, string, string, string, string | null, string][] = [
  ["About Us", "about-us", "page", "We are a small e-commerce company dedicated to quality products.", null, "published"],
  ["Shipping Policy", "shipping-policy", "page", "Free shipping on orders over $80. Delivery within 3-5 business days.", null, "published"],
  ["Return Policy", "return-policy", "page", "30-day hassle-free returns on all items.", null, "published"],
  ["Privacy Policy", "privacy-policy", "page", "Your privacy matters to us. We never sell your data.", null, "draft"],
  ["Summer Sale Banner", "summer-sale-banner", "banner", "Up to 50% off sitewide", "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a", "published"],
  ["New Arrivals Banner", "new-arrivals-banner", "banner", "Check out the latest products", "https://images.unsplash.com/photo-1441986300917-64674bd600d8", "published"],
  ["Free Shipping Banner", "free-shipping-banner", "banner", "Free shipping over $80", "https://images.unsplash.com/photo-1607082349566-187342175e2f", "published"],
  ["Holiday Banner", "holiday-banner", "banner", "Holiday gifts for everyone", null, "draft"],
];

const orderStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

async function main() {
  console.log("Initializing maxopc database...\n");

  console.log("[1/9] Ensuring tables exist...");
  for (const ddl of TABLE_DDL) await sql.unsafe(ddl);

  console.log("[2/9] Truncating existing data...");
  await sql.unsafe(
    "TRUNCATE TABLE audit_logs, reviews, content, promotions, order_items, orders, customers, skus, products, categories RESTART IDENTITY CASCADE"
  );

  console.log("[3/9] Inserting categories...");
  const C: Record<string, number> = {};
  for (let i = 0; i < catDefs.length; i++) {
    const [name, slug, desc] = catDefs[i];
    const [r] = await sql.unsafe<{ id: number }[]>(
      `INSERT INTO categories (name, slug, description, sort) VALUES ('${esc(name)}', '${esc(slug)}', '${esc(desc)}', ${i + 1}) RETURNING id`
    );
    C[name] = r.id;
  }

  console.log("[4/9] Inserting products...");
  const P: Record<string, number> = {};
  const prodRows: { id: number; name: string; price: number }[] = [];
  for (const [name, slug, desc, price, cat] of prodDefs) {
    const [r] = await sql.unsafe<{ id: number }[]>(
      `INSERT INTO products (name, slug, description, price, status, category_id) VALUES ('${esc(name)}', '${esc(slug)}', '${esc(desc)}', ${price}, 'active', ${C[cat]}) RETURNING id`
    );
    P[name] = r.id;
    prodRows.push({ id: r.id, name, price });
  }

  console.log("[5/9] Inserting SKUs (3 per product, first 10 products)...");
  const colors = ["black", "white", "silver"];
  for (let i = 0; i < 10; i++) {
    const p = prodRows[i];
    for (let c = 0; c < 3; c++) {
      const stock = 10 + ((i * 3 + c) * 7) % 90;
      await sql.unsafe(
        `INSERT INTO skus (product_id, sku_code, price, stock, attributes) VALUES (${p.id}, 'SKU-${p.id}-${c + 1}', ${p.price}, ${stock}, '{"color":"${colors[c]}"}'::jsonb)`
      );
    }
  }

  console.log("[6/9] Inserting customers...");
  for (const [name, email, phone, status] of customerDefs) {
    await sql.unsafe(
      `INSERT INTO customers (name, email, phone, status) VALUES ('${esc(name)}', '${esc(email)}', '${esc(phone)}', '${status}')`
    );
  }

  console.log("[7/9] Inserting orders + order items...");
  const customerCount = customerDefs.length;
  let orderCount = 0;
  let itemCount = 0;
  for (let i = 1; i <= 40; i++) {
    const status = orderStatuses[i % orderStatuses.length];
    const customerId = (i % customerCount) + 1;
    const numItems = 1 + (i % 3);
    const items: [number, string, number, number][] = [];
    let total = 0;
    for (let j = 0; j < numItems; j++) {
      const p = prodRows[(i + j * 7) % prodRows.length];
      const qty = 1 + ((i + j) % 3);
      items.push([p.id, p.name, qty, p.price]);
      total += p.price * qty;
    }
    const orderNo = `ORD-${1000 + i}`;
    const address = `${customerId} Market Street, City ${customerId}`;
    const [o] = await sql.unsafe<{ id: number }[]>(
      `INSERT INTO orders (order_no, customer_id, status, total, address) VALUES ('${orderNo}', ${customerId}, '${status}', ${total}, '${esc(address)}') RETURNING id`
    );
    orderCount++;
    for (const [pid, pname, qty, up] of items) {
      await sql.unsafe(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES (${o.id}, ${pid}, '${esc(pname)}', ${qty}, ${up})`
      );
      itemCount++;
    }
  }

  console.log("[8/9] Inserting promotions, reviews, content...");
  for (const [name, code, type, value, minSpend, startsAt, expiresAt, usageLimit, status] of promoDefs) {
    await sql.unsafe(
      `INSERT INTO promotions (name, code, type, value, min_spend, starts_at, expires_at, usage_limit, status) VALUES ('${esc(name)}', '${code}', '${type}', ${value}, ${minSpend}, '${startsAt}', '${expiresAt}', ${usageLimit}, '${status}')`
    );
  }
  for (const [product, customer, rating, content, status] of reviewDefs) {
    await sql.unsafe(
      `INSERT INTO reviews (product_id, customer_id, rating, content, status) VALUES (${P[product]}, (SELECT id FROM customers WHERE name = '${esc(customer)}' LIMIT 1), ${rating}, '${esc(content)}', '${status}')`
    );
  }
  for (const [title, slug, type, body, imageUrl, status] of contentDefs) {
    await sql.unsafe(
      `INSERT INTO content (title, slug, type, body, image_url, status) VALUES ('${esc(title)}', '${esc(slug)}', '${type}', '${esc(body)}', ${imageUrl ? `'${imageUrl}'` : "NULL"}, '${status}')`
    );
  }

  console.log("[9/9] Inserting audit logs...");
  for (let i = 1; i <= 25; i++) {
    const entity = ["product", "order", "category", "customer", "promotion"][i % 5];
    await sql.unsafe(
      `INSERT INTO audit_logs ("user", action, entity, entity_id, details) VALUES ('admin', 'create', '${entity}', ${i}, '{"seeded":true}'::jsonb)`
    );
  }

  const stats = await sql.unsafe<{ c: string; v: string }[]>(
    `SELECT 'categories' c, COUNT(*)::text v FROM categories UNION ALL
     SELECT 'products', COUNT(*)::text FROM products UNION ALL
     SELECT 'skus', COUNT(*)::text FROM skus UNION ALL
     SELECT 'customers', COUNT(*)::text FROM customers UNION ALL
     SELECT 'orders', COUNT(*)::text FROM orders UNION ALL
     SELECT 'order_items', COUNT(*)::text FROM order_items UNION ALL
     SELECT 'promotions', COUNT(*)::text FROM promotions UNION ALL
     SELECT 'reviews', COUNT(*)::text FROM reviews UNION ALL
     SELECT 'content', COUNT(*)::text FROM content UNION ALL
     SELECT 'audit_logs', COUNT(*)::text FROM audit_logs`
  );

  console.log("\n=== Seed complete ===");
  for (const s of stats) console.log(`  ${s.c.padEnd(14)} ${s.v}`);

  await sql.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
