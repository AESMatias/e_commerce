import Link from "next/link";
import { siteConfig } from "@/config/site";

const email = siteConfig.contactEmail;

/** The terms page in English. Keep es.tsx in step with any change. */
export const termsEn = {
  intro: (
    <p>
      These terms apply when you use this website and when you book or buy a package. By
      paying a deposit you confirm that you have read and accept them, including the{" "}
      <a href="#refunds">deposit and refund policy</a>.
    </p>
  ),
  body: (
    <>
      <h2>1. Who provides the service</h2>
      <p>
        {siteConfig.name} is a brand operated by {siteConfig.legalOperator.en} (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;). Contact: <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>2. Packages and prices</h2>
      <ul>
        <li>
          Each package lists its scope, price, timeline and deliverables. Prices are shown in the
          currency displayed next to them.
        </li>
        <li>
          The listed price is a starting point for the described scope.{" "}
          <strong>
            The final scope, price and schedule are agreed with you on the kickoff call
          </strong>{" "}
          and confirmed in writing before any further work starts.
        </li>
        <li>
          Work beyond the agreed scope is quoted separately and only done with your approval.
        </li>
      </ul>

      <h2>3. Booking and the kickoff call</h2>
      <ul>
        <li>
          If you pick a time, the slot is held for 35 minutes while you pay the deposit. If the
          deposit is not paid in that time, the booking is released.
        </li>
        <li>
          If you choose to arrange the call later, we contact you by email or WhatsApp after
          payment to agree on a time.
        </li>
        <li>The kickoff call lasts about 30 minutes and is held online.</li>
      </ul>

      <h2 id="refunds">4. Deposit and refund policy</h2>
      <p>
        The deposit confirms your booking and reserves our time for your project. It is{" "}
        <strong>credited in full toward the price of the package</strong> you booked.
      </p>

      <aside>
        <strong>The deposit is non-refundable once any of these conditions is met:</strong>
        <ul>
          <li>the kickoff call has taken place;</li>
          <li>you cancel or reschedule less than 24 hours before the scheduled call;</li>
          <li>you do not attend the scheduled call without notice;</li>
          <li>
            for bookings without a set time, you do not reply to our scheduling messages within
            14 days of payment;
          </li>
          <li>work on your project has started at your request.</li>
        </ul>
      </aside>

      <h3>When the deposit is refunded in full</h3>
      <ul>
        <li>You cancel at least 24 hours before the scheduled call.</li>
        <li>
          For bookings without a set time, you cancel before a call time has been agreed.
        </li>
        <li>
          We cancel the call, or cannot hold it, and you do not accept the alternative time we
          offer.
        </li>
        <li>You were charged twice or by mistake, or your slot was no longer available.</li>
      </ul>

      <h3>How refunds work</h3>
      <p>
        To cancel or ask for a refund, write to <a href={`mailto:${email}`}>{email}</a> with the
        email you booked with. Approved refunds go back to the original payment method through
        Stripe. Your bank may take 5 to 10 business days to show them.
      </p>
      <p>
        Because the deposit reserves a specific date and our time for you, and to the extent the
        law allows, the right of withdrawal (<em>derecho de retracto</em>) under article 3 bis of
        Chilean Law 19.496 does not apply to the deposit once any of the conditions above is met.
        This does not limit any legal guarantee you are entitled to if we fail to provide the
        service.
      </p>

      <h2>5. Payment of the remaining price</h2>
      <p>
        The rest of the price, after the deposit, is paid as agreed on the kickoff call, for
        example in milestones or on delivery. Deliverables may be withheld until the corresponding
        payments are made.
      </p>

      <h2>6. Your responsibilities</h2>
      <ul>
        <li>Give accurate contact details and project information.</li>
        <li>
          Provide the content, access and feedback the project needs in reasonable time. Delays on
          your side move the timeline accordingly.
        </li>
        <li>
          Make sure you have the rights to any material you give us, such as text, images, logos
          or data.
        </li>
      </ul>

      <h2>7. Ownership of the work</h2>
      <p>
        Once the project is paid in full, you own the deliverables made specifically for you.
        Third-party tools, libraries and services keep their own licences. We may reuse general
        know-how and non-confidential code patterns, and, unless you ask us not to, mention the
        project in our portfolio without sharing confidential information.
      </p>

      <h2>8. Support after launch</h2>
      <p>
        Each package includes the post-launch support period listed in its description, covering
        fixes to defects in what we delivered. New features or changes are quoted separately.
      </p>

      <h2>9. The AI advisor</h2>
      <p>
        The AI advisor gives an automated, guiding recommendation. It can make mistakes and it is
        not a quote or a binding offer. The scope and price that apply are the ones agreed on the
        kickoff call.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        We provide our services with professional care. To the extent the law allows, we are not
        liable for indirect losses, such as lost profits or lost data, and our total liability for
        a project is limited to the amount you paid for it. Nothing in these terms limits rights
        that consumer protection law gives you and that cannot be waived.
      </p>

      <h2>11. Use of this website</h2>
      <p>
        Do not misuse the site, including the AI advisor, for example by trying to disrupt it,
        overload it or access data that is not yours. We may limit or block access in those cases.
      </p>

      <h2>12. Changes to these terms</h2>
      <p>
        We may update these terms. The version published when you pay the deposit is the one that
        applies to your booking.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These terms are governed by the laws of Chile. Before any formal claim, please write to us
        so we can try to solve the issue together. This does not affect your right to go to the
        consumer protection authority (SERNAC) or the competent courts.
      </p>

      <p>
        See also our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </>
  ),
};
