// ═══════════════════════════════════════════════════════════════
// FILE: sendOrderEmail.ts
// PURPOSE: Sends a beautiful HTML email notification to the store
//          owner whenever a new order is placed. Uses Nodemailer
//          with Gmail SMTP and Google App Password.
// LOCATION: src/lib/sendOrderEmail.ts
// ═══════════════════════════════════════════════════════════════

import nodemailer from "nodemailer";

// ─── Types ─────────────────────────────────────────────────────

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
    lineTotal: number;
}

interface OrderEmailData {
    orderId: string;
    username: string;
    edition: string;
    utrNumber: string;
    items: OrderItem[];
    total: number;
}

// ─── Gmail SMTP Transport ──────────────────────────────────────

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// ─── Send Order Notification ───────────────────────────────────

export async function sendOrderEmail(order: OrderEmailData) {
    const itemRows = order.items
        .map(
            (item) =>
                `<tr>
                    <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#ccc;font-size:14px;">${item.name}</td>
                    <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#ccc;font-size:14px;text-align:center;">×${item.quantity}</td>
                    <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#00ff88;font-size:14px;text-align:right;">₹${item.lineTotal.toFixed(2)}</td>
                </tr>`
        )
        .join("");

    const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:500px;margin:0 auto;background:#1a1a2e;border-radius:16px;overflow:hidden;border:1px solid #2a2a3e;">
        
        // Header -->
        <div style="background:linear-gradient(135deg,#0f3460,#16213e);padding:24px;text-align:center;">
            <h1 style="margin:0;color:#00ff88;font-size:22px;letter-spacing:1px;">⚔️ New Order Received</h1>
            <p style="margin:6px 0 0;color:#888;font-size:12px;">Arelix Developments</p>
        </div>

        <!-- Order Info -->
        <div style="padding:20px 24px;">
            
            <!-- Order ID -->
            <div style="background:#16213e;border-radius:10px;padding:14px;margin-bottom:16px;border:1px solid #2a2a3e;">
                <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Order ID</p>
                <p style="margin:4px 0 0;color:#00ff88;font-size:16px;font-weight:bold;font-family:monospace;">${order.orderId}</p>
            </div>

            <!-- Player Details -->
            <div style="display:flex;gap:12px;margin-bottom:16px;">
                <div style="flex:1;background:#16213e;border-radius:10px;padding:14px;border:1px solid #2a2a3e;">
                    <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Player</p>
                    <p style="margin:4px 0 0;color:#fff;font-size:15px;font-weight:bold;font-family:monospace;">${order.username}</p>
                </div>
                <div style="flex:1;background:#16213e;border-radius:10px;padding:14px;border:1px solid #2a2a3e;">
                    <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Edition</p>
                    <p style="margin:4px 0 0;color:#a78bfa;font-size:15px;font-weight:bold;text-transform:capitalize;">${order.edition}</p>
                </div>
            </div>

            <!-- UTR -->
            <div style="background:#16213e;border-radius:10px;padding:14px;margin-bottom:16px;border:1px solid #2a2a3e;">
                <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">UTR / Transaction ID</p>
                <p style="margin:4px 0 0;color:#fbbf24;font-size:18px;font-weight:bold;font-family:monospace;letter-spacing:2px;">${order.utrNumber}</p>
            </div>

            <!-- Items Table -->
            <table style="width:100%;border-collapse:collapse;background:#16213e;border-radius:10px;overflow:hidden;border:1px solid #2a2a3e;">
                <thead>
                    <tr style="background:#0f3460;">
                        <th style="padding:10px 12px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Item</th>
                        <th style="padding:10px 12px;text-align:center;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                        <th style="padding:10px 12px;text-align:right;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemRows}
                </tbody>
            </table>

            <!-- Total -->
            <div style="margin-top:16px;background:linear-gradient(135deg,#064e3b,#065f46);border-radius:10px;padding:16px;text-align:center;border:1px solid #00ff8833;">
                <p style="margin:0;color:#6ee7b7;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Total Amount</p>
                <p style="margin:4px 0 0;color:#00ff88;font-size:28px;font-weight:900;">₹${order.total.toFixed(2)}</p>
            </div>
        </div>

        <!-- Footer -->
        <div style="padding:16px 24px;text-align:center;border-top:1px solid #2a2a3e;">
            <p style="margin:0;color:#555;font-size:11px;">Verify the UTR in your UPI app and deliver items in-game.</p>
        </div>
    </div>
    `;

    const mailOptions = {
        from: `"⚔️ Arelix Developments" <${process.env.GMAIL_USER}>`,
        to: process.env.NOTIFY_EMAIL,
        subject: `📦 New Order — ${order.username} — ₹${order.total.toFixed(2)}`,
        html,
    };

    await transporter.sendMail(mailOptions);
}
