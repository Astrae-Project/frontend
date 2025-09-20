import React from 'react';
import './terminos-condiciones-style.css';

export default function TerminosYCondiciones() {
  return (
    <div className="terminos-container">
      <h1 className="titulo">Términos y Condiciones de Uso</h1>
      <p className="actualizacion">Última actualización: 20 de septiembre de 2025</p>

      <section className="section">
        <p>
          Bienvenido a <strong>Astrae</strong>, una plataforma digital que conecta a
          inversores y startups. Estos Términos y Condiciones (en adelante, &quot;Términos&quot;)
          regulan el acceso y uso de nuestros servicios a través del sitio web y
          aplicaciones. Le rogamos leerlos atentamente antes de utilizar la Plataforma.
        </p>
      </section>

      <section className="section">
        <h2 className="subtitulo">1. Aceptación</h2>
        <p>
          Al registrarse o utilizar Astrae, usted (en adelante, el &quot;Usuario&quot;) acepta
          plenamente estos Términos y nuestra Política de Privacidad. En caso de no estar
          de acuerdo, no debe utilizar la Plataforma.
        </p>
      </section>

      <section className="section">
        <h2 className="subtitulo">2. Registro y Cuenta</h2>
        <ol className="lista">
          <li>Para acceder a ciertas funcionalidades, es necesario crear una cuenta con datos veraces y actualizados.</li>
          <li>El Usuario es responsable de la confidencialidad de sus credenciales y de cualquier actividad realizada en su cuenta.</li>
          <li>Astrae se reserva el derecho de suspender o cancelar cuentas por incumplimiento de los Términos.</li>
        </ol>
      </section>

      <section className="section">
        <h2 className="subtitulo">3. Proceso de Inversión</h2>
        <ol className="lista">
          <li>El Inversor puede realizar una oferta indicando el monto y las condiciones.</li>
          <li>Los fondos quedarán en custodia hasta que la Startup acepte la inversión.</li>
          <li>Una vez aceptada la oferta, Astrae gestionará la transferencia aplicando las comisiones correspondientes.</li>
        </ol>
      </section>

      <section className="section">
        <h2 className="subtitulo">4. Responsabilidades</h2>
        <h3 className="subsubtitulo">Del Inversor</h3>
        <ul className="lista">
          <li>Analizar la viabilidad del proyecto antes de invertir.</li>
          <li>Aceptar los riesgos inherentes a toda inversión.</li>
        </ul>
        <h3 className="subsubtitulo">De la Startup</h3>
        <ul className="lista">
          <li>Facilitar información veraz y actualizada de su proyecto.</li>
          <li>Cumplir con los compromisos adquiridos tras recibir los fondos.</li>
        </ul>
      </section>

      <section className="section">
        <h2 className="subtitulo">5. Comisiones</h2>
        <p>
          Astrae aplicará una comisión del <strong>3% sobre el monto de la inversión</strong>.
          Los costes de transferencia o bancarios, si existieran, serán asumidos por el Usuario.
        </p>
      </section>

      <section className="section">
        <h2 className="subtitulo">6. Riesgos</h2>
        <p>
          Toda inversión conlleva riesgos, incluida la pérdida total o parcial del capital.
          Astrae no garantiza resultados ni se responsabiliza del rendimiento de los proyectos.
        </p>
      </section>

      <section className="section">
        <h2 className="subtitulo">7. Privacidad</h2>
        <p>
          El tratamiento de sus datos personales se realiza conforme a nuestra
          <strong> Política de Privacidad</strong>. Puede ejercer sus derechos escribiendo a
          contacto@astrae.com.
        </p>
      </section>

      <section className="section">
        <h2 className="subtitulo">8. Modificaciones</h2>
        <p>
          Astrae podrá actualizar estos Términos en cualquier momento. La versión vigente
          estará siempre disponible en la Plataforma, indicando la fecha de la última
          actualización.
        </p>
      </section>

      <section className="section">
        <h2 className="subtitulo">9. Legislación y Jurisdicción</h2>
        <p>
          Estos Términos se rigen por la legislación española. Cualquier disputa se
          resolverá en los tribunales de Madrid.
        </p>
      </section>

      <section className="section">
        <h2 className="subtitulo">10. Contacto</h2>
        <p>
          <strong>Astrae S.L.</strong><br />
          Email: contacto@astraesystem.com
        </p>
      </section>

      <p className="final">
        Gracias por confiar en Astrae. Nuestro compromiso es acompañarle en cada paso de su inversión.
      </p>
    </div>
  );
}
