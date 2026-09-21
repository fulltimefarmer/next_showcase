import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { TABLE_DDL } from "./ddl";
import { hashPassword } from "../auth/password";

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

const sql = postgres(DATABASE_URL, { max: 1, onnotice: () => {} });

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
  ["Books", "books", "Books and reading"],
  ["Toys", "toys", "Toys and games for kids"],
];

type SkuSpec = {
  skuId: string;
  price: number;
  attributes: Record<string, string>;
  imageKeyword: string;
};

type ProdSpec = {
  name: string;
  slug: string;
  desc: string;
  cat: string;
  imageKeyword: string;
  skus: SkuSpec[];
};

const prodDefs: ProdSpec[] = [
  {
    name: "Wireless Mouse", slug: "wireless-mouse",
    desc: "A sleek, ergonomic wireless mouse with a 1600 DPI optical sensor and quiet clicks. Connects instantly via a 2.4GHz USB receiver and lasts up to 12 months on a single AA battery.",
    cat: "Electronics", imageKeyword: "mouse",
    skus: [
      { skuId: "BLACK", price: 25, attributes: { label: "Black", color: "black" }, imageKeyword: "black,mouse" },
      { skuId: "WHITE", price: 25, attributes: { label: "White", color: "white" }, imageKeyword: "white,mouse" },
      { skuId: "PINK", price: 27, attributes: { label: "Pink", color: "pink" }, imageKeyword: "pink,mouse" },
    ],
  },
  {
    name: "Mechanical Keyboard", slug: "mechanical-keyboard",
    desc: "A full-size mechanical keyboard with RGB backlighting and hot-swappable switches. Features a durable aluminum frame and anti-ghosting keys for a responsive, tactile typing experience.",
    cat: "Electronics", imageKeyword: "keyboard",
    skus: [
      { skuId: "BLUE", price: 89, attributes: { label: "Blue Switch", switch: "blue" }, imageKeyword: "blue,keyboard" },
      { skuId: "RED", price: 89, attributes: { label: "Red Switch", switch: "red" }, imageKeyword: "red,keyboard" },
      { skuId: "BROWN", price: 92, attributes: { label: "Brown Switch", switch: "brown" }, imageKeyword: "brown,keyboard" },
    ],
  },
  {
    name: "Bluetooth Headphones", slug: "bluetooth-headphones",
    desc: "Over-ear Bluetooth headphones with active noise cancelling and a 40-hour battery life. Enjoy deep bass, crystal-clear calls and a comfortable cushioned fit for all-day listening.",
    cat: "Electronics", imageKeyword: "headphones",
    skus: [
      { skuId: "BLACK", price: 129, attributes: { label: "Black", color: "black" }, imageKeyword: "black,headphones" },
      { skuId: "SILVER", price: 129, attributes: { label: "Silver", color: "silver" }, imageKeyword: "silver,headphones" },
      { skuId: "ROSE", price: 135, attributes: { label: "Rose Gold", color: "rose gold" }, imageKeyword: "rose,headphones" },
    ],
  },
  {
    name: "Smart Watch", slug: "smart-watch",
    desc: "A fitness tracking smart watch with heart-rate monitoring, GPS and a bright AMOLED display. Track your workouts, sleep and notifications with up to 7 days of battery life.",
    cat: "Electronics", imageKeyword: "smartwatch",
    skus: [
      { skuId: "40MM", price: 199, attributes: { label: "40mm", size: "40mm" }, imageKeyword: "smartwatch" },
      { skuId: "44MM", price: 219, attributes: { label: "44mm", size: "44mm" }, imageKeyword: "smartwatch" },
    ],
  },
  {
    name: "Cotton T-Shirt", slug: "cotton-t-shirt",
    desc: "A classic crew-neck t-shirt made from 100% combed cotton for a soft, breathable feel. Pre-shrunk and available in a range of colors for comfortable everyday wear.",
    cat: "Clothing", imageKeyword: "tshirt",
    skus: [
      { skuId: "WHITE", price: 15, attributes: { label: "White", color: "white" }, imageKeyword: "white,tshirt" },
      { skuId: "BLACK", price: 15, attributes: { label: "Black", color: "black" }, imageKeyword: "black,tshirt" },
      { skuId: "NAVY", price: 16, attributes: { label: "Navy", color: "navy" }, imageKeyword: "blue,tshirt" },
    ],
  },
  {
    name: "Denim Jeans", slug: "denim-jeans",
    desc: "Classic slim-fit denim jeans crafted from stretch denim for comfort and mobility. Five-pocket styling with a mid-rise waist and a modern, tapered leg.",
    cat: "Clothing", imageKeyword: "jeans",
    skus: [
      { skuId: "BLUE", price: 49, attributes: { label: "Classic Blue", color: "blue" }, imageKeyword: "blue,jeans" },
      { skuId: "BLACK", price: 49, attributes: { label: "Black", color: "black" }, imageKeyword: "black,jeans" },
      { skuId: "GREY", price: 52, attributes: { label: "Grey", color: "grey" }, imageKeyword: "grey,jeans" },
    ],
  },
  {
    name: "Hoodie", slug: "hoodie",
    desc: "A warm fleece-lined hoodie with a roomy front pocket and an adjustable drawstring hood. The soft brushed interior keeps you cozy whether lounging or on the go.",
    cat: "Clothing", imageKeyword: "hoodie",
    skus: [
      { skuId: "WOMENS", price: 39, attributes: { label: "Women's", style: "womens" }, imageKeyword: "women,hoodie" },
      { skuId: "MENS", price: 39, attributes: { label: "Men's", style: "mens" }, imageKeyword: "men,hoodie" },
    ],
  },
  {
    name: "Sneakers", slug: "sneakers",
    desc: "Lightweight running sneakers with a breathable mesh upper and a cushioned sole. Designed for comfort and support during runs, walks and all-day wear.",
    cat: "Clothing", imageKeyword: "sneakers",
    skus: [
      { skuId: "WHITE", price: 75, attributes: { label: "White", color: "white" }, imageKeyword: "white,sneakers" },
      { skuId: "BLACK", price: 75, attributes: { label: "Black", color: "black" }, imageKeyword: "black,sneakers" },
      { skuId: "RED", price: 79, attributes: { label: "Red", color: "red" }, imageKeyword: "red,sneakers" },
    ],
  },
  {
    name: "Science Fiction Novel", slug: "sci-fi-novel",
    desc: "A bestselling science fiction novel that follows a reluctant hero across a crumbling interstellar empire. Packed with vivid world-building, intrigue and unforgettable characters.",
    cat: "Books", imageKeyword: "book",
    skus: [
      { skuId: "PAPERBACK", price: 12, attributes: { label: "Paperback", format: "paperback" }, imageKeyword: "paperback,book" },
      { skuId: "HARDCOVER", price: 22, attributes: { label: "Hardcover", format: "hardcover" }, imageKeyword: "hardcover,book" },
      { skuId: "EBOOK", price: 8, attributes: { label: "E-book", format: "ebook" }, imageKeyword: "ebook,reader" },
    ],
  },
  {
    name: "Cookbook", slug: "cookbook",
    desc: "A practical cookbook packed with quick and easy recipes for busy weeknights. Each dish uses simple ingredients and takes under 30 minutes from pan to plate.",
    cat: "Books", imageKeyword: "cookbook",
    skus: [
      { skuId: "PAPERBACK", price: 24, attributes: { label: "Paperback", format: "paperback" }, imageKeyword: "cookbook" },
      { skuId: "HARDCOVER", price: 34, attributes: { label: "Hardcover", format: "hardcover" }, imageKeyword: "cookbook" },
    ],
  },
  {
    name: "Children's Picture Book", slug: "childrens-picture-book",
    desc: "A colorful picture book that takes young readers on a magical adventure. With playful rhymes and vibrant illustrations, it's perfect for bedtime reading.",
    cat: "Books", imageKeyword: "children,book",
    skus: [
      { skuId: "HARDCOVER", price: 10, attributes: { label: "Hardcover", format: "hardcover" }, imageKeyword: "children,book" },
      { skuId: "BOARD", price: 13, attributes: { label: "Board Book", format: "board book" }, imageKeyword: "children,book" },
    ],
  },
  {
    name: "Building Blocks", slug: "building-blocks",
    desc: "A creative building blocks set with hundreds of colorful pieces to spark imagination. Compatible with major brands and ideal for developing fine motor skills.",
    cat: "Toys", imageKeyword: "lego",
    skus: [
      { skuId: "CLASSIC", price: 35, attributes: { label: "Classic Set", set: "classic" }, imageKeyword: "lego" },
      { skuId: "DELUXE", price: 55, attributes: { label: "Deluxe Set", set: "deluxe" }, imageKeyword: "lego" },
    ],
  },
  {
    name: "Stuffed Bear", slug: "stuffed-bear",
    desc: "A soft, plush teddy bear made from premium cuddly fabric. A timeless companion for kids, great for hugs, bedtime and imaginative play.",
    cat: "Toys", imageKeyword: "teddy,bear",
    skus: [
      { skuId: "BROWN", price: 16, attributes: { label: "Brown", color: "brown" }, imageKeyword: "brown,teddy" },
      { skuId: "PINK", price: 16, attributes: { label: "Pink", color: "pink" }, imageKeyword: "pink,teddy" },
      { skuId: "WHITE", price: 18, attributes: { label: "White", color: "white" }, imageKeyword: "white,teddy" },
    ],
  },
  {
    name: "Toy Car", slug: "toy-car",
    desc: "A durable die-cast toy car with realistic details and smooth-rolling wheels. Built to withstand hours of imaginative play for young car enthusiasts.",
    cat: "Toys", imageKeyword: "toy,car",
    skus: [
      { skuId: "RED", price: 20, attributes: { label: "Red", color: "red" }, imageKeyword: "red,toy,car" },
      { skuId: "BLUE", price: 20, attributes: { label: "Blue", color: "blue" }, imageKeyword: "blue,toy,car" },
      { skuId: "GREEN", price: 20, attributes: { label: "Green", color: "green" }, imageKeyword: "green,toy,car" },
    ],
  },
  {
    name: "Jigsaw Puzzle", slug: "jigsaw-puzzle",
    desc: "A 1000-piece jigsaw puzzle featuring a vibrant, detailed scene. Made from thick, glare-free board for a satisfying and relaxing puzzling experience.",
    cat: "Toys", imageKeyword: "puzzle",
    skus: [
      { skuId: "500", price: 18, attributes: { label: "500 Pieces", pieces: "500" }, imageKeyword: "puzzle" },
      { skuId: "1000", price: 28, attributes: { label: "1000 Pieces", pieces: "1000" }, imageKeyword: "puzzle" },
    ],
  },
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

const accountDefs: [string, string, boolean][] = [
  ["root", "root@example.com", true],
  ["demo", "demo@example.com", false],
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
  ["Mechanical Keyboard", "Carol White", 5, "Amazing tactile feel, love the RGB.", "approved"],
  ["Bluetooth Headphones", "David Brown", 5, "Noise cancelling is fantastic.", "approved"],
  ["Smart Watch", "Grace Wilson", 4, "Tracks my workouts accurately.", "approved"],
  ["Cotton T-Shirt", "Henry Moore", 5, "Soft and fits perfectly.", "approved"],
  ["Denim Jeans", "Ivy Taylor", 4, "Nice quality denim.", "approved"],
  ["Hoodie", "Jack Anderson", 5, "Super warm and cozy.", "approved"],
  ["Sneakers", "Eve Davis", 4, "Light and comfortable.", "approved"],
  ["Science Fiction Novel", "David Brown", 5, "Could not put it down.", "approved"],
  ["Cookbook", "Eve Davis", 4, "Easy recipes, delicious results.", "pending"],
  ["Children's Picture Book", "Frank Miller", 5, "My kids love it.", "approved"],
  ["Building Blocks", "Frank Miller", 5, "My kids love it.", "approved"],
  ["Stuffed Bear", "Grace Wilson", 2, "Cute but smaller than expected.", "pending"],
  ["Toy Car", "Bob Smith", 4, "Sturdy and fun.", "approved"],
  ["Jigsaw Puzzle", "Alice Johnson", 5, "Challenging and fun.", "approved"],
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
    "TRUNCATE TABLE sessions, accounts, audit_logs, reviews, content, promotions, order_items, orders, customers, skus, products, categories RESTART IDENTITY CASCADE"
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
  const prodRows: { id: number; name: string; price: number; imageUrl: string }[] = [];
  for (let i = 0; i < prodDefs.length; i++) {
    const prod = prodDefs[i];
    const productId = `P-${1001 + i}`;
    const imageUrl = `https://loremflickr.com/400/400/${prod.imageKeyword}`;
    const [r] = await sql.unsafe<{ id: number }[]>(
      `INSERT INTO products (product_id, name, slug, description, image_url, status, category_id) VALUES ('${productId}', '${esc(prod.name)}', '${esc(prod.slug)}', '${esc(prod.desc)}', '${imageUrl}', 'active', ${C[prod.cat]}) RETURNING id`
    );
    P[prod.name] = r.id;
    const minPrice = prod.skus.length
      ? Math.min(...prod.skus.map((s) => s.price))
      : 0;
    prodRows.push({ id: r.id, name: prod.name, price: minPrice, imageUrl });
  }

  console.log("[5/9] Inserting SKUs...");
  for (let i = 0; i < prodDefs.length; i++) {
    const prod = prodDefs[i];
    const p = prodRows[i];
    for (const sku of prod.skus) {
      const stock = 5 + Math.floor(Math.random() * 90);
      const imageUrl = `https://loremflickr.com/400/400/${sku.imageKeyword}`;
      await sql.unsafe(
        `INSERT INTO skus (product_id, sku_id, price, stock, attributes, image_url) VALUES (${p.id}, '${esc(sku.skuId)}', ${sku.price}, ${stock}, '${esc(JSON.stringify(sku.attributes))}'::jsonb, '${imageUrl}')`
      );
    }
  }

  console.log("[6/9] Inserting customers and accounts...");
  for (const [name, email, phone, status] of customerDefs) {
    await sql.unsafe(
      `INSERT INTO customers (name, email, phone, status) VALUES ('${esc(name)}', '${esc(email)}', '${esc(phone)}', '${status}')`
    );
  }
  const passwordHash = hashPassword("1234");
  for (const [username, email, isAdmin] of accountDefs) {
    await sql.unsafe(
      `INSERT INTO accounts (username, email, password_hash, is_admin) VALUES ('${esc(username)}', '${esc(email)}', '${passwordHash}', ${isAdmin})`
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
     SELECT 'accounts', COUNT(*)::text FROM accounts UNION ALL
     SELECT 'sessions', COUNT(*)::text FROM sessions UNION ALL
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
