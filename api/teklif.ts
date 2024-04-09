import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

const handler = async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    req.headers.origin || "https://www.labor.com.tr"
  );
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    tls: { rejectUnauthorized: false },
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let cartItems = req.body?.cart
    ? Object.values(req.body.cart)
        .map((item: any, index) => {
          return `<tr>
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price}</td>
      <td>${item.tax}</td>
      <td>${item.sku}</td>
    </tr>`;
        })
        .join("")
    : "";

  let mailOptions = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    subject: "Teklif Sepeti",
    html: `
    <h1>Teklif Talebi</h1>
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid black;
        padding: 10px;
        text-align: left;
      }
    </style>
    <table>
      <tr>
        <th>No</th>
        <th>Ürün</th>
        <th>Adet</th>
        <th>Fiyat</th>
        <th>KDV</th>
        <th>Stok Kodu</th>
      </tr>
      ${cartItems}
    </table>
    <br/>
    <p>Email: ${req.body.email}</p>
    <p>İsim: ${req.body.name}</p>
    <p>Firma: ${req.body.firm}</p>
    <p>Vergi No: ${req.body.tax_number}</p>
    <p>Tel.No: ${req.body.phone}</p>
    <p>Diğer Ürünler: ${req.body.other_products}</p>
    <p>Para Birimi: ${req.body.currency}</p>
    <p>Not: ${req.body.note}</p>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send("success");
  } catch (error) {
    console.error(error);
    res.send("error");
  }
};

module.exports = handler;
