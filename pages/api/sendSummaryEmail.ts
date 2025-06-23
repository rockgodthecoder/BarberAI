import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uploadedImage, finalSelection, assumptions, feedback } = req.body;
  const emailTo = process.env.SUMMARY_EMAIL_TO;
  const emailFrom = process.env.SUMMARY_EMAIL_FROM || emailTo;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!emailTo || !smtpHost || !smtpUser || !smtpPass) {
    return res.status(500).json({ error: 'Email environment variables not set' });
  }

  // Prepare attachments and cids
  const attachments = [];
  let uploadedImageHtml = '<em>No photo provided</em>';
  let aiImageHtml = '<em>No AI image</em>';
  let selectedStyleHtml = '<em>No style image</em>';

  // Attach uploaded image if present
  if (uploadedImage && uploadedImage.startsWith('data:image/')) {
    const match = uploadedImage.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      attachments.push({
        filename: 'uploaded-photo.png',
        content: Buffer.from(match[2], 'base64'),
        cid: 'uploadedphoto@barberapp'
      });
      uploadedImageHtml = `<img src="cid:uploadedphoto@barberapp" alt="User Photo" style="max-width:180px; border-radius:10px; border:1px solid #ccc;" />`;
    }
  }

  // Attach AI-generated image if present (optional, if you have this field)
  const aiGeneratedImage = req.body.aiGeneratedImage;
  if (aiGeneratedImage && aiGeneratedImage.startsWith('data:image/')) {
    const match = aiGeneratedImage.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      attachments.push({
        filename: 'ai-generated-photo.png',
        content: Buffer.from(match[2], 'base64'),
        cid: 'aigeneratedphoto@barberapp'
      });
      aiImageHtml = `<img src="cid:aigeneratedphoto@barberapp" alt="AI Generated Photo" style="max-width:180px; border-radius:10px; border:1px solid #ccc;" />`;
    }
  }

  // Attach selected style image from public folder
  if (finalSelection) {
    // finalSelection is like 'short/Caeser Cut.webp'
    const stylePath = `${process.cwd()}/public/hairstyles/${finalSelection}`;
    try {
      const fs = require('fs');
      const styleImage = fs.readFileSync(stylePath);
      attachments.push({
        filename: 'selected-style.webp',
        content: styleImage,
        cid: 'selectedstyle@barberapp'
      });
      selectedStyleHtml = `<img src="cid:selectedstyle@barberapp" alt="Selected Style" style="max-width:180px; border-radius:10px; border:1px solid #ccc;" />`;
    } catch (e) {
      selectedStyleHtml = '<em>Style image not found</em>';
    }
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 12px; border: 1px solid #eee;">
      <h2 style="color: #38d39f; text-align: center;">Barber App Client Summary</h2>
      <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
      <h3 style="margin-bottom: 8px;">Client Photo</h3>
      <div style="text-align: center; margin-bottom: 20px;">
        ${uploadedImageHtml}
      </div>
      <h3 style="margin-bottom: 8px;">Selected Style</h3>
      <div style="text-align: center; margin-bottom: 20px;">
        ${selectedStyleHtml}
      </div>
      <h3 style="margin-bottom: 8px;">AI-Generated Result</h3>
      <div style="text-align: center; margin-bottom: 20px;">
        ${aiImageHtml}
      </div>
      <h3 style="margin-bottom: 8px;">AI Assumptions</h3>
      <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
        <tbody>
          ${assumptions ? Object.entries(assumptions).map(([k, v]) => `<tr><td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: 500; color: #333;'>${k}</td><td style='padding: 8px; border-bottom: 1px solid #eee; color: #555;'>${v}</td></tr>`).join('') : '<tr><td colspan="2">No assumptions</td></tr>'}
        </tbody>
      </table>
      <h3 style="margin-bottom: 8px;">Client Feedback</h3>
      <div style="background: #f7fafc; padding: 12px; border-radius: 8px;">
        <div style="margin-bottom: 8px;"><b>Likes:</b> ${feedback?.likes || '<em>None provided</em>'}</div>
        <div><b>Dislikes:</b> ${feedback?.dislikes || '<em>None provided</em>'}</div>
      </div>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: emailFrom,
      to: emailTo,
      subject: 'Barber App Client Summary',
      html,
      attachments,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email', detail: String(error) });
  }
} 