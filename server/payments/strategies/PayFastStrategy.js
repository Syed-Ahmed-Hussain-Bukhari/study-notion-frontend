const crypto = require("crypto");
const IPaymentStrategy = require("./IPaymentStrategy");

class PayFastStrategy extends IPaymentStrategy {
  async createCheckout(courses, userId, userEmail, totalAmount, courseDetails = []) {
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
    const merchantId = String(process.env.PAYFAST_MERCHANT_ID || "").trim();
    const merchantKey = String(process.env.PAYFAST_MERCHANT_KEY || "").trim();
    console.log("[PayFast] Debug Credentials:", { merchantId, merchantKey });

    if (!merchantId || !merchantKey) {
      throw new Error(
        "PayFast merchant credentials are missing. Set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY in .env"
      );
    }

    const amount = Number(totalAmount).toFixed(2);
    const mPaymentId = `${userId.slice(-6)}${Date.now()}`;
    const useSandbox =
      String(process.env.PAYFAST_SANDBOX || "").toLowerCase() === "true" ||
      merchantId === "10004002";
    const processUrl = useSandbox
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";

    const courseLabel = "CoursePurchase";
    const courseDesc = `Purchase_${courses.length}_courses`;

    const notifyUrl =
      process.env.PAYFAST_NOTIFY_URL ||
      `${BACKEND_URL}/api/v1/payment/webhook/payfast`;

    // Absolute minimum fields in official order
    const fullPayload = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${FRONTEND_URL}/payment-success`,
      cancel_url: `${FRONTEND_URL}/dashboard/cart`,
      notify_url: notifyUrl,
      m_payment_id: mPaymentId,
      amount,
      item_name: "CoursePurchase",
      custom_str1: userId,
      custom_str2: Array.isArray(courses) ? courses.join(",") : courses,
    };

    const payloadWithSignature = {
      ...fullPayload,
      signature: this._generateSignature(fullPayload),
    };

    // Build query string preserving the order above
    const checkoutUrl = `${processUrl}?${this._buildQueryString(payloadWithSignature)}`;

    return { checkoutUrl, sessionId: mPaymentId };
  }

  verifyWebhook(rawBody, signature) {
    const event = rawBody || {};
    const receivedSignature = signature || event.signature;

    if (!receivedSignature) {
      throw new Error("Missing PayFast signature");
    }

    // Exclude merchant_key and signature from verification payload (PayFast spec)
    const { signature: _sig, merchant_key: _mk, ...payloadWithoutSignature } = event;
    const generatedSignatures = this._generateAllSignatures(payloadWithoutSignature);
    if (!generatedSignatures.includes(receivedSignature)) {
      throw new Error("Invalid PayFast webhook signature");
    }

    const status =
      event.payment_status || event.paymentStatus || event.payment_status_code;

    if (status !== "COMPLETE") {
      return { event, userId: null, courses: null };
    }

    const userId = event.custom_str1 || null;
    let courses = [];
    try {
      const rawCourses = event.custom_str2 || "";
      // Handle both JSON (legacy) and comma-separated formats
      if (rawCourses.startsWith("[")) {
        courses = JSON.parse(rawCourses);
      } else {
        courses = rawCourses.split(",").filter(Boolean);
      }
    } catch (e) {
      console.error("Failed to parse courses from custom_str2:", e);
    }

    return { event, userId, courses };
  }

  /**
   * Generate the PayFast MD5 signature.
   * PayFast spec: alphabetically sorted keys (excluding merchant_key & signature)
   * + optional passphrase appended.
   */
  _generateSignature(data) {
    const passphrase = String(process.env.PAYFAST_PASSPHRASE || "").trim();
    // Use insertion order for initiation (matches official docs order)
    return this._signWithVariant(data, { sortKeys: false, passphrase });
  }

  /**
   * Generate multiple signature candidates for webhook verification.
   * Tries both sort orders and passphrase variants to handle edge cases.
   */
  _generateAllSignatures(data) {
    const envPassphrase = String(process.env.PAYFAST_PASSPHRASE || "").trim();
    const sortCandidates = [true, false];
    const passphraseCandidates = envPassphrase ? [envPassphrase, ""] : [""];

    const signatures = [];
    for (const shouldSort of sortCandidates) {
      for (const candidate of passphraseCandidates) {
        signatures.push(
          this._signWithVariant(data, {
            sortKeys: shouldSort,
            passphrase: candidate,
          })
        );
      }
    }

    return [...new Set(signatures)];
  }

  _signWithVariant(data, options = {}) {
    const sortKeys = options.sortKeys === true;
    const passphrase = String(options.passphrase || "").trim();

    const entries = Object.entries(data).filter(
      ([, value]) => value !== undefined && value !== null && `${value}` !== ""
    );

    const cleanData = sortKeys
      ? [...entries].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      : entries;

    if (process.env.NODE_ENV !== "production") {
      console.log("[PayFast] Signing Data:", cleanData);
    }

    const encoded = cleanData
      .map(([key, value]) => {
        const val = String(value);
        // PayFast expects standard RFC 3986 encoding, but with spaces as '+'
        // and some characters might need to be escaped specifically.
        // However, standard encodeURIComponent + %20->+ is usually what they want.
        return `${key}=${encodeURIComponent(val).replace(/%20/g, "+")}`;
      })
      .join("&");

    const finalString = passphrase
      ? `${encoded}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
      : encoded;

    if (process.env.NODE_ENV !== "production") {
      console.log("[PayFast] Signature Base String:", finalString);
    }
    return crypto.createHash("md5").update(finalString).digest("hex");
  }

  /**
   * Build the URL query string preserving insertion order (no sort).
   * Signature is already appended at the end of fullPayload.
   */
  _buildQueryString(data) {
    // Preserve insertion order (no sort) for initiation
    const entries = Object.entries(data).filter(
      ([, value]) => value !== undefined && value !== null && `${value}` !== ""
    );

    return entries
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value)).replace(
            /%20/g,
            "+"
          )}`
      )
      .join("&");
  }
}

module.exports = PayFastStrategy;
