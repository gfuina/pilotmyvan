import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      );
    }

    // Send email
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: "contact@pilotmyvan.com",
      replyTo: email,
      subject: `[PilotMyVan Contact] Message de ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">
                P<span style="color: #ff6b35;">M</span>V
              </h1>
              <p style="color: #cccccc; margin: 8px 0 0 0; font-size: 11px;">PilotMyVan</p>
              <p style="color: #ff6b35; margin: 12px 0 0 0; font-size: 14px; font-weight: bold;">Nouveau message de contact</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;"><strong>De :</strong> ${name}</p>
                <p style="margin: 0; color: #666; font-size: 14px;"><strong>Email :</strong> <a href="mailto:${email}" style="color: #ff6b35; text-decoration: none;">${email}</a></p>
              </div>
              
              <div style="background: #fff; padding: 20px; border-left: 4px solid #ff6b35; margin-bottom: 20px;">
                <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">Message :</h3>
                <p style="color: #333; font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${message}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px;">
                  Répondre par email
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
                Ce message a été envoyé via le formulaire de contact de PilotMyVan
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Message envoyé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}

