import React from 'react';
import './terminos-condiciones-style.css'; // Importa tu CSS

export default function TerminosYCondiciones() {
  return (
    <div className="terminos-container">
      <h1 className="titulo">Términos y Condiciones de Uso de Astrae</h1>
      <p className="actualizacion">Última actualización: 27 de abril de 2025</p>

      <section className="section">
        <p>Bienvenido a <strong>Astrae</strong>, plataforma digital que facilita la relación entre inversores y startups. Estos &quot;Términos y Condiciones&quot; (en adelante, &quot;Términos&quot;) rigen el uso de nuestros servicios, la realización de inversiones y la prestación de cualquier otro servicio ofrecido a través de nuestro sitio web y aplicaciones.</p>
      </section>

      <section className="section">
        <h2 className="subtitulo">1. Aceptación de los Términos</h2>
        <p>Al registrarse, navegar o utilizar la plataforma Astrae (&quot;Astrae&quot;, &quot;nosotros&quot;, &quot;la Plataforma&quot;), usted (&quot;Usuario&quot;, &quot;Inversor&quot; o &quot;Startup&quot;, según corresponda) acepta estos Términos y nuestra Política de Privacidad. Si no está de acuerdo con alguno de los términos, no debe utilizar la Plataforma.</p>
      </section>

      <section className="section">
        <h2 className="subtitulo">2. Definiciones</h2>
        <ul className="lista">
          <li><strong>Usuario</strong>: Persona física o jurídica que accede o utiliza Astrae.</li>
          <li><strong>Inversor</strong>: Usuario que ofrece fondos a una Startup.</li>
          <li><strong>Startup</strong>: Usuario que solicita fondos de Inversores.</li>
          <li><strong>Oferta</strong>: Propuesta de inversión realizada por un Inversor.</li>
          <li><strong>Escrow</strong>: Servicio de custodia temporal de fondos gestionado por Astrae.</li>
          <li><strong>PaymentMethod</strong>: Método de pago registrado por el Usuario.</li>
        </ul>
      </section>

      <section className="section">
        <h2 className="subtitulo">3. Registro y Cuenta</h2>
        <ol className="lista">
          <li>Para acceder a funciones de inversión o publicación de proyectos, debe crear una cuenta con datos veraces y actualizados.</li>
          <li>Cada Usuario es responsable de mantener la confidencialidad de sus credenciales y de cualquier actividad bajo su cuenta.</li>
          <li>Nos reservamos el derecho de suspender o cancelar cuentas por incumplimiento de estos Términos.</li>
        </ol>
      </section>

      <section className="section">
        <h2 className="subtitulo">4. Proceso de Inversión</h2>
        <ol className="lista">
          <li>El Inversor selecciona una Startup y realiza una Oferta indicando monto y porcentaje.</li>
          <li>Se requiere aceptación de los Términos y condiciones y validación de un PaymentMethod válido.</li>
          <li>Al confirmar la Oferta, se genera un <strong>paymentIntent</strong> en Stripe y los fondos quedan retenidos (custodia) hasta la aceptación por la Startup.</li>
          <li>Una vez aceptada, Astrae procederá a capturar los fondos y generar la transferencia a la Startup, aplicando las comisiones correspondientes.</li>
        </ol>
      </section>

      <section className="section">
        <h2 className="subtitulo">5. Responsabilidades del Usuario</h2>
        <h3 className="subsubtitulo">Inversor</h3>
        <ul className="lista">
          <li>Verificar la viabilidad de la Startup antes de invertir.</li>
          <li>Proporcionar información financiera veraz.</li>
          <li>Aceptar los riesgos asociados a la inversión.</li>
        </ul>
        <h3 className="subsubtitulo">Startup</h3>
        <ul className="lista">
          <li>Proporcionar información real y actualizada sobre su proyecto.</li>
          <li>Cumplir con las obligaciones pactadas tras la recepción de fondos.</li>
        </ul>
      </section>

      <section className="section">
        <h2 className="subtitulo">6. Responsabilidades de Astrae</h2>
        <ul className="lista">
          <li>Facilitar la plataforma tecnológica para la ejecución de Ofertas y custodia de fondos.</li>
          <li>Aplicar un <strong>3% de comisión</strong> sobre cada inversión realizada.</li>
          <li>No asumir responsabilidad por el rendimiento o fracaso de las inversiones.</li>
          <li>Gestionar el escrow de fondos conforme al flujo acordado.</li>
        </ul>
      </section>

      <section className="section">
        <h2 className="subtitulo">7. Tarifas y Comisiones</h2>
        <p><strong>Comisión de Inversión</strong>: 3% del monto ofrecido.<br />
        <strong>Comisión de Transferencia</strong> (si aplica): Costes de red y bancarios.<br />
        Todas las comisiones se deducirán automáticamente antes de la transferencia de fondos.</p>
      </section>

      <section className="section">
        <h2 className="subtitulo">8. Pagos y Transferencia de Fondos</h2>
        <ol className="lista">
          <li>Los pagos se procesan mediante Stripe. Usted garantiza que su PaymentMethod es válido.</li>
          <li>Los fondos quedan en custodia hasta la aceptación de la Oferta.</li>
          <li>Astrae realizará la transferencia a la Startup en un plazo máximo de 30 días hábiles.</li>
        </ol>
      </section>

      <section className="section">
        <h2 className="subtitulo">9. Riesgos de Inversión</h2>
        <ul className="lista">
          <li>Toda inversión conlleva riesgo de pérdida parcial o total.</li>
          <li>Astrae no garantiza ningún rendimiento.</li>
          <li>El Inversor asume la total responsabilidad por sus decisiones de inversión.</li>
        </ul>
      </section>

      <section className="section">
        <h2 className="subtitulo">10. Protección de Datos y Privacidad</h2>
        <p>Tratamos sus datos conforme a nuestra <strong>Política de Privacidad</strong>. Puede ejercer sus derechos de acceso, rectificación, supresión y oposición dirigiéndose a contacto@astrae.com.</p>
      </section>

      <section className="section">
        <h2 className="subtitulo">11. Modificaciones de los Términos</h2>
        <ol className="lista">
          <li>Astrae puede actualizar estos Términos en cualquier momento.</li>
          <li>Publicaremos la versión actualizada en la Plataforma indicando la fecha.</li>
          <li>El uso continuado de la Plataforma tras cambios implica aceptación de los nuevos Términos.</li>
        </ol>
      </section>

      <section className="section">
        <h2 className="subtitulo">12. Terminación y Suspensión</h2>
        <ol className="lista">
          <li>Podemos suspender o terminar su acceso a la Plataforma por incumplimiento o causa justificada.</li>
          <li>Usted puede cerrar su cuenta en cualquier momento; sus inversiones pendientes se procesarán según los términos vigentes.</li>
        </ol>
      </section>

      <section className="section">
        <h2 className="subtitulo">13. Legislación Aplicable y Jurisdicción</h2>
        <p>Estos Términos se rigen por la legislación española. Cualquier disputa se someterá a la jurisdicción de los tribunales de Madrid.</p>
      </section>

      <section className="section">
        <h2 className="subtitulo">14. Contacto</h2>
        <p><strong>Astrae S.L.</strong><br />
        Email: contacto@astrae.com<br />
        Dirección: Calle Ejemplo, 123, 28000 Madrid, España
        </p>
      </section>

      <p className="final">Gracias por confiar en Astrae. ¡Bienvenido al futuro de la inversión en startups!</p>
    </div>
  );
}
