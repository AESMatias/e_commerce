import Link from "next/link";
import { siteConfig } from "@/config/site";

const email = siteConfig.contactEmail;

/** The terms page in Spanish. Keep en.tsx in step with any change. */
export const termsEs = {
  intro: (
    <p>
      Estos términos se aplican cuando usas este sitio y cuando reservas o compras un paquete. Al
      pagar un anticipo confirmas que los leíste y los aceptas, incluida la{" "}
      <a href="#refunds">política de anticipos y reembolsos</a>.
    </p>
  ),
  body: (
    <>
      <h2>1. Quién presta el servicio</h2>
      <p>
        {siteConfig.name} es una marca operada por {siteConfig.legalOperator.es}{" "}
        (&ldquo;nosotros&rdquo;). Contacto: <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>2. Paquetes y precios</h2>
      <ul>
        <li>
          Cada paquete indica su alcance, precio, plazo y entregables. Los precios se muestran en
          la moneda que aparece junto a ellos.
        </li>
        <li>
          El precio publicado es un punto de partida para el alcance descrito.{" "}
          <strong>
            El alcance, el precio y el calendario finales se acuerdan contigo en la llamada inicial
          </strong>{" "}
          y se confirman por escrito antes de empezar cualquier otro trabajo.
        </li>
        <li>
          El trabajo fuera del alcance acordado se cotiza por separado y solo se hace con tu
          aprobación.
        </li>
      </ul>

      <h2>3. La reserva y la llamada inicial</h2>
      <ul>
        <li>
          Si eliges un horario, queda reservado durante 35 minutos mientras pagas el anticipo. Si
          el anticipo no se paga en ese tiempo, la reserva se libera.
        </li>
        <li>
          Si prefieres coordinar la llamada más tarde, te contactamos por email o WhatsApp después
          del pago para acordar un horario.
        </li>
        <li>La llamada inicial dura unos 30 minutos y es en línea.</li>
      </ul>

      <h2 id="refunds">4. Política de anticipos y reembolsos</h2>
      <p>
        El anticipo confirma tu reserva y aparta nuestro tiempo para tu proyecto.{" "}
        <strong>Se descuenta por completo del precio del paquete</strong> que reservaste.
      </p>

      <aside>
        <strong>El anticipo no es reembolsable una vez que se cumple cualquiera de estas condiciones:</strong>
        <ul>
          <li>la llamada inicial ya se realizó;</li>
          <li>cancelas o reprogramas con menos de 24 horas de anticipación a la llamada;</li>
          <li>no te presentas a la llamada agendada sin avisar;</li>
          <li>
            en reservas sin horario definido, no respondes a nuestros mensajes para coordinar
            dentro de los 14 días siguientes al pago;
          </li>
          <li>el trabajo en tu proyecto ya comenzó a petición tuya.</li>
        </ul>
      </aside>

      <h3>Cuándo se reembolsa el anticipo completo</h3>
      <ul>
        <li>Cancelas al menos 24 horas antes de la llamada agendada.</li>
        <li>En reservas sin horario definido, cancelas antes de acordar un horario para la llamada.</li>
        <li>
          Nosotros cancelamos la llamada, o no podemos realizarla, y no aceptas el horario
          alternativo que te ofrecemos.
        </li>
        <li>Se te cobró dos veces o por error, o tu horario ya no estaba disponible.</li>
      </ul>

      <h3>Cómo funcionan los reembolsos</h3>
      <p>
        Para cancelar o pedir un reembolso, escribe a <a href={`mailto:${email}`}>{email}</a>{" "}
        desde el email con el que reservaste. Los reembolsos aprobados vuelven al medio de pago
        original a través de Stripe. Tu banco puede tardar entre 5 y 10 días hábiles en
        reflejarlos.
      </p>
      <p>
        Como el anticipo reserva una fecha específica y nuestro tiempo para ti, y en la medida en
        que la ley lo permita, el derecho de retracto del artículo 3 bis de la Ley 19.496 no se
        aplica al anticipo una vez que se cumple cualquiera de las condiciones anteriores. Esto no
        limita ninguna garantía legal a la que tengas derecho si no prestamos el servicio.
      </p>

      <h2>5. Pago del resto del precio</h2>
      <p>
        El resto del precio, descontado el anticipo, se paga según lo acordado en la llamada
        inicial, por ejemplo por hitos o contra entrega. Los entregables pueden retenerse hasta que
        se realicen los pagos correspondientes.
      </p>

      <h2>6. Tus responsabilidades</h2>
      <ul>
        <li>Entregar datos de contacto e información del proyecto correctos.</li>
        <li>
          Proporcionar a tiempo el contenido, los accesos y los comentarios que el proyecto
          necesita. Los retrasos de tu parte mueven el plazo en la misma medida.
        </li>
        <li>
          Asegurarte de tener los derechos sobre cualquier material que nos entregues, como
          textos, imágenes, logos o datos.
        </li>
      </ul>

      <h2>7. Propiedad del trabajo</h2>
      <p>
        Una vez pagado el proyecto por completo, eres dueño de los entregables hechos
        específicamente para ti. Las herramientas, librerías y servicios de terceros mantienen sus
        propias licencias. Podemos reutilizar conocimientos generales y patrones de código no
        confidenciales y, salvo que nos pidas lo contrario, mencionar el proyecto en nuestro
        portafolio sin compartir información confidencial.
      </p>

      <h2>8. Soporte después del lanzamiento</h2>
      <p>
        Cada paquete incluye el período de soporte posterior al lanzamiento que indica su
        descripción, que cubre la corrección de defectos en lo que entregamos. Las funciones nuevas
        o los cambios se cotizan por separado.
      </p>

      <h2>9. El asesor IA</h2>
      <p>
        El asesor IA da una recomendación automática y orientativa. Puede equivocarse y no es una
        cotización ni una oferta vinculante. El alcance y el precio que aplican son los que se
        acuerdan en la llamada inicial.
      </p>

      <h2>10. Limitación de responsabilidad</h2>
      <p>
        Prestamos nuestros servicios con cuidado profesional. En la medida en que la ley lo
        permita, no respondemos por pérdidas indirectas, como lucro cesante o pérdida de datos, y
        nuestra responsabilidad total por un proyecto se limita al monto que pagaste por él. Nada
        en estos términos limita los derechos irrenunciables que te otorga la ley de protección al
        consumidor.
      </p>

      <h2>11. Uso de este sitio</h2>
      <p>
        No hagas un mal uso del sitio, incluido el asesor IA, por ejemplo intentando interrumpirlo,
        sobrecargarlo o acceder a datos que no son tuyos. En esos casos podemos limitar o bloquear
        el acceso.
      </p>

      <h2>12. Cambios en estos términos</h2>
      <p>
        Podemos actualizar estos términos. La versión publicada cuando pagas el anticipo es la que
        se aplica a tu reserva.
      </p>

      <h2>13. Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de Chile. Antes de cualquier reclamo formal,
        escríbenos para intentar resolver el problema juntos. Esto no afecta tu derecho a acudir
        al Servicio Nacional del Consumidor (SERNAC) o a los tribunales competentes.
      </p>

      <p>
        Consulta también nuestra <Link href="/privacy">Política de privacidad</Link>.
      </p>
    </>
  ),
};
