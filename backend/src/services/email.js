import nodemailer from 'nodemailer';

// Create transporter (Gmail SMTP)
function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendMail(to, subject, html) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('[Email] SMTP not configured — skipping email to', to);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"InmoCollab" <${process.env.SMTP_USER}>`,
      to, subject, html,
    });
    console.log('[Email] Sent to', to, ':', subject);
  } catch (err) {
    console.error('[Email] Error sending to', to, ':', err.message);
  }
}

const styles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #F7F8FA; }
  .wrap { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
  .hdr { background: #0F1B2D; padding: 24px 32px; }
  .hdr h1 { color: #D4A843; margin: 0; font-size: 20px; letter-spacing: -.3px; }
  .hdr p { color: rgba(255,255,255,.6); margin: 4px 0 0; font-size: 12px; }
  .body { padding: 28px 32px; }
  .body p { color: #4B5563; font-size: 14px; line-height: 1.6; margin: 0 0 12px; }
  .data { background: #F7F8FA; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .data .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #E5E7EB; font-size: 13px; }
  .data .row:last-child { border: none; }
  .data .label { color: #9CA3AF; }
  .data .val { color: #1F2937; font-weight: 600; }
  .cta { display: inline-block; background: #D4A843; color: #0F1B2D; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 8px; }
  .ok { background: #ECFDF5; border-left: 4px solid #10B981; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; color: #065F46; font-size: 13px; }
  .ko { background: #FEE2E2; border-left: 4px solid #EF4444; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; color: #991B1B; font-size: 13px; }
  .warn { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; color: #92400E; font-size: 13px; }
  .footer { padding: 16px 32px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 11px; color: #9CA3AF; }
`;

// 1. Admin: new client registered by agency (needs verification)
export async function emailAdminNewClient({ adminEmail, clientName, clientDni, clientPhone, propertyName, propertyZone, agencyName, agentName }) {
  const html = `<html><head><style>${styles}</style></head><body>
    <div class="wrap">
      <div class="hdr"><h1>🔔 InmoCollab</h1><p>Nueva solicitud de verificación</p></div>
      <div class="body">
        <p>La agencia <strong>${agencyName}</strong> (${agentName}) ha registrado un nuevo cliente y solicita verificación con la promotora.</p>
        <div class="data">
          <div class="row"><span class="label">Cliente</span><span class="val">${clientName}</span></div>
          <div class="row"><span class="label">DNI / NIE</span><span class="val">${clientDni}</span></div>
          <div class="row"><span class="label">Teléfono</span><span class="val">${clientPhone}</span></div>
          <div class="row"><span class="label">Promoción</span><span class="val">${propertyName}</span></div>
          <div class="row"><span class="label">Zona</span><span class="val">${propertyZone}</span></div>
        </div>
        <div class="warn">Recuerda verificar con la promotora en menos de 48h laborables y actualizar el estado en la plataforma.</div>
        <a href="https://inmocollab.pages.dev/app/clients" class="cta">Ver clientes pendientes</a>
      </div>
      <div class="footer">InmoCollab · Costa Blanca · mariatomasa.com</div>
    </div>
  </body></html>`;
  await sendMail(adminEmail, `🔔 Verificación pendiente — ${clientName} (${agencyName})`, html);
}

// 2. Agency: their client has been verified
export async function emailAgencyClientVerified({ agencyEmail, clientName, propertyName, agentName }) {
  const html = `<html><head><style>${styles}</style></head><body>
    <div class="wrap">
      <div class="hdr"><h1>✅ InmoCollab</h1><p>Cliente verificado</p></div>
      <div class="body">
        <p>Hola, <strong>${agentName}</strong>. Buenas noticias:</p>
        <div class="ok"><strong>${clientName}</strong> ha sido verificado con la promotora. No consta en su base de datos. Tu comisión queda protegida.</div>
        <div class="data">
          <div class="row"><span class="label">Cliente</span><span class="val">${clientName}</span></div>
          <div class="row"><span class="label">Promoción</span><span class="val">${propertyName}</span></div>
          <div class="row"><span class="label">Estado</span><span class="val">✅ Verificado</span></div>
        </div>
        <p>Ya puedes acceder a la ficha completa de la promoción y solicitar visita con Janire Hortelano.</p>
        <a href="https://inmocollab.pages.dev/app/pipeline" class="cta">Ir al seguimiento</a>
      </div>
      <div class="footer">InmoCollab · Costa Blanca · mariatomasa.com</div>
    </div>
  </body></html>`;
  await sendMail(agencyEmail, `✅ Cliente verificado — ${clientName} · ${propertyName}`, html);
}

