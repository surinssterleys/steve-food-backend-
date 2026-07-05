const express = require("express");
const { nanoid } = require("nanoid");
const db = require("../db");

const router = express.Router();

function genOrderId() {
  return "SF" + Math.floor(10000 + Math.random() * 90000);
}

function serializeOrder(orderId) {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!order) return null;
  const items = db.prepare("SELECT name, price, qty FROM order_items WHERE order_id = ?").all(orderId);
  const restaurant = db.prepare("SELECT id, name, cover FROM restaurants WHERE id = ?").get(order.restaurant_id);
  const driver = order.driver_id
    ? db.prepare("SELECT id, name, phone FROM drivers WHERE id = ?").get(order.driver_id)
    : null;
  return { ...order, items, restaurant, driver };
}

module.exports = (io) => {
  router.post("/", (req, res) => {
    const { restaurantId, items, customerName, customerPhone, address, paymentMethod, paymentReference } = req.body;

    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "restaurantId ak items obligatwa" });
    }
    if (!["moncash", "natcash", "cash"].includes(paymentMethod)) {
      return res.status(400).json({ error: "paymentMethod envalid" });
    }

    const restaurant = db.prepare("SELECT * FROM restaurants WHERE id = ?").get(restaurantId);
    if (!restaurant) return res.status(404).json({ error: "Restoran pa jwenn" });

    const priceStmt = db.prepare("SELECT id, name, price FROM menu_items WHERE id = ? AND restaurant_id = ?");
    let subtotal = 0;
    const resolvedItems = [];
    for (const it of items) {
      const menuItem = priceStmt.get(it.id, restaurantId);
      if (!menuItem) return res.status(400).json({ error: `Atik ${it.id} pa fè pati meni ${restaurantId}` });
      const qty = Math.max(1, parseInt(it.qty, 10) || 1);
      subtotal += menuItem.price * qty;
      resolvedItems.push({ menu_item_id: menuItem.id, name: menuItem.name, price: menuItem.price, qty });
    }

    const fee = restaurant.fee;
    const total = subtotal + fee;
    const orderId = genOrderId();

    const insertOrder = db.prepare(`
      INSERT INTO orders (id, restaurant_id, customer_name, customer_phone, address, payment_method, payment_reference, subtotal, fee, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'konfime')
    `);
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, name, price, qty) VALUES (?, ?, ?, ?, ?)
    `);

    const tx = db.transaction(() => {
      insertOrder.run(orderId, restaurantId, customerName || null, customerPhone || null, address || null, paymentMethod, paymentReference || null, subtotal, fee, total);
      resolvedItems.forEach((it) => insertItem.run(orderId, it.menu_item_id, it.name, it.price, it.qty));
    });
    tx();

    const fullOrder = serializeOrder(orderId);

    io.to("admin").emit("new-order", fullOrder);

    res.status(201).json(fullOrder);
  });

  router.get("/:id", (req, res) => {
    const order = serializeOrder(req.params.id);
    if (!order) return res.status(404).json({ error: "Kòmand pa jwenn" });
    res.json(order);
  });

  router.patch("/:id/status", (req, res) => {
    const { status, driverId, paymentConfirmed } = req.body;
    const validStatuses = ["konfime", "preparasyon", "pran", "annwout", "livre", "anile"];

    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    if (!order) return res.status(404).json({ error: "Kòmand pa jwenn" });

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Estati envalid" });
    }

    db.prepare(`
      UPDATE orders SET
        status = COALESCE(?, status),
        driver_id = COALESCE(?, driver_id),
        payment_confirmed = COALESCE(?, payment_confirmed),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status || null, driverId || null, paymentConfirmed === undefined ? null : (paymentConfirmed ? 1 : 0), req.params.id);

    const updated = serializeOrder(req.params.id);

    io.to(`order:${req.params.id}`).emit("order-updated", updated);
    io.to("admin").emit("order-updated", updated);

    res.json(updated);
  });

  router.get("/", (req, res) => {
    const { status } = req.query;
    let orders;
    if (status) {
      orders = db.prepare("SELECT id FROM orders WHERE status = ? ORDER BY created_at DESC").all(status);
    } else {
      orders = db.prepare("SELECT id FROM orders ORDER BY created_at DESC").all();
    }
    res.json(orders.map((o) => serializeOrder(o.id)));
  });

  return router;
};
