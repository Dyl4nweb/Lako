import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "LAKO Marketplace <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface OrderReceiptEmailProps {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  orderId: string;
  deliveryAddress: string;
  customerPhone: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

/**
 * Send a branded LAKO Cash on Delivery order confirmation receipt via Resend
 */
export async function sendOrderReceiptEmail(props: OrderReceiptEmailProps) {
  if (!resend) {
    console.warn("[Resend] Skipped sending email: RESEND_API_KEY is not defined.");
    return { success: false, error: "RESEND_API_KEY is not set." };
  }

  const {
    toEmail,
    customerName,
    orderNumber,
    orderId,
    deliveryAddress,
    customerPhone,
    items,
    subtotal,
    deliveryFee,
    total,
  } = props;

  const trackingUrl = `${APP_URL}/orders/${orderId}`;

  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f0ece6;">
        <td style="padding: 12px 0; font-size: 13px; color: #242424; font-weight: bold;">
          ${item.productName}
          <div style="font-size: 11px; color: #737373; font-weight: normal;">Qty: ${item.quantity} × ₱${item.unitPrice.toFixed(2)}</div>
        </td>
        <td style="padding: 12px 0; text-align: right; font-size: 13px; font-weight: bold; color: #242424;">
          ₱${item.lineTotal.toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>LAKO Order Confirmation - ${orderNumber}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF6EA; margin: 0; padding: 24px; color: #242424;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f0e6d8;">
        
        <!-- Header -->
        <div style="background-color: #FF7A1A; padding: 28px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">LAKO</h1>
          <p style="color: #FFF6EA; margin: 4px 0 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px;">Local Marketplace & Fast Delivery</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: bold;">
              ✓ Order Confirmed (Cash on Delivery)
            </div>
            <h2 style="margin: 12px 0 4px; font-size: 20px; font-weight: 800; color: #242424;">Salamat, ${customerName}!</h2>
            <p style="margin: 0; font-size: 13px; color: #737373;">Inihahanda na ng aming local dispatch team ang iyong order.</p>
          </div>

          <!-- Order Summary Card -->
          <div style="background-color: #faf9f6; border: 1px solid #eee7dd; border-radius: 16px; padding: 18px 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
              <span style="color: #737373;">Order Number:</span>
              <strong style="color: #FF7A1A; font-family: monospace;">${orderNumber}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
              <span style="color: #737373;">Delivery Address:</span>
              <strong style="color: #242424; text-align: right; max-width: 65%;">${deliveryAddress}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: #737373;">Contact:</span>
              <strong style="color: #242424;">${customerPhone}</strong>
            </div>
          </div>

          <!-- Items Table -->
          <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #525252; margin: 0 0 8px; border-bottom: 2px solid #242424; padding-bottom: 6px;">
            Ordered Items
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Financial Breakdown -->
          <div style="border-top: 1px solid #e5e5e5; padding-top: 12px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #525252; margin-bottom: 6px;">
              <span>Subtotal</span>
              <span>₱${subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #525252; margin-bottom: 10px;">
              <span>Local Delivery Fee</span>
              <span>₱${deliveryFee.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #242424; border-top: 2px dashed #f0ece6; padding-top: 10px;">
              <span>Total COD to Pay</span>
              <span style="color: #FF7A1A;">₱${total.toFixed(2)}</span>
            </div>
            <p style="font-size: 11px; color: #a3a3a3; margin: 6px 0 0; text-align: right;">Ihanda lamang ang eksaktong halaga sa darating na rider.</p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 28px 0 12px;">
            <a href="${trackingUrl}" style="display: inline-block; background-color: #FF7A1A; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 12px rgba(255, 122, 26, 0.35);">
              Track Live Order Status &rarr;
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #242424; padding: 18px 24px; text-align: center; color: #a3a3a3; font-size: 11px;">
          <p style="margin: 0 0 4px; color: #ffffff; font-weight: bold;">LAKO • Local Marketplace & Express Delivery</p>
          <p style="margin: 0;">Lokal na paninda, hatid sa inyong pintuan.</p>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Order Confirmed: ${orderNumber} - LAKO Marketplace`,
      html: htmlContent,
    });

    if (error) {
      console.error("[Resend] Error sending order receipt:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Resend] Successfully sent order receipt to ${toEmail} (ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Resend] Exception sending email:", err);
    return { success: false, error: (err as Error)?.message };
  }
}