// 3. Agency: their client has been rejected
export async function emailAgencyClientRejected({ agencyEmail, clientName, propertyName, agentName }) {
  const html = `<html><head><style>${styles}</style></head><body>
    <div class="wrap">
      <div class="hdr"><h1>InmoCollab</h1><p>Resultado de verificación</p></div>
      <div class="body">
        <p>Hola, <strong>${agentName}</strong>. Te informamos del resultado de la verificación:</p>
        <div class="ko"><strong>${clientName}</strong> ya consta en la base de datos de la promotora por contacto previo directo. No es posible comisionar esta operación.</div>
        <div class="data">
          <div class="row"><span class="label">Cliente</span><span class="val">${clientName}</span></div>
          <div class="row"><span class="label">Promoción</span><span class="val">${propertyName}</span></div>
          <div class="row"><span class="label">Estado</span><span class="val">❌ No verificable</span></div>
        </div>
        <p>Si tienes dudas sobre este resultado, contacta con Janire Hortelano.</p>
        <a href="https://inmocollab.pages.dev/app/properties" class="cta">Ver otras promociones</a>
      </div>
      <div class="footer">InmoCollab · Costa Blanca · mariatomasa.com</div>
    </div>
  </body></html>`;
  await sendMail(agencyEmail, `Verificación — ${clientName} · ${propertyName}`, html);
}

// 4. Agency: their visit has been confirmed by admin
export async function emailAgencyVisitConfirmed({ agencyEmail, agentName, clientName, propertyName, visitDate, visitTime, notes }) {
  const html = `<html><head><style>${styles}</style></head><body>
    <div class="wrap">
      <div class="hdr"><h1>📅 InmoCollab</h1><p>Visita confirmada</p></div>
      <div class="body">
        <p>Hola, <strong>${agentName}</strong>. Janire ha confirmado la visita:</p>
        <div class="data">
          <div class="row"><span class="label">Cliente</span><span class="val">${clientName}</span></div>
          <div class="row"><span class="label">Promoción</span><span class="val">${propertyName}</span></div>
          <div class="row"><span class="label">Fecha</span><span class="val">${visitDate}</span></div>
          <div class="row"><span class="label">Hora</span><span class="val">${visitTime}</span></div>
          ${notes ? `<div class="row"><span class="label">Notas</span><span class="val">${notes}</span></div>` : ''}
        </div>
        <div class="ok">La visita está confirmada. Janire Hortelano os recibirá en la promoción a la hora indicada.</div>
        <a href="https://inmocollab.pages.dev/app/visits" class="cta">Ver mis visitas</a>
      </div>
      <div class="footer">InmoCollab · Costa Blanca · mariatomasa.com</div>
    </div>
  </body></html>`;
  await sendMail(agencyEmail, `📅 Visita confirmada — ${propertyName} · ${visitDate} ${visitTime}`, html);
}

// 5. Agency: visit request received (just after scheduling)
export async function emailAdminNewVisit({ adminEmail, agentName, agencyName, clientName, propertyName, visitDate, visitTime, notes }) {
  const html = `<html><head><style>${styles}</style></head><body>
    <div class="wrap">
      <div class="hdr"><h1>📅 InmoCollab</h1><p>Nueva solicitud de visita</p></div>
      <div class="body">
        <p><strong>${agencyName}</strong> (${agentName}) ha solicitado una visita:</p>
        <div class="data">
          <div class="row"><span class="label">Cliente</span><span class="val">${clientName}</span></div>
          <div class="row"><span class="label">Promoción</span><span class="val">${propertyName}</span></div>
          <div class="row"><span class="label">Fecha</span><span class="val">${visitDate}</span></div>
          <div class="row"><span class="label">Hora</span><span class="val">${visitTime}</span></div>
          ${notes ? `<div class="row"><span class="label">Notas</span><span class="val">${notes}</span></div>` : ''}
        </div>
        <div class="warn">Confirma o reagenda la visita con la promotora y actualiza el estado en la plataforma.</div>
        <a href="https://inmocollab.pages.dev/app/visits" class="cta">Gestionar visitas</a>
      </div>
      <div class="footer">InmoCollab · Costa Blanca · mariatomasa.com</div>
    </div>
  </body></html>`;
  await sendMail(adminEmail, `📅 Nueva visita — ${propertyName} · ${visitDate}`, html);
}
