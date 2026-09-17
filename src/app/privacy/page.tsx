import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your personal data.`,
};

const email = siteConfig.contactEmail;

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      updated={siteConfig.legalUpdated}
      intro={
        <p>
          This policy explains what personal data {siteConfig.name} collects when you use this
          website, why, who it is shared with and the rights you have over it.
        </p>
      }
    >
      <h2>1. Who is responsible for your data</h2>
      <p>
        {siteConfig.name} is a brand operated by {siteConfig.legalOperator} (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;). We are the data controller for the personal data described here. For
        any question or request about your data, write to{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>2. What data we collect</h2>
      <h3>When you book a package</h3>
      <ul>
        <li>Your full name and email address.</li>
        <li>Your company name and project notes, if you choose to give them.</li>
        <li>The package you chose and, if you picked one, the time of your kickoff call.</li>
      </ul>

      <h3>When you pay the deposit</h3>
      <p>
        Payments are processed by <strong>Stripe</strong>. Your card details are entered on
        Stripe&rsquo;s own checkout page and never reach our servers. We only receive the payment
        status, the amount, the currency and Stripe&rsquo;s reference numbers.
      </p>

      <h3>When you use the AI advisor</h3>
      <p>
        The messages you type are sent to <strong>Google&rsquo;s Gemini API</strong> to generate
        a reply. We do not keep the full conversation. When the advisor recommends a package, we
        store the recommended package, a one-sentence summary of your problem and the reasoning
        shown to you, so a later booking can be linked to it.
      </p>
      <aside>
        Please do not write sensitive personal information (health, finances, passwords, other
        people&rsquo;s data) in the advisor. Google processes the text under its own terms and,
        depending on the service tier, may use it to improve its products.
      </aside>

      <h3>Technical data</h3>
      <ul>
        <li>
          Your IP address, used for a few minutes in server memory to limit how many messages can
          be sent to the advisor. We do not store it in our database.
        </li>
        <li>
          Standard request logs kept by our hosting provider for security and troubleshooting.
        </li>
      </ul>

      <h2>3. Cookies and browser storage</h2>
      <p>
        We do not use advertising or analytics cookies, and we do not track you across other
        websites. This site only uses what it needs to work:
      </p>
      <ul>
        <li>Your light or dark theme preference, saved in your browser.</li>
        <li>A session cookie for the site owner&rsquo;s admin panel, never set for visitors.</li>
        <li>Cookies Stripe sets on its checkout page to prevent fraud.</li>
      </ul>
      <p>Because these are strictly necessary, we do not ask for cookie consent.</p>

      <h2>4. Why we use your data</h2>
      <ul>
        <li>
          <strong>To provide the service you asked for:</strong> reserving your call, taking the
          deposit, contacting you and delivering your project.
        </li>
        <li>
          <strong>To recommend a package</strong> when you use the AI advisor.
        </li>
        <li>
          <strong>To meet legal obligations</strong>, such as keeping accounting and tax records.
        </li>
        <li>
          <strong>To keep the site secure</strong> and prevent abuse, which is our legitimate
          interest.
        </li>
      </ul>
      <p>We never sell your data and we do not use it for advertising.</p>

      <h2>5. Who we share it with</h2>
      <p>We only share data with the providers that run this site, and only what each one needs:</p>
      <ul>
        <li>
          <strong>Stripe</strong>: payment processing.
        </li>
        <li>
          <strong>Supabase</strong>: database hosting for bookings and recommendations.
        </li>
        <li>
          <strong>Google (Gemini API)</strong>: generating the AI advisor&rsquo;s replies.
        </li>
        <li>
          <strong>Vercel</strong>: website hosting.
        </li>
        <li>An email delivery provider, to send you booking confirmations.</li>
      </ul>
      <p>
        We may also disclose data when required by law or by a court or public authority.
      </p>

      <h2>6. International transfers</h2>
      <p>
        These providers may store and process data outside Chile, including in the United States
        and the European Union. They apply their own security measures and contractual safeguards
        for these transfers.
      </p>

      <h2>7. How long we keep it</h2>
      <ul>
        <li>
          Booking and payment records: for as long as needed to provide the service, and afterwards
          for the period required by tax and accounting law.
        </li>
        <li>
          Unpaid bookings that expired and advisor recommendations: until you ask us to delete
          them, or until we no longer need them.
        </li>
      </ul>

      <h2>8. Your rights</h2>
      <p>You can ask us at any time to:</p>
      <ul>
        <li>access the personal data we hold about you;</li>
        <li>correct data that is wrong or incomplete;</li>
        <li>delete your data, when we are not legally required to keep it;</li>
        <li>object to or restrict how we use it;</li>
        <li>receive a copy of it in a portable format.</li>
      </ul>
      <p>
        Write to <a href={`mailto:${email}`}>{email}</a> from the address you used to book. We
        reply within 30 days.
      </p>

      <h2>9. Security</h2>
      <p>
        Data travels over encrypted connections, access to the database is restricted to the
        server, and card details are handled only by Stripe. No system is completely secure, but
        we take reasonable measures to protect your data.
      </p>

      <h2>10. Children</h2>
      <p>
        This site is intended for businesses and adults. We do not knowingly collect data from
        anyone under 18.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy. The date at the top shows the latest version. Significant
        changes will be highlighted on the site. See also our{" "}
        <Link href="/terms">Terms of Service</Link>.
      </p>
    </LegalDocument>
  );
}
