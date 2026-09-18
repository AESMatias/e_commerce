import Link from "next/link";
import { siteConfig } from "@/config/site";

const email = siteConfig.contactEmail;

/** The privacy page in Spanish. Keep en.tsx in step with any change. */
export const privacyEs = {
  intro: (
    <p>
      Esta política explica qué datos personales recopila {siteConfig.name} cuando usas este
      sitio, para qué, con quién se comparten y qué derechos tienes sobre ellos.
    </p>
  ),
  body: (
    <>
      <h2>1. Quién es responsable de tus datos</h2>
      <p>
        {siteConfig.name} es una marca operada por {siteConfig.legalOperator.es}{" "}
        (&ldquo;nosotros&rdquo;). Somos responsables del tratamiento de los datos personales que
        se describen aquí. Para cualquier pregunta o solicitud sobre tus datos, escribe a{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>2. Qué datos recopilamos</h2>
      <h3>Cuando reservas un paquete</h3>
      <ul>
        <li>Tu nombre completo y tu email.</li>
        <li>El nombre de tu empresa y las notas de tu proyecto, si decides darlos.</li>
        <li>El paquete que elegiste y, si elegiste uno, el horario de tu llamada inicial.</li>
      </ul>

      <h3>Cuando pagas el anticipo</h3>
      <p>
        Los pagos los procesa <strong>Stripe</strong>. Los datos de tu tarjeta se ingresan en la
        página de pago de Stripe y nunca llegan a nuestros servidores. Solo recibimos el estado
        del pago, el monto, la moneda y los números de referencia de Stripe.
      </p>

      <h3>Cuando usas el asesor IA</h3>
      <p>
        Los mensajes que escribes se envían a la <strong>API Gemini de Google</strong> para
        generar una respuesta. No guardamos la conversación completa. Cuando el asesor recomienda
        un paquete, guardamos el paquete recomendado, un resumen de una frase de tu problema y la
        explicación que se te mostró, para poder vincularlo con una reserva posterior.
      </p>
      <aside>
        No escribas información personal sensible (salud, finanzas, contraseñas, datos de otras
        personas) en el asesor. Google procesa el texto bajo sus propias condiciones y, según el
        nivel del servicio, puede usarlo para mejorar sus productos.
      </aside>

      <h3>Datos técnicos</h3>
      <ul>
        <li>
          Tu dirección IP, que se usa durante unos minutos en la memoria del servidor para limitar
          cuántos mensajes se pueden enviar al asesor. No la guardamos en nuestra base de datos.
        </li>
        <li>
          Los registros estándar de solicitudes que guarda nuestro proveedor de hosting por
          seguridad y para resolver problemas.
        </li>
      </ul>

      <h2>3. Cookies y almacenamiento del navegador</h2>
      <p>
        No usamos cookies de publicidad ni de analítica, y no te rastreamos en otros sitios. Este
        sitio solo usa lo que necesita para funcionar:
      </p>
      <ul>
        <li>Tu preferencia de tema claro u oscuro, guardada en tu navegador.</li>
        <li>Una cookie que recuerda el idioma que elegiste para el sitio.</li>
        <li>
          Una cookie de sesión para el panel de administración del dueño del sitio, que nunca se
          crea para los visitantes.
        </li>
        <li>Las cookies que Stripe usa en su página de pago para prevenir fraudes.</li>
      </ul>
      <p>Como son estrictamente necesarias, no pedimos consentimiento para las cookies.</p>

      <h2>4. Para qué usamos tus datos</h2>
      <ul>
        <li>
          <strong>Para prestar el servicio que pediste:</strong> reservar tu llamada, cobrar el
          anticipo, contactarte y entregar tu proyecto.
        </li>
        <li>
          <strong>Para recomendarte un paquete</strong> cuando usas el asesor IA.
        </li>
        <li>
          <strong>Para cumplir obligaciones legales</strong>, como llevar registros contables y
          tributarios.
        </li>
        <li>
          <strong>Para mantener el sitio seguro</strong> y prevenir abusos, que es nuestro interés
          legítimo.
        </li>
      </ul>
      <p>Nunca vendemos tus datos y no los usamos para publicidad.</p>

      <h2>5. Con quién los compartimos</h2>
      <p>
        Solo compartimos datos con los proveedores que hacen funcionar este sitio, y solo lo que
        cada uno necesita:
      </p>
      <ul>
        <li>
          <strong>Stripe</strong>: procesamiento de pagos.
        </li>
        <li>
          <strong>Supabase</strong>: base de datos para reservas y recomendaciones.
        </li>
        <li>
          <strong>Google (API Gemini)</strong>: generar las respuestas del asesor IA.
        </li>
        <li>
          <strong>Vercel</strong>: hosting del sitio web.
        </li>
        <li>Un proveedor de envío de emails, para enviarte confirmaciones de reserva.</li>
      </ul>
      <p>
        También podemos revelar datos cuando lo exija la ley o un tribunal o autoridad pública.
      </p>

      <h2>6. Transferencias internacionales</h2>
      <p>
        Estos proveedores pueden almacenar y procesar datos fuera de Chile, incluidos Estados
        Unidos y la Unión Europea. Aplican sus propias medidas de seguridad y garantías
        contractuales para estas transferencias.
      </p>

      <h2>7. Cuánto tiempo los guardamos</h2>
      <ul>
        <li>
          Registros de reservas y pagos: el tiempo necesario para prestar el servicio y, después,
          el plazo que exige la ley tributaria y contable.
        </li>
        <li>
          Reservas no pagadas que vencieron y recomendaciones del asesor: hasta que nos pidas
          borrarlas o hasta que ya no las necesitemos.
        </li>
      </ul>

      <h2>8. Tus derechos</h2>
      <p>Puedes pedirnos en cualquier momento:</p>
      <ul>
        <li>acceder a los datos personales que tenemos sobre ti;</li>
        <li>corregir datos incorrectos o incompletos;</li>
        <li>eliminar tus datos, cuando la ley no nos obligue a conservarlos;</li>
        <li>oponerte a su uso o limitarlo;</li>
        <li>recibir una copia en un formato portable.</li>
      </ul>
      <p>
        Escribe a <a href={`mailto:${email}`}>{email}</a> desde el email que usaste para
        reservar. Respondemos dentro de 30 días.
      </p>

      <h2>9. Seguridad</h2>
      <p>
        Los datos viajan por conexiones cifradas, el acceso a la base de datos está restringido al
        servidor y los datos de las tarjetas los maneja solo Stripe. Ningún sistema es totalmente
        seguro, pero tomamos medidas razonables para proteger tus datos.
      </p>

      <h2>10. Menores de edad</h2>
      <p>
        Este sitio está pensado para empresas y adultos. No recopilamos a sabiendas datos de
        menores de 18 años.
      </p>

      <h2>11. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política. La fecha de arriba indica la versión más reciente. Los
        cambios importantes se destacarán en el sitio. Consulta también nuestros{" "}
        <Link href="/terms">Términos del servicio</Link>.
      </p>
    </>
  ),
};
