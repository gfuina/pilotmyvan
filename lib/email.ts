import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Vérifiez votre adresse email - PilotMyVan",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
                P<span style="color: #ff6b35;">M</span>V
              </h1>
              <p style="color: #cccccc; margin: 8px 0 0 0; font-size: 12px;">PilotMyVan</p>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1a1a1a; margin-top: 0;">Bienvenue sur la route ! 🚐</h2>
              
              <p style="color: #555; font-size: 16px; margin: 20px 0;">
                Nous sommes ravis de vous accueillir dans la communauté PilotMyVan.
              </p>
              
              <p style="color: #555; font-size: 16px; margin: 20px 0;">
                Pour commencer à prendre soin de votre maison roulante, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
              </p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);">
                  Vérifier mon email
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; margin: 30px 0 10px 0;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="color: #ff6b35; font-size: 14px; word-break: break-all; margin: 0;">
                ${verificationUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 13px; margin: 0;">
                Si vous n'avez pas créé de compte sur PilotMyVan, vous pouvez ignorer cet email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
}

